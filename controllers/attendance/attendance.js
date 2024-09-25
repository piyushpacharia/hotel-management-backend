import Joi from "joi";
import attendanceModel from "../../models/attendance.js";


export const addAttendance = async (req, res, next) => {

  console.log(req.body)
  const inputSanitizer = Joi.object({
    adminId: Joi.string().optional(),
    employeeId: Joi.string().required(),
    status: Joi.string().valid('present', 'absent', 'leave').required(),
    checkIn: Joi.string().allow(""),
    checkOut: Joi.string().optional(),
    remarks: Joi.string().allow(""),
  });
  try {
    const { error } = inputSanitizer.validate(req.body);
    if (error) {
      return next(error);
    }

    const { employeeId, status, checkIn, checkOut, remarks } = req.body;

    const newAttendance = new attendanceModel({
      adminId: req.user.adminId || req.user._id,
      employeeId: employeeId,
      status: status,
      checkIn: checkIn,
      checkOut: checkOut,
      remarks: remarks,
    });

    await newAttendance.save();
    res.status(201).json({ message: 'Attendance added successfully', newAttendance });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add attendance', details: error.message });
  }
};

export const updateAttendance = async (req, res, next) => {
  const inputSanitizer = Joi.object({
    status: Joi.string().valid('present', 'absent', 'leave'),
    checkIn: Joi.string().allow(""),
    checkOut: Joi.string().allow(""),
    remarks: Joi.string().allow(""),
  })
  const { error } = inputSanitizer.validate(req.body);
  if (error) {
    return next(error)
  }
  const { status, checkIn, checkOut, remarks } = req.body;
  try {
    const { attendanceId } = req.params;

    const updatedAttendance = await attendanceModel.findByIdAndUpdate(
      { _id: attendanceId, adminId: req.user.adminId || req.user._id },
      { status: status, checkIn: checkIn, checkOut: checkOut, remarks: remarks },
      { new: true }
    );

    if (!updatedAttendance) {
      return res.status(404).json({ message: 'Attendance record not found.' });
    }

    res.status(200).json({ message: 'Attendance updated successfully', updatedAttendance });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update attendance', details: error.message });
  }
};

export const getEmployeeAttendance = async (req, res,next) => {
  const inputSanitizer = Joi.object({
    employeeId: Joi.string().required(),
  })
  const { error } = inputSanitizer.validate(req.body)
  if (error) {
    return next(error)
  }


  console.log(req.body)
  const { employeeId } = req.body;
  try {

    const attendanceRecords = await attendanceModel.find({
      employeeId: employeeId, adminId: req.user.adminId || req.user._id
    }).populate('employeeId', 'firstName lastName');

    if (attendanceRecords.length === 0) {
      return res.status(404).json({ message: 'No attendance records found for this user.' });
    }

    res.status(200).json(attendanceRecords);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendance records', details: error.message });
  }
};

export const getAttendance = async (req, res) => {
  try {
    const adminId = req.user.adminId || req.user._id;

    // Extract the 'fromDate' and 'toDate' from the request query parameters
    const { fromDate, toDate } = req.query;

    let startDate, endDate;

    if (fromDate && toDate) {
      // If 'fromDate' and 'toDate' are provided, use them to filter the records
      startDate = new Date(fromDate).setHours(0, 0, 0, 0);
      endDate = new Date(toDate).setHours(23, 59, 59, 999);
    } else {
      // Otherwise, use the current date by default
      const currentDate = new Date();
      startDate = new Date(currentDate).setHours(0, 0, 0, 0);
      endDate = new Date(currentDate).setHours(23, 59, 59, 999);
    }

    // Fetch attendance records between the startDate and endDate
    const attendanceRecords = await attendanceModel.find({
      createdAt: { $gte: startDate, $lt: endDate },
      adminId: adminId,
    }).populate('employeeId', 'firstName lastName');

    if (attendanceRecords.length === 0) {
      return res.status(404).json({ message: 'No attendance records found for the specified date range.' });
    }

    res.status(200).json({ attendanceRecords });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendance records', details: error.message });
  }
};


export const deleteAttendance = async (req, res) => {
  try {
    const { attendanceId } = req.params;

    const deletedAttendance = await attendanceModel.findByIdAndDelete({ _id: attendanceId, adminId: req.user.adminId || req.user._id });

    if (!deletedAttendance) {
      return res.status(404).json({ message: 'Attendance record not found.' });
    }

    res.status(200).json({ message: 'Attendance deleted successfully', deletedAttendance });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete attendance', details: error.message });
  }
}