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

    // Post to Twitter immediately after successful upload and web portal sync
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

const handleTwitterPosting = async ({ photo, schoolId, mealType, userId }) => {
  try {
    if (!twitterService.isAvailable()) {
      console.log("Twitter posting skipped - twitter service unavailable");
      await Photo.findByIdAndUpdate(photo._id, {
        twitterStatus: "skipped",
      }).catch(() => {});
      return;
    }

    const user = await User.findById(userId);
    const schoolIdentifiers = [schoolId, user?.schoolId].filter(Boolean);
    let school = null;
    for (const identifier of schoolIdentifiers) {
      school = await findSchoolByIdentifier(identifier);
      if (school) break;
    }

    if (!school || !user) {
      const missingReasons = [];
      if (!school) {
        missingReasons.push(
          `school not found (tried identifiers: ${
            schoolIdentifiers.join(", ") || "none"
          })`
        );
      }
      if (!user) missingReasons.push("user not found");

      console.log(
        "Twitter posting skipped - " + missingReasons.join(", ")
      );
      await Photo.findByIdAndUpdate(photo._id, {
        twitterStatus: "skipped",
      }).catch(() => {});
      return;
    }

    const wardenName = user.name || user.phone || "Warden";

    // Check for other pending photos for the same school and meal type
    const pendingPhotos = await Photo.find({
      schoolId: photo.schoolId,
      mealType: mealType,
      twitterStatus: { $in: [null, "pending"] },
    }).sort({ timestamp: 1 });

    // If we have 4 or more pending photos, batch them (up to 4)
    if (pendingPhotos.length >= 4) {
      const batch = pendingPhotos.slice(0, 4);
      const payload = batch.map((item) =>
        buildTwitterPhotoPayload(item, school.name, wardenName)
      );

      console.log(
        `Posting ${batch.length} photos to Twitter for ${school.name} (batch)`
      );

      const results = await twitterService.postMultipleWardenPhotos(payload);
      if (results && results.length) {
        const tweetId = results[0]?.id;
        await Photo.updateMany(
          { _id: { $in: batch.map((p) => p._id) } },
          {
            $set: {
              twitterStatus: "posted",
              twitterPostId: tweetId,
            },
          }
        );
        console.log(`Successfully posted ${batch.length} photos to Twitter`);
      } else {
        console.warn("Twitter batch post failed - leaving photos as pending");
      }
    } else {
      // Post single photo or small batch immediately
      const payload = buildTwitterPhotoPayload(photo, school.name, wardenName);

      if (pendingPhotos.length > 1) {
        // Multiple photos but less than 4 - batch them
        const batchPayload = pendingPhotos.map((item) =>
          buildTwitterPhotoPayload(item, school.name, wardenName)
        );
        console.log(
          `Posting ${pendingPhotos.length} photos to Twitter for ${school.name} (small batch)`
        );
        const results = await twitterService.postMultipleWardenPhotos(batchPayload);
        if (results && results.length) {
          const tweetId = results[0]?.id;
          await Photo.updateMany(
            { _id: { $in: pendingPhotos.map((p) => p._id) } },
            {
              $set: {
                twitterStatus: "posted",
                twitterPostId: tweetId,
              },
            }
          );
          console.log(`Successfully posted ${pendingPhotos.length} photos to Twitter`);
        } else {
          console.warn("Twitter batch post failed - leaving photos as pending");
        }
      } else {
        // Single photo - post immediately
        console.log(`Posting single photo to Twitter for ${school.name}`);
        const result = await twitterService.postWardenPhoto(payload);
        if (result) {
          await Photo.findByIdAndUpdate(photo._id, {
            twitterStatus: "posted",
            twitterPostId: result.id,
          });
          console.log("Photo posted to Twitter successfully");
        } else {
          console.warn("Twitter post failed - leaving photo as pending");
        }
      }
    }
  } catch (error) {
    console.warn("Twitter integration error:", error.message);
    // Keep photo as pending so it can be retried later if needed
  }
};
