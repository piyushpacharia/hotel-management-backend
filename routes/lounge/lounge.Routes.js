import express from "express";
import {createLounge,getLounges,deleteLounge,updateLounge } from "../../controllers/lounge/lounge.js";
import { authMiddleware, checkAdminRole } from "../../middleware/authMiddleware.js";
import { uploadFile } from "../../middleware/upload.js";

const router = express.Router();


router.post('/add-lounge/:loungeThumbnail', authMiddleware, uploadFile, createLounge);

// Get all rooms
router.get('/get-lounge', authMiddleware, getLounges);

// Update a room
router.put('/update-lounge/:loungeId/:loungeThumbnail', authMiddleware, uploadFile, updateLounge);



// Delete a room (only accessible by admins)
router.delete('/delete-lounge/:loungeId', authMiddleware, checkAdminRole, deleteLounge);

export default router;
