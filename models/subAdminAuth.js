import mongoose from 'mongoose';

const subAdminSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'adminAuth',
    },
    name: {
        type: String,
        required: true,
        trim: true,
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
        enum: ['subAdmin'],
        default: 'subAdmin',
    },
}, {
    timestamps: true,
});

const subAdmin = mongoose.model('subAdminAuth', subAdminSchema);

export default subAdmin;
