import express from "express";
import { createLoungeBooking,getLoungeBookings,deleteLoungeBooking,updateCheckOut,updateBookingStatus} from "../../controllers/loungeBooking/loungeBooking.js";
import { authMiddleware, checkAdminRole } from "../../middleware/authMiddleware.js";
import { uploadFile } from "../../middleware/upload.js";

const router = express.Router();


router.post('/book-lounge', authMiddleware, createLoungeBooking);


router.get('/get-book-lounge', authMiddleware, getLoungeBookings);


router.put('/updateCheckOut-lounge/:bookingId', authMiddleware, updateCheckOut);


router.put('/updateBookingStatus-lounge/:bookingId', authMiddleware, updateBookingStatus);

// Delete a room (only accessible by admins)
router.delete('/delete-book-lounge/:id', authMiddleware, checkAdminRole, deleteLoungeBooking);

export default router;
