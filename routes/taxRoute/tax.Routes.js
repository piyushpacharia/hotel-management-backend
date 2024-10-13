import express from "express";
import { createTax,getAllTaxes,updateTax,deleteTax } from "../../controllers/tax/taxController.js";
import { authMiddleware, checkAdminRole } from "../../middleware/authMiddleware.js";

const router = express.Router();


router.post('/add-tax', authMiddleware, createTax);

router.get('/get-taxs', authMiddleware, getAllTaxes);

router.put('/update-tax/:taxId', authMiddleware, updateTax);

router.delete('/delete-tax/:taxId', authMiddleware, checkAdminRole, deleteTax);

export default router;
