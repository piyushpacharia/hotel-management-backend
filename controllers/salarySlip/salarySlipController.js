import paySlipModel from '../../models/salarySlip.js';
import attendanceModel from '../../models/attendance.js';
import employeeModel from '../../models/employeeModel.js';
import taxModel from '../../models/tax.model.js';
import expenseModel from "../../models/expense.js"
import Joi from 'joi';
import { ledgerModel } from "../../models/ledger.model.js"
import { ledgerHistoryModel } from "../../models/ledgerHistory.model.js"

// Joi Schema for Payslip Validation
const payslipSchema = Joi.object({
    employeeId: Joi.string().required(),
    salaryMonth: Joi.string().required(),
    basicSalary: Joi.number().optional(),
    allowances: Joi.object({
        housingAllowance: Joi.number().allow("").min(0).default(0),
        transportAllowance: Joi.number().allow("").min(0).default(0),
        otherAllowances: Joi.number().allow("").min(0).default(0),
    }),
    deductions: Joi.object({
        tax: Joi.any().allow(""),
        socialSecurity: Joi.number().allow("").min(0).default(0),
        otherDeductions: Joi.number().allow("").min(0).default(0),
        providentFund: Joi.number().allow("").min(0).default(0),
        esi: Joi.number().allow("").min(0).default(0),
    }),
    comments: Joi.string().allow(null, ''),
    status: Joi.string().valid('Paid', 'Pending', 'Processing').default('Pending'),
});

// Add a new payslip based on attendance
// Add a new payslip based on attendance
export const addPayslip = async (req, res) => {
    try {
        const { error, value } = payslipSchema.validate(req.body, { abortEarly: false });
        if (error) {
            return res.status(400).json({ success: false, message: 'Validation error', errors: error.details });
        }

        const { employeeId, salaryMonth, allowances, deductions, comments } = value;
        const adminId = req.user.adminId || req.user._id;

        // Check if the ledger is open
        const ledger = await ledgerModel.findOne({ closingBalance: null });
        if (!ledger) {
            return res.status(401).json({ success: false, message: "Open Ledger First" });
        }

        // Find employee and verify if exists
        const employee = await employeeModel.findById(employeeId);
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        // Check if a payslip already exists for the given employee and month
        const existingPayslip = await paySlipModel.findOne({ employeeId, salaryMonth });
        if (existingPayslip) {
            return res.status(400).json({ success: false, message: 'Payslip already exists for this employee in the specified month' });
        }

        const basicSalary = employee.salary;
        const firstDayOfMonth = new Date(`${salaryMonth}-01`);
        const lastDayOfMonth = new Date(firstDayOfMonth.getFullYear(), firstDayOfMonth.getMonth() + 1, 0);
        const workingDays = lastDayOfMonth.getDate();

        // Fetch attendance records for the employee
        const attendanceRecords = await attendanceModel.find({
            employeeId,
            createdAt: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
        });

        if (!attendanceRecords.length) {
            return res.status(404).json({ success: false, message: 'No attendance records found for the employee in the given month' });
        }

        // Calculate attendance summary
        const attendanceSummary = {
            presentDays: 0,
            absentDays: 0,
            onLeaveDays: 0,
            lateDays: 0,
        };

        attendanceRecords.forEach(({ status }) => {
            attendanceSummary[`${status}Days`] += 1;
        });

        const { presentDays, absentDays, onLeaveDays, lateDays } = attendanceSummary;

        // Salary calculation
        const dailySalary = basicSalary / workingDays;
        const absentPenalty = dailySalary * absentDays;
        const latePenalty = lateDays * 0.5 * dailySalary;

        // Fetch and calculate tax deduction
        let taxDeduction = 0;
        if (deductions.tax) {
            const taxDetails = await taxModel.findById(deductions.tax);
            if (taxDetails) {
                taxDeduction = taxDetails.type === 'fixed'
                    ? taxDetails.amount
                    : (basicSalary * taxDetails.amount) / 100;
            }
        }

        // Total allowances and deductions
        const totalAllowances = Object.values(allowances).reduce((acc, val) => acc + (val || 0), 0);
        let totalDeductions = [taxDeduction, deductions.socialSecurity, deductions.otherDeductions, deductions.providentFund, deductions.esi]
            .reduce((acc, val) => acc + (val || 0), absentPenalty + latePenalty);

        totalDeductions = totalDeductions || 0;

        // Net salary calculation
        const netSalary = (basicSalary + totalAllowances) - totalDeductions;

        // Create and save payslip
        const newPayslip = new paySlipModel({
            adminId,
            employeeId,
            salaryMonth,
            basicSalary,
            allowances,
            deductions,
            netSalary,
            totalAllowances,
            totalDeductions,
            attendanceSummary: { workingDays, presentDays, absentDays, lateDays, onLeaveDays },
            comments,
        });

        // Log transaction in ledger history
        await ledgerHistoryModel.create({
            ledgerId: ledger._id,
            type: "Employee Salary",
            debit: netSalary,
            description: `Salary paid to: ${employee.firstName} ${employee.lastName}`,
        });

        const savedPayslip = await newPayslip.save();
        return res.status(201).json({ success: true, message: 'Payslip added successfully', payslip: savedPayslip });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Error creating payslip' });
    }
};


