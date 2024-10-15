import express from "express";
import { addBookingSource, getBookingSources, deleteBookingSource } from "../../controllers/bookingSource/bookingSource.js";
import { authMiddleware, checkAdminRole } from "../../middleware/authMiddleware.js";
import { uploadFile } from "../../middleware/upload.js";

const router = express.Router();


router.post('/add-booking-source', authMiddleware, addBookingSource);


router.get('/get-booking-source', authMiddleware, getBookingSources);


router.delete('/delete-booking-source/:bookingSoureceId', authMiddleware, deleteBookingSource);

export default router;
