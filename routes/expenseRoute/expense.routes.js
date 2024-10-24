import express from "express";
import {
  addExpense,getExpenses,deleteExpense,updateExpense
} from "../../controllers/expense/expense.js"; 

import {authMiddleware,checkAdminRole} from "../../middleware/authMiddleware.js";
import { uploadFile}  from "../../middleware/upload.js";

const router = express.Router();

// Route to add a new room category
router.post("/addExpense/:expenseThumbnail",authMiddleware,uploadFile ,addExpense);

// Route to get all room categories
router.get("/getExpenses",authMiddleware, getExpenses);

// Route to update a room category by ID
router.put("/updateExpense/:id/:expenseThumbnail",authMiddleware,uploadFile, updateExpense);

// Route to delete a room category by ID
router.delete("/deleteExpense/:id",authMiddleware,checkAdminRole, deleteExpense);

export default router;
