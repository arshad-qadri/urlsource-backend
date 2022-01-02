import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    private: { type: Boolean, default: true },
  },
  { timestamp: true }
);

export default mongoose.model("User", userSchema, "users");
