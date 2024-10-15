import mongoose from "mongoose";

const bookingSourceSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'adminAuth',
        
    },
    bookingSourceName: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String 
    },
    date: {
        type: Date,
        default: Date.now,
    }
},
    {
        timestamps: true,
    }
);

const bookingSourceModel = mongoose.model('bookingSourceModel', bookingSourceSchema);

export default bookingSourceModel;
