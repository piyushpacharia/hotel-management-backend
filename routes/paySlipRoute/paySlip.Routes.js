import express from 'express';
import { addPayslip, getPayslip, updatePayslip, deletePayslip ,editStatusPayslip} from '../../controllers/salarySlip/salarySlipController.js';
import { authMiddleware } from "../../middleware/authMiddleware.js";


const router = express.Router();

router.post('/add-payslip', authMiddleware, addPayslip);
router.get('/get-payslip', authMiddleware, getPayslip);
router.put('/update-payslip/:payslipId', authMiddleware, updatePayslip);
router.delete('/delete-payslip/:payslipId', authMiddleware, deletePayslip);
router.put('/status-edit-payslip/:payslipId', authMiddleware, editStatusPayslip);


export default router;