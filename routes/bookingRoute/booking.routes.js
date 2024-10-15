import express from "express";
import {addBooking,getBookingsByAdminId,updateBooking,deleteBooking,updateCheckOut } from "../../controllers/booking/booking.js";
import  {authMiddleware,checkAdminRole}  from "../../middleware/authMiddleware.js";
import {uploadFile} from "../../middleware/upload.js";

const router = express.Router();


router.post('/addBooking/:documentThumbnail', authMiddleware,uploadFile, addBooking);

// Get all rooms
router.get('/getBookings', authMiddleware, getBookingsByAdminId);

// Update a room
router.put('/updateBooking/:id/:documentThumbnail', authMiddleware,uploadFile, updateBooking);

router.put('/update-departDate-Booking/:id', updateCheckOut);

// Delete a room (only accessible by admins)
router.delete('/deleteBooking/:id', authMiddleware,checkAdminRole, deleteBooking);

export default router;
