import mongoose from "mongoose";

const loungeSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'adminAuth',
        required: true,
    },
    loungeNumber: { type: Number, required: true, unique: true },
    rent: { type: Number, required: true, min: 0 },
    loungeThumbnail:[{ type: Array }],
    status: {
        type: String,
        enum: ["booked", "open", "inactive"],
        default: "open"
    },
},
    {
        timestamps: true,
    });

// Adding index on loungeNumber for efficient querying
loungeSchema.index({ loungeNumber: 1 });

const loungeModel = mongoose.model('lounge', loungeSchema);

export default loungeModel;
