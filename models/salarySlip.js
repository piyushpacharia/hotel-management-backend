import mongoose from "mongoose";

const payslipSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "adminModel",
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'employee',
    required: true,
  },
  salaryMonth: {
    type: String,
    required: true,
  },
  basicSalary: {
    type: Number,
    required: true,
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
      type: mongoose.Schema.Types.ObjectId,
      ref: 'tax',
      required: true,
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
},
{
  timestamps: true,
});

// Calculate net salary before saving
payslipSchema.pre('save', function (next) {
  this.netSalary =
    this.basicSalary +
    (this.allowances.housingAllowance || 0) +
    (this.allowances.transportAllowance || 0) +
    (this.allowances.otherAllowances || 0) -
    (this.deductions.tax || 0) -
    (this.deductions.socialSecurity || 0) -
    (this.deductions.otherDeductions || 0) -
    (this.deductions.providentFund || 0) -  
    (this.deductions.esi || 0);            
  next();
});

const paySlipModel = mongoose.model('paySlip', payslipSchema);

export default paySlipModel;
