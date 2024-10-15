import mongoose from "mongoose";

const ledgerSchema = new mongoose.Schema(
    {
        openingBalance: { type: Number, default: null },
        description: { type: String },
        type: { type: String },
        closingBalance:{type:Number , default:null},
        closingDate:{type:Date , default:null},
    },
    { timestamps: true }
);

export const ledgerModel = mongoose.model("ledgers", ledgerSchema);

