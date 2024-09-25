import mongoose from "mongoose";


const employeeSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "adminModel"
    }
    ,
    firstName: {
        type: String,
        required: true,

    },
    lastName: {
        type: String,
        required: true,

    },
    email: {
        type: String,
        required: true,

    },
    phone: {
        type: String,
        required: true,

    },
    address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true }
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    employeeThumbnail: [{ type: Array }],
    employeeDocument: [{ type: Array }],
    hireDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    position: {
        type: String,
        required: true
    },

    salary: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'deactive'],
        default: 'active',
    },

}, { timestamps: true });

const employeeModel = mongoose.model('employee', employeeSchema);

export default employeeModel;