// Get a payslip 

export const getPayslip = async (req, res) => {
    try {
        const adminId = req.user.adminId || req.user._id;

        // Ensure adminId is present
        if (!adminId) {
            return res.status(400).json({ success: false, message: 'Admin ID is required' });
        }

        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        const month = req.query.month || currentMonth;
        const year = req.query.year || currentYear;

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 1);

        // Fetch payslips for the admin in the specified or current month
        const payslips = await paySlipModel.find({
            adminId: adminId,
            createdAt: {
                $gte: startDate,
                $lt: endDate,
            },
        }).populate([
            { path: "employeeId", select: "firstName lastName" },
            { path: "deductions.tax", select: "name amount " }
        ]);

        if (!payslips || payslips.length === 0) {
            return res.status(404).json({ success: false, message: 'No payslips found for the specified month' });
        }

        return res.status(200).json({ success: true, payslips });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Error fetching payslips', error: error.message });
    }
};





// Update a payslip by ID
export const updatePayslip = async (req, res) => {
    const { payslipId } = req.params;

    try {
        // Validate request body using Joi schema
        const { error, value } = payslipSchema.validate(req.body, { abortEarly: false });

        if (error) {
            return res.status(400).json({ success: false, message: 'Validation error', errors: error.details });
        }

        const { employeeId, salaryMonth, allowances, deductions, comments } = value;
        const adminId = req.user.adminId || req.user._id;

        // Check if the employee exists
        const employee = await employeeModel.findById(employeeId);
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        const basicSalary = employee.salary;

        // Calculate the first and last day of the salary month
        const firstDayOfMonth = new Date(`${salaryMonth}-01`);
        const lastDayOfMonth = new Date(firstDayOfMonth.getFullYear(), firstDayOfMonth.getMonth() + 1, 0);

        // Fetch attendance data for the employee for the given salaryMonth
        const attendanceRecords = await attendanceModel.find({
            employeeId,
            createdAt: {
                $gte: firstDayOfMonth,
                $lte: lastDayOfMonth,
            },
        });

        if (!attendanceRecords || attendanceRecords.length === 0) {
            return res.status(404).json({ success: false, message: 'No attendance records found for the employee in the given month' });
        }

        // Calculate the total number of days in the month
        const workingDays = lastDayOfMonth.getDate();

        // Calculate attendance summary
        const presentDays = attendanceRecords.filter(record => record.status === 'present').length;
        const absentDays = attendanceRecords.filter(record => record.status === 'absent').length;
        const onLeaveDays = attendanceRecords.filter(record => record.status === 'onLeave').length;
        const lateDays = attendanceRecords.filter(record => record.status === 'late').length;

        // Salary calculation based on attendance
        const dailySalary = basicSalary / workingDays;

        // Penalties for absences and lateness
        const absentPenalty = dailySalary * absentDays;
        const latePenalty = lateDays * 0.5 * dailySalary;


        // Fetch tax information based on the deduction's tax field
        const taxDetails = await taxModel.findById(deductions.tax);


        if (!taxDetails) {
            return res.status(404).json({ success: false, message: 'Tax information not found' });
        }

        // Calculate tax deduction based on its type
        let taxDeduction = 0;
        if (taxDetails.type === 'fixed') {
            taxDeduction = taxDetails.amount;
        } else if (taxDetails.type === 'percentage') {
            taxDeduction = (basicSalary * taxDetails.amount) / 100;
        }

        // Total allowances and deductions
        const totalAllowances =
            (allowances.housingAllowance || 0) +
            (allowances.transportAllowance || 0) +
            (allowances.otherAllowances || 0);

        const totalDeductions =
            (taxDeduction || 0) +
            (deductions.socialSecurity || 0) +
            (deductions.otherDeductions || 0) +
            (deductions.providentFund || 0) +
            (deductions.esi || 0) +
            absentPenalty +
            latePenalty;

        // Calculate the final net salary
        const netSalary = (basicSalary + totalAllowances) - totalDeductions;

        // Update the payslip with new values
        const updatedPayslip = await paySlipModel.findByIdAndUpdate(
            payslipId,
            {
                adminId,
                employeeId,
                salaryMonth,
                basicSalary,
                allowances,
                deductions,
                netSalary,
                totalAllowances,
                totalDeductions,
                attendanceSummary: {
                    workingDays,
                    presentDays,
                    absentDays,
                    lateDays,
                    onLeaveDays,
                },
                comments,
            },
            { new: true, runValidators: true }
        );

        if (!updatedPayslip) {
            return res.status(404).json({ success: false, message: 'Payslip not found' });
        }

        res.status(200).json({ success: true, message: 'Payslip updated successfully', payslip: updatedPayslip });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating payslip', error });
    }
};


