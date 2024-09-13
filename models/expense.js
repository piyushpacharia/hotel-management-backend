import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'adminAuth',
    },
    expenseName: { type: String, required: true },
    expenseType: { type: String, required: true },
    expenseThumbnail: {
        type: String,
        default: null,
    },
    expenseAmount: { type: Number, required: true },

    description: { type: String }
},
    {
        timestamps: true,
    }
);

const expenseModel = mongoose.model('expenseModel', expenseSchema);

export default expenseModel

