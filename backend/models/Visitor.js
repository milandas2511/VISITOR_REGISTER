import mongoose from "mongoose";

const visitorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    mobile: {
      type: String,
      required: true,
      trim: true
    },
    company: {
      type: String,
      required: true,
      trim: true
    },
    personToMeet: {
      type: String,
      required: true,
      trim: true
    },
    purpose: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Visitor", visitorSchema);
