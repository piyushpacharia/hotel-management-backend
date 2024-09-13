import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'adminAuth',
        required: true,
    },
    roomNumber: { type: Number, required: true, unique: true },
    type: { type: mongoose.Schema.Types.ObjectId, ref: "roomCategoryModel", required: true },
    rent: { type: Number, required: true, min: 0 },
    bedCapacity: { type: Number, required: true, min: 1 },
    airConditioner: {
        type: String,
        enum: ["ac", "non ac"],
        required: true
    },
    status: {
        type: String,
        enum: ["booked", "open", "inactive"],
        default: "open"
    },
},
    {
        timestamps: true,
    });

// Adding index on roomNumber for efficient querying
roomSchema.index({ roomNumber: 1 });

const roomModel = mongoose.model('room', roomSchema);

export default roomModel;
