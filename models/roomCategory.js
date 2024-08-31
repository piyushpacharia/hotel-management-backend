import mongoose from "mongoose";

const roomCategorySchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'adminAuth',
    },
    type: { type: String, required: true }
},
    {
        timestamps: true,
    }
);

const roomCategory = mongoose.model('roomCategoryModel', roomCategorySchema);

export default roomCategory

