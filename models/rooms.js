
import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'adminAuth',
    },

    roomNumber: { type: Number, required: true, unique: true, default: 0 },
    type: { type: String, required: true },
    rent: { type: Number, required: true },
    bedCapacity: {
        type: Number,
        required: true
    },
    amenities: [{ type: String }],
    status: {
        type: String,
        enum: ["booked", "open", "inactive"],
        default: "open"
    },
},
    {
        timestamps: true,
    });

const roomModel = mongoose.model('roomModel', roomSchema);

export default roomModel

