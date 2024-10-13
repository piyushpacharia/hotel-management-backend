import mongoose from "mongoose";

const taxSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'adminModel',
    },
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    type: {
        type: String,
        enum: ["fixed", "percentage"]
    },

    description: { type: String }

},
    {
        timestamps: true,
    }
);

const taxModel = mongoose.model('tax', taxSchema);

export default taxModel

