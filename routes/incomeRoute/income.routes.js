import express from "express";
import {
    addIncome, getIncomes, updateIncome, deleteIncome
} from "../../controllers/income/income.js";

import{ authMiddleware,checkAdminRole} from "../../middleware/authMiddleware.js";

const router = express.Router();

// Route to add a new room category
router.post("/addIncome", authMiddleware, addIncome);

// Route to get all room categories
router.get("/getIncomes", authMiddleware, getIncomes);

// Route to update a room category by ID
router.put("/updateIncome/:id", authMiddleware, updateIncome);

// Route to delete a room category by ID
router.delete("/deleteIncome/:id", authMiddleware,checkAdminRole, deleteIncome);

export default router;
