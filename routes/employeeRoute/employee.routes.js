import express from "express";
import {
    addEmployee,
    getAllEmployees,
    editEmployee,
    deleteEmployee,
    updateEmployeeStatus

} from "../../controllers/employee/employee.js";

import { authMiddleware, checkAdminRole } from "../../middleware/authMiddleware.js";
import { uploadFile } from "../../middleware/upload.js";

const router = express.Router();


router.post("/add-employee/:employeeThumbnail/:employeDeocument", authMiddleware, uploadFile, addEmployee);


router.get("/get-employees", authMiddleware, getAllEmployees);


router.put("/edit-employee/:id/:employeeThumbnail/:employeeDocument", authMiddleware, uploadFile, editEmployee);

router.put("/edit-status/:id", authMiddleware, updateEmployeeStatus);

router.delete("/delete-employee/:id", authMiddleware, checkAdminRole, deleteEmployee);

export default router;
