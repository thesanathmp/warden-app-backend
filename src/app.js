import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import photoRoutes from "./routes/photoRoutes.js";
import remarkRoutes from "./routes/remarkRoutes.js";
import schoolRoutes from "./routes/schoolRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/photos", photoRoutes);
app.use("/remarks", remarkRoutes);
app.use("/schools", schoolRoutes);

export default app;
