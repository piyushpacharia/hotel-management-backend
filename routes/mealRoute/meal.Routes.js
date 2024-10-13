import express from 'express';
import { addMeal,getMeals,updateMeal,deleteMeal } from '../../controllers/meal/mealController.js'
import { authMiddleware } from "../../middleware/authMiddleware.js";


const router = express.Router();

router.post('/add-meal', authMiddleware, addMeal);
router.get('/get-meal', authMiddleware, getMeals);
router.put('/update-meal/:mealId', authMiddleware, updateMeal);
router.delete('/delete-meal/:mealId', authMiddleware, deleteMeal);


export default router;
