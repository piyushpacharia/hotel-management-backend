import express from "express";
import {
  addAttendance,
 getAttendance,getEmployeeAttendance,updateAttendance,deleteAttendance

} from "../../controllers/attendance/attendance.js";

import { authMiddleware, checkAdminRole } from "../../middleware/authMiddleware.js";

const router = express.Router();

// Add new attendance record
router.post("/add-attendance", authMiddleware, addAttendance);

// Get attendance by employee (user) ID
router.post("/get-employee-attendence", authMiddleware, getEmployeeAttendance);


// Get all attendance by date
router.get("/get-attendance", authMiddleware, getAttendance);

// Edit attendance by attendance ID
router.put("/edit-attendance/:attendanceId", authMiddleware, updateAttendance);


// Delete attendance by attendance ID (Admin only)
router.delete("/delete-attendance/:attendanceId", authMiddleware, checkAdminRole, deleteAttendance);

export default router;
