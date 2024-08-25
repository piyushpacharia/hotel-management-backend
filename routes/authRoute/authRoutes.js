import express from "express";
import { adminSignup, login } from "../../controllers/auth/adminAuth/adminAuth.js";
import { subAdminRegister } from "../../controllers/auth/subAdminAuth/subAdminAuth.js";
import { upload } from "../../middleware/upload.js";
import { authMiddleware } from "../../middleware/authMiddleware.js"

const router = express.Router();

// Signup routes
router.post('/adminSignup', upload.single('image'), adminSignup);


router.post('/subAdminSignup', authMiddleware, subAdminRegister);

// Login route
router.post('/signin', login);

export default router;