// Delete a payslip by ID
export const deletePayslip = async (req, res) => {
    const { payslipId } = req.params;

    try {
        const deletedPayslip = await paySlipModel.findByIdAndDelete(payslipId);
        if (!deletedPayslip) {
            return res.status(404).json({ success: false, message: 'Payslip not found' });
        }

        res.status(200).json({ success: true, message: 'Payslip deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting payslip', error });
    }
};

export const editStatusPayslip = async (req, res) => {
    const { payslipId } = req.params;
    const { status } = req.body;
    const { adminId } = req.user.adminId || req.user._id;

    try {
        // Find the payslip by ID
        const existingPayslip = await paySlipModel.findById(payslipId);

        if (!existingPayslip) {
            return res.status(404).json({ success: false, message: 'Payslip not found' });
        }

        // Check if the status is already "paid"
        if (existingPayslip.status === 'paid') {
            return res.status(400).json({ success: false, message: 'Already paid' });
        }

        // Update the status to "paid"
        const updatedPayslip = await paySlipModel.findOneAndUpdate(
            { _id: payslipId },
            { status: status },
            { new: true }
        );

        // Add an entry to the expense model for salary payment
        const newExpense = new expenseModel({
            adminId,
            expenseName: `Employee Salary`,
            expenseType: 'Salary',
            expenseThumbnail: [],
            expenseAmount: existingPayslip.netSalary,
            description: `Paid salary `,
        });

        await newExpense.save();

        res.status(200).json({ success: true, message: 'Payslip updated and expense recorded successfully', data: updatedPayslip });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating payslip', error });
    }
};



export const getPayslipByEmployeeId = async (req, res) => {
    try {
        const { employeeId } = req.params

        const payslips = await paySlipModel.find({ employeeId: employeeId }).populate([
            { path: "employeeId", select: "firstName lastName" },
            { path: "deductions.tax", select: "name amount " }
        ]);

        return res.status(200).json({ success: true, payslips });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Error fetching payslips', error: error.message });
    }
};


