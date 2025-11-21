import mongoose from "mongoose";

const photoSchema = new mongoose.Schema({
  schoolId: String,
  mealType: String, // breakfast, lunch...
  photoUrl: String,
  uploadedBy: String,
  timestamp: { type: Date, default: Date.now },
  remarks: [
    {
      officerId: String,
      text: String,
      status: String, // good / issue
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

export default mongoose.model("Photo", photoSchema);
