import express from "express";
import { addPackage,getPackages,updatePackage,deletePackage} from "../../controllers/package/package.js";
import  {authMiddleware ,checkAdminRole}  from "../../middleware/authMiddleware.js";

const router = express.Router();


router.post('/addPackage', authMiddleware, addPackage);

// Get all rooms
router.get('/getPackages', authMiddleware, getPackages);

// Update a room
router.put('/updatePackage/:id', authMiddleware, updatePackage);

// Delete a room (only accessible by admins)
router.delete('/deletePackage/:id', authMiddleware,checkAdminRole, deletePackage);

export default router;
