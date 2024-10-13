import mongoose from "mongoose";

const additionServiceSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'adminAuth',
        required: true,
    },
    roomNumber: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'room',
        required: true,
    },
    amount: {
        type: Number
    },
    description: {
        type: String
    }
},
    {
        timestamps: true,
    });

const additionServiceModel = mongoose.model('additionService', additionServiceSchema);

export default additionServiceModel;
