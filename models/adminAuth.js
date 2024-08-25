import mongoose from 'mongoose';

const adminAuthSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    number: {
        type: Number
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
    imageUrl: {
        type: String,
        default: '',
    },
}, {
    timestamps: true,
});

const Admin = mongoose.model('adminAuth', adminAuthSchema);

export default Admin;
