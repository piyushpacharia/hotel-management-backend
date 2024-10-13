import mealModel from "../../models/meal.js";
import Joi from "joi";


// Add Meal Controller
export const addMeal = async (req, res) => {
    // Joi schema for validation
    const schema = Joi.object({
        name: Joi.string().min(3).max(100).required(),
        price: Joi.number().min(0).required(),
        description: Joi.string().allow(""),
        category: Joi.string().valid('Vegetarian', 'Non-Vegetarian', 'Vegan'),
        isAvailable: Joi.boolean(),

    });

    // Validate request body
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({success:false, message: error.details[0].message });

   
    try {

        const adminId = req.user.adminId || req.user._id
        const { name, price, description, category } = req.body

        const newMeal = new mealModel({name, price, description, category, adminId});
        await newMeal.save();
        res.status(201).json({success:true, message: 'Meal added successfully', newMeal });
    } catch (err) {
        console.log(err)
        res.status(500).json({success:false, message: 'Server error', err });
    }
};

// Get All Meals Controller
export const getMeals = async (req, res) => {
    const adminId = req.user.adminId || req.user._id


    try {
        const meals = await mealModel.find({ adminId: adminId });
        res.status(200).json(meals);
    } catch (err) {
        res.status(500).json({ message: 'Server error', err });
    }
};


// Update Meal Controller
export const updateMeal = async (req, res) => {
    // Joi schema for validation
    const schema = Joi.object({
        name: Joi.string().min(3).max(100),
        price: Joi.number().min(0),
        description: Joi.string(),
        category: Joi.string().valid('Vegetarian', 'Non-Vegetarian', 'Vegan'),
        isAvailable: Joi.boolean(),

    });

    // Validate request body
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({success:false, message: error.details[0].message });

    const { mealId } = req.params
    const { name, price, description, category } = req.body
    try {
        const updatedMeal = await mealModel.findByIdAndUpdate(mealId, { name, price, description, category }, { new: true });
        if (!updatedMeal) return res.status(404).json({success:false, message: 'Meal not found' });
        res.status(200).json({success:true, message: 'Meal updated successfully', updatedMeal });
    } catch (err) {
        res.status(500).json({success:false, message: 'Server error', err });
    }
};


// Delete Meal Controller
export const deleteMeal = async (req, res) => {
    const { mealId } = req.params
    try {
        const meal = await mealModel.findByIdAndDelete(mealId);
        if (!meal) return res.status(404).json({success:false ,message: 'Meal not found' });
        res.status(200).json({success:true, message: 'Meal deleted successfully' });
    } catch (err) {
        res.status(500).json({success:false, message: 'Server error', err });
    }
};
