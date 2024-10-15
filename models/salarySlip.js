import mongoose from "mongoose";

const payslipSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "adminModel",
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'employee',
  },
  salaryMonth: {
    type: String,
  },
  basicSalary: {
    type: Number,
  },
  allowances: {
    housingAllowance: {
      type: Number,
      default: 0,
    },
    transportAllowance: {
      type: Number,
      default: 0,
    },
    otherAllowances: {
      type: Number,
      default: 0,
    },
  },
  deductions: {
    tax: {
      type: mongoose.Types.ObjectId,
      ref: 'tax',
      default:null
   
    },
    socialSecurity: {
      type: Number,
      default: 0,
    },
    otherDeductions: {
      type: Number,
      default: 0,
    },
    providentFund: {
      type: Number,
      default: 0,
    },
    esi: {
      type: Number,
      default: 0,
    },
  },
  netSalary: {
    type: Number,
    required: true,
  },
  totalAllowances: {
    type: Number,
    default: 0,
  },
  totalDeductions: {
    type: Number,
    default: 0,
  },
  issueDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['Paid', 'Pending', 'Processing'],
    default: 'Pending',
  },
  comments: {
    type: String,
  },
  attendanceSummary: {
    workingDays: { type: Number, required: true },
    presentDays: { type: Number, required: true },
    absentDays: { type: Number, required: true },
    lateDays: { type: Number, required: true },
    onLeaveDays: { type: Number, required: true },
  },
}, {
  timestamps: true,
});


const paySlipModel = mongoose.model('paySlip', payslipSchema);

export default paySlipModel;
