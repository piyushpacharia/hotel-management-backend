import mongoose from 'mongoose';

const subAdminSchema = new mongoose.Schema(
  {
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
    status: {  
      type: String,
      enum: ['active', 'deactive'],  
      default: 'active',  
    },
    role: {
      type: String,
      enum: ['subAdmin'],
      default: 'subAdmin',
    },
  },
  {
    timestamps: true,  
  }
);

const subAdminModel = mongoose.model('subAdminAuth', subAdminSchema);

export default subAdminModel;
