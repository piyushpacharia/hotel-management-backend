import mongoose from "mongoose";

const roomCategorySchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'adminAuth',
    },
    type: { type: String, required: true , unique: true,},
    
    numberOfRooms: {
        type: Number,
        required: true,
        default: 0

    },
},
    {
        timestamps: true,
    }
);

const roomCategoryModel = mongoose.model('roomCategoryModel', roomCategorySchema);

export default roomCategoryModel

