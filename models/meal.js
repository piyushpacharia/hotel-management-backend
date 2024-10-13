import mongoose from "mongoose";

const mealSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'adminAuth',
        required: true,
    },
    name: { 
        type: String, 
        required: true,
        trim: true,             
        minlength: 3,             
        maxlength: 100}
        ,         
    price: {
        type: Number,           
        required: true,           
        min: 0,                   
    },
    description: { 
        type: String,
                 
    },
    category: {
        type: String,
        enum: ['Vegetarian', 'Non-Vegetarian', 'Vegan'], 
        default: 'Vegetarian',
    },
    isAvailable: {
        type: Boolean,
        default: true,            
    },
   
},
{
    timestamps: true, 
});

const mealModel = mongoose.model('mealModel', mealSchema);

export default mealModel;
