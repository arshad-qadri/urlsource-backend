import mongoose from "mongoose";

const Schema = mongoose.Schema;

const urlSchema = new Schema(
  {
    userId: { type: String, required: true },
    title: { type: String, required: true },
    url: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("UrlSource", urlSchema, "urlSources");
