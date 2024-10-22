import mongoose from "mongoose";

const loungeBookingSchema = new mongoose.Schema(
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
            enum: ["active", "deActive"],
            default: "active"
        },
        advanceloungeBookingAmount: {
            type: Number,
            default: 0,
        },
        remainingloungeBookingAmount: {
            type: Number,
            default: 0,
        },
        loungeBookingPaymentStatus: {
            type: String,
            enum: ["paid", "pending"],
            default: "pending",
        },
        loungeNo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "lounge",
            required: true,
        },
        tax: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "tax",
            default: null,
        },
        loungeBookingSourceId: {
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
        note: {
            type: String,
        },
        loungeBookingAmount: {
            type: Number,
        },
        discount: {
            type: String
        }
    },
    {
        timestamps: true,
    }
);

const loungeBookingModel = mongoose.model("loungeBooking", loungeBookingSchema);

export default loungeBookingModel;
