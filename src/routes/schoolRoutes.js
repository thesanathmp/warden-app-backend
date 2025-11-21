import express from "express";
import { createSchool, getAllSchools, getSchoolById } from "../controllers/schoolController.js";
import { auth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Test route without auth for debugging
router.get("/test", getAllSchools);

router.post("/", auth(["super_admin", "district_officer"]), createSchool);
router.get("/", auth(["warden", "tdo", "officer", "district_officer", "super_admin"]), getAllSchools);
router.get("/:id", auth(["warden", "tdo", "officer", "district_officer", "super_admin"]), getSchoolById);

export default router;