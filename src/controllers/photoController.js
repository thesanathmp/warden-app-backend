import Photo from "../models/Photo.js";
import cloudinary from "../config/cloudinary.js";

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
    });

    console.log("Photo saved to database:", photo);

    // Sync photo to web portal immediately after successful upload
    try {
      const webPortalPayload = {
        schoolId: schoolId,
        mealType: req.body.mealType,
        photoUrl: result.secure_url,
        uploadedBy: req.user.id,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        timestamp: photo.timestamp
      };

      console.log('Attempting to sync photo to web portal:', webPortalPayload);

      const webPortalResponse = await fetch('http://localhost:5010/api/warden-photos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webPortalPayload)
      });

      if (webPortalResponse.ok) {
        const syncResult = await webPortalResponse.json();
        console.log('Photo synced to web portal successfully:', syncResult);
      } else {
        const errorText = await webPortalResponse.text();
        console.warn('Failed to sync to web portal:', webPortalResponse.status, errorText);
      }
    } catch (syncError) {
      console.warn('Web portal sync failed:', syncError.message);
      // Don't fail the main upload if web portal sync fails
    }

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
