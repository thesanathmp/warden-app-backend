import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  phone: String,
  password: String, // hashed
  role: { type: String, required: true },
  schoolId: { type: String }, // for wardens
});

export default mongoose.model("User", userSchema);
