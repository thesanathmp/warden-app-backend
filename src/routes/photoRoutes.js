import express from "express";
import multer from "multer";
import { uploadPhoto, getPhotosBySchool } from "../controllers/photoController.js";
import { auth } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload", auth(["warden"]), upload.single("photo"), uploadPhoto);
router.get("/:schoolId", auth(["tdo", "officer", "district_officer", "super_admin"]), getPhotosBySchool);

export default router;
