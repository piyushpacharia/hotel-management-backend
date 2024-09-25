import mongoose from "mongoose";

// Define the attendance schema
const attendanceSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "adminModel",
    },
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'employee',
        required: true,
    },
    status: {
        type: String,
        enum: ['present', 'absent', 'late', 'onLeave'],
        required: true,
    },
    checkIn: {
        type: String, 
      
    },
    checkOut: {
        type: String, 
       default:null

    },
    remarks: {
        type: String,
        default:null
    },

}, {
    timestamps: true,
});

// Export the Attendance model
const attendanceModel = mongoose.model('Attendance', attendanceSchema);

export default attendanceModel;
