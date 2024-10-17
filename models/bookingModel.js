import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "adminAuth",
      required: true,
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
      enum: ["male", "female", "other"],
      required: true,
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
    status: {
      type: String,
      enum:["active" , "deActive"] ,
      default:"active"
    },

    advanceBookingAmount: {
      type: Number,
      default: 0,
    },
    remainingBookingAmount: {
      type: Number,
      default: 0,
    },
    bookingPaymentStatus: {
      type: String,
      enum: ["paid", "pending"],
      default: "pending",
    },
    documentThumbnail: [
      {
        type: String, 
      },
    ],
    packages: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "packageModel",
      default: null,
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
      type: mongoose.Schema.Types.ObjectId,
      ref: "mealModel",
      default: null,
    },
    tax: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tax",
      default: null,
    },
    bookingSourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "bookingSourceModel",
      default: null,
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
