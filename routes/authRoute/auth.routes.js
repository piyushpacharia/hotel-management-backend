import express from "express";
import { adminSignup, login, subAdminRegister, deleteSubAdmin, getSubAdmin, profileThumbnail, editSubAdminDetails, editSubAdminStatus } from "../../controllers/auth/auth.js";

import {uploadFile} from "../../middleware/upload.js";
import {authMiddleware,checkAdminRole} from "../../middleware/authMiddleware.js"

const router = express.Router();

// Signup routes
router.post('/adminSignup/:profileThumbnail', uploadFile, adminSignup);

router.post('/subAdminSignup', authMiddleware, subAdminRegister);

router.delete('/deleteSubAdmin/:id', authMiddleware,checkAdminRole, deleteSubAdmin);

router.get('/getSubAdmin', authMiddleware, getSubAdmin);

router.post('/profile-thumbnail', authMiddleware, profileThumbnail);

router.put('/editStatus/:id', authMiddleware,checkAdminRole, editSubAdminStatus);

// Route to edit the details of a sub-admin
router.put('/editDetails/:id', authMiddleware, editSubAdminDetails);

// Login route
router.post('/signin', login);

export default router;
