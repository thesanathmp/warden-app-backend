import mongoose from "mongoose";
import Photo from "../models/Photo.js";
import School from "../models/School.js";
import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";
import twitterService from "../utils/twitter.js";

const findSchoolByIdentifier = async (identifier) => {
  if (!identifier) return null;

  const trimmed = identifier.toString().trim();
  if (!trimmed) return null;

  // Try by custom schoolId field
  const bySchoolId = await School.findOne({ schoolId: trimmed });
  if (bySchoolId) return bySchoolId;

  // Try by ObjectId
  if (mongoose.isValidObjectId(trimmed)) {
    const byId = await School.findById(trimmed);
    if (byId) return byId;
  }

  // Try by name as a last resort (helps during manual testing)
  return School.findOne({ name: trimmed });
};

const TWITTER_BATCH_SIZE = Number(process.env.TWITTER_BATCH_SIZE || 4);
const TWITTER_BATCH_WINDOW_MINUTES = Number(process.env.TWITTER_BATCH_WINDOW_MINUTES || 10);
const TWITTER_SINGLE_FALLBACK_MINUTES = Number(process.env.TWITTER_SINGLE_FALLBACK_MINUTES || 5);

export const uploadPhoto = async (req, res) => {
  try {
    console.log("Upload request received");
    console.log("File:", req.file);
    console.log("Body:", req.body);
    console.log("User:", req.user);

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const file = req.file.path;
    console.log("File path:", file);

    const result = await cloudinary.uploader.upload(file, {
      folder: "school-food",
    });
    console.log("Cloudinary upload result:", result);

    // Use schoolId from form data if provided, otherwise fall back to user's schoolId
    const schoolId = req.body.schoolId || req.user.schoolId;
    
    if (!schoolId) {
      return res.status(400).json({ message: "School ID is required" });
    }

    const photo = await Photo.create({
      schoolId: schoolId,
      mealType: req.body.mealType,
      photoUrl: result.secure_url,
      uploadedBy: req.user.id,
      twitterStatus: "pending",
    });

    console.log("Photo saved to database:", photo);

    // Sync photo to web portal immediately after successful upload
    try {
      const portalBaseUrl = process.env.WEB_PORTAL_URL?.replace(/\/+$/, "");
      if (!portalBaseUrl) {
        console.warn("WEB_PORTAL_URL not set; skipping web-portal sync");
      } else {
        const webPortalPayload = {
          schoolId: schoolId,
          mealType: req.body.mealType,
          photoUrl: result.secure_url,
          uploadedBy: req.user.id,
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimeType: req.file.mimetype,
          timestamp: photo.timestamp,
        };

        console.log("Attempting to sync photo to web portal:", webPortalPayload);

        // Use dynamic import for fetch to ensure compatibility
        const fetch = (await import("node-fetch")).default;
        const webPortalResponse = await fetch(
          `${portalBaseUrl}/api/warden-photos`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(webPortalPayload),
          }
        );

        if (webPortalResponse.ok) {
          const syncResult = await webPortalResponse.json();
          console.log("Photo synced to web portal successfully:", syncResult);
        } else {
          const errorText = await webPortalResponse.text();
          console.warn(
            "Failed to sync to web portal:",
            webPortalResponse.status,
            errorText
          );
        }
      }
    } catch (syncError) {
      console.warn("Web portal sync failed:", syncError.message);
      // Don't fail the main upload if web portal sync fails
    }

    // Post to Twitter after successful upload and web portal sync
    await handleTwitterPosting({
      photo,
      schoolId,
      mealType: req.body.mealType,
      userId: req.user.id,
    });

    res.json({ success: true, photo });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ 
      message: "Upload failed", 
      error: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

export const getPhotosBySchool = async (req, res) => {
  const photos = await Photo.find({ schoolId: req.params.schoolId })
    .sort({ timestamp: -1 });
  res.json(photos);
};

const buildTwitterPhotoPayload = (photo, schoolName, wardenName) => ({
  id: photo._id,
  schoolId: photo.schoolId,
  schoolName,
  mealType: photo.mealType,
  photoUrl: photo.photoUrl,
  timestamp: photo.timestamp,
  wardenName,
});

const markPhotosAsPosted = async (photoIds, tweetId) => {
  await Photo.updateMany(
    { _id: { $in: photoIds } },
    {
      $set: {
        twitterStatus: "posted",
        twitterPostId: tweetId,
        twitterBatchKey: tweetId,
      },
    }
  );
};

const handleTwitterPosting = async ({ photo, schoolId, mealType, userId }) => {
  try {
    if (!twitterService.isAvailable()) {
      console.log("Twitter posting skipped - twitter service unavailable");
      return;
    }

    const user = await User.findById(userId);
    const schoolIdentifiers = [schoolId, user?.schoolId].filter(Boolean);
    let school = null;
    for (const identifier of schoolIdentifiers) {
      school = await findSchoolByIdentifier(identifier);
      if (school) break;
    }

    const missingReasons = [];
    if (!school) {
      missingReasons.push(
        `school not found (tried identifiers: ${
          schoolIdentifiers.join(", ") || "none"
        })`
      );
    }
    if (!user) missingReasons.push("user not found");

    if (missingReasons.length) {
      console.log(
        "Twitter posting skipped - " +
          (missingReasons.length ? missingReasons.join(", ") : "unknown reason")
      );
      await Photo.findByIdAndUpdate(photo._id, {
        twitterStatus: "skipped",
        twitterBatchKey: missingReasons.join(" | "),
      }).catch(() => {});
      return;
    }

    const wardenName = user.name || user.phone || "Warden";
    let shouldContinue = true;

    while (shouldContinue) {
      const pendingPhotos = await Photo.find({
        schoolId: photo.schoolId,
        mealType,
        twitterStatus: { $in: [null, "pending"] },
      }).sort({ timestamp: 1 });

      if (!pendingPhotos.length) {
        return;
      }

      const windowStart = new Date(
        Date.now() - TWITTER_BATCH_WINDOW_MINUTES * 60 * 1000
      );
      const batchCandidates = pendingPhotos.filter(
        (item) => new Date(item.timestamp) >= windowStart
      );

      if (batchCandidates.length >= TWITTER_BATCH_SIZE) {
        const batch = batchCandidates.slice(0, TWITTER_BATCH_SIZE);
        const payload = batch.map((item) =>
          buildTwitterPhotoPayload(item, school.name, wardenName)
        );

        console.log(
          `Attempting multi-photo Twitter post for ${school.name} (${payload.length} photos)`
        );

        const results = await twitterService.postMultipleWardenPhotos(payload);
        if (results && results.length) {
          const tweetId = results[0]?.id;
          await markPhotosAsPosted(
            batch.map((p) => p._id),
            tweetId
          );
          continue;
        } else {
          console.warn("Twitter batch post failed - leaving photos pending");
          return;
        }
      }

      shouldContinue = false;

      const oldestPending = pendingPhotos[0];
      if (!oldestPending) {
        return;
      }

      const ageMinutes =
        (Date.now() - new Date(oldestPending.timestamp).getTime()) / 60000;

      if (
        ageMinutes >= TWITTER_SINGLE_FALLBACK_MINUTES &&
        TWITTER_SINGLE_FALLBACK_MINUTES >= 0
      ) {
        console.log(
          `Posting single photo to Twitter after waiting ${ageMinutes.toFixed(
            1
          )} minutes`
        );
        const result = await twitterService.postWardenPhoto(
          buildTwitterPhotoPayload(oldestPending, school.name, wardenName)
        );
        if (result) {
          await markPhotosAsPosted([oldestPending._id], result.id);
        }
      } else {
        console.log(
          `Waiting for more photos before Twitter post. Pending: ${pendingPhotos.length}`
        );
      }
    }
  } catch (error) {
    console.warn("Twitter integration error:", error.message);
  }
};
