import mongoose from "mongoose";

const ledgerHistorySchema = new mongoose.Schema(
    {
        ledgerId: { type: mongoose.Types.ObjectId, ref: "ledgers" },
        type: { type: String },
        credit: { type: Number, default: null },
        debit: { type: Number, default: null },
        description: { type: String },
    },
    { timestamps: true }
);

export const ledgerHistoryModel = mongoose.model("ledgerHistory", ledgerHistorySchema);

