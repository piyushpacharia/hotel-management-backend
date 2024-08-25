import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'adminAuth',
    },
    roomNumber: { type: Number, required: true, unique: true },
    type: { type: String, required: true }, 
    price: { type: Number, required: true },
    amenities: [{ type: String }], 
    availability: { type: Boolean, default: true },
    description: { type: String },
    images: [{ type: String }],

},
    {
        timestamps: true,
    });

const Room = mongoose.model('Room', roomSchema);

export default Room

