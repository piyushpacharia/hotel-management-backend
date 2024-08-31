import express from "express";
import { adminSignup, login,subAdminRegister } from "../../controllers/auth/auth.js";

import  uploadFile  from "../../middleware/upload.js";
import  authMiddleware  from "../../middleware/authMiddleware.js"

const router = express.Router();

// Signup routes
router.post('/adminSignup', uploadFile.single('profileThumbnail'), adminSignup);



router.post('/subAdminSignup', authMiddleware, subAdminRegister);

// Login route
router.post('/signin', login);

export default router;
