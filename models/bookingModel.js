
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "adminAuth",
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"]
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
   
    documentThumbnail: {type:Array},
    packages: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "packageModel",
      required: true,
    },
    roomType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "roomCategoryModel",
      required: true,
    },
    roomNo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "room",
      required: true,
    },
    meal: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "none"],
      default: "none",
    },
    arrivedDate: {
      type: Date,
      default: Date.now,
    },
    departDate: {
      type: Date,
      required: true,
    },
    totalPerson: {
      type: Number,
      required: true,
    },
    note: {
      type: String,
    },
    bookingAmount: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const bookingModel = mongoose.model("booking", bookingSchema);

export default bookingModel;
