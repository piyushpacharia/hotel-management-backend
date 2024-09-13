import express from "express";
import { addRoom, getRooms, updateRoom, deleteRoom } from "../../controllers/room/room.js";
import { authMiddleware, checkAdminRole } from "../../middleware/authMiddleware.js";

const router = express.Router();


router.post('/addRoom', authMiddleware, addRoom);

// Get all rooms
router.get('/getRooms', authMiddleware, getRooms);

// Update a room
router.put('/updateRoom/:id', authMiddleware, updateRoom);

// Delete a room (only accessible by admins)
router.delete('/deleteRoom/:id', authMiddleware, checkAdminRole, deleteRoom);

export default router;
