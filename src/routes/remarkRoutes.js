import express from "express";
import { addRemark } from "../controllers/remarkController.js";
import { auth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", auth(["tdo", "officer", "district_officer"]), addRemark);

export default router;
