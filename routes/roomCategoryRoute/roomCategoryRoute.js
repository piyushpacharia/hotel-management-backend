import express from "express";
import {
  addRoomCategory,
  getRoomCategories,
  updateRoomCategory,
  deleteRoomCategory,
} from "../../controllers/roomCategory/roomCategory.js"; 

import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

// Route to add a new room category
router.post("/addRoomCategory", authMiddleware,addRoomCategory);

// Route to get all room categories
router.get("/getRoomCategories",authMiddleware, getRoomCategories);

// Route to update a room category by ID
router.put("/updateRoomCategory/:id",authMiddleware, updateRoomCategory);

// Route to delete a room category by ID
router.delete("/deleteRoomCategory/:id",authMiddleware, deleteRoomCategory);

export default router;
