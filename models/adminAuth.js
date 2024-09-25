
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
    status: {
        type: String,
        enum: ['active', 'deactive'],
        default: 'active',
    },
    profileThumbnail: {
        type: Array,
        default: null,
    },
}, {
    timestamps: true,
});

const adminModel = mongoose.model('adminModel', adminAuthSchema);

export default adminModel;
