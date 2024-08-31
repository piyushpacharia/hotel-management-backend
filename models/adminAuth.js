import mongoose from 'mongoose';

const adminAuthSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    number: {
        type: String, 
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['admin'],
        required: true,
    },
    profile_thumbnail: {
        type: String,
        default: null, 
    },
}, {
    timestamps: true, 
});

const adminModel = mongoose.model('AdminModel', adminAuthSchema); 

export default adminModel;
