
import mongoose from "mongoose";
const packageSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminAuth', 
    },
    packages: {
        type: String,
        required: true,
        unique: true,
    },
    price:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:true
    }
}, {
    timestamps: true,
});

const packageModel = mongoose.model('packageModel', packageSchema);

export default packageModel;
