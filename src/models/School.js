import mongoose from "mongoose";

const schoolSchema = new mongoose.Schema({
  schoolId: String,
  name: String,
  district: String,
});

export default mongoose.model("School", schoolSchema);
