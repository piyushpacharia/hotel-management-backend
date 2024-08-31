import mongoose from "mongoose";

const incomeSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'adminAuth',
    },
    incomeName: { type: String, required: true },
    incomeType: { type: String, required: true },
    incomeAmount: { type: Number, required: true },
    description: { type: String }
},
    {
        timestamps: true,
    }
);

const incomeModel = mongoose.model('incomeModel', incomeSchema);

export default incomeModel

