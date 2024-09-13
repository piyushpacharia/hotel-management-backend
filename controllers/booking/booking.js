import bookingModel from '../../models/bookingModel.js';
import roomCategoryModel from '../../models/roomCategory.js';
import packageModel from '../../models/package.js';
import roomModel from '../../models/rooms.js';
import incomeModel from '../../models/income.js';
import Joi from "joi";

const bookingValidationSchema = Joi.object({
    adminId: Joi.string().optional(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    gender: Joi.string().valid("male", "female", "other").required(),
    meal: Joi.string().valid("breakfast", "lunch", "dinner", "none").required(),
    phone: Joi.string().required(),
    email: Joi.string().email().required(),
    address: Joi.string().required(),
    packages: Joi.string().required(),
    roomType: Joi.string().required(),
    roomNo: Joi.string().required(),
    arrivedDate: Joi.date().optional(),
    departDate: Joi.date().required(),
    totalPerson: Joi.number().integer().min(1).required(),
    note: Joi.string().optional(),
});

const validateBooking = (data) => {
    const { error } = bookingValidationSchema.validate(data, { abortEarly: false });
    return error ? error.details.map((detail) => detail.message) : null;
};



export const addBooking = async (req, res) => {


    const { firstName, lastName, gender, phone, meal, email, address, packages, roomType, roomNo, arrivedDate, departDate, totalPerson, note } = req.body;
    const adminId = req.user.adminId || req.user._id;
    const documentThumbnail = req.files;



    const validationErrors = validateBooking(req.body);
    if (validationErrors) {
        return res.status(400).json({ message: "Validation error", errors: validationErrors });
    }

    try {
        const selectedPackage = await packageModel.findById(packages);
        const selectedRoomType = await roomCategoryModel.findById(roomType);
        const selectedRoom = await roomModel.findById(roomNo);

        if (!selectedPackage || !selectedRoomType || !selectedRoom) {
            return res.status(404).json({ message: "Package, room type, or room not found" });
        }

        if (selectedRoom.status !== "open") {
            return res.status(400).json({ message: "Room is not available" });
        }

        const arrivalDate = new Date(arrivedDate);
        const departureDate = new Date(departDate);
        const numberOfNights = (departureDate - arrivalDate) / (1000 * 60 * 60 * 24);

        if (numberOfNights <= 0) {
            return res.status(400).json({ message: "Invalid dates: departure date must be after arrival date" });
        }

        const roomPricePerNight = selectedRoom.rent;
        const packagePrice = selectedPackage.price;
        const totalBookingAmount = (roomPricePerNight * numberOfNights) + (packagePrice * numberOfNights);

        const newBooking = new bookingModel({
            adminId,
            firstName,
            lastName,
            gender,
            phone,
            meal,
            email,
            address,
            documentThumbnail,
            packages,
            roomType,
            roomNo,
            arrivedDate,
            departDate,
            totalPerson,
            note,
            bookingAmount: totalBookingAmount
        });

        await newBooking.save();

        // Add income entry
        const newIncome = new incomeModel({
            adminId,
            incomeName:` Booking in `,
            incomeType: 'Room Booking',
            incomeAmount: totalBookingAmount,
            description: `Income from booking: ${firstName} ${lastName} in room number ${roomNo}`
        });
        await newIncome.save();

        await packageModel.updateOne(
            { _id: selectedPackage._id },
            { $inc: { numberOfPackage: 1 } }
        );

        res.status(201).json({ message: "Booking added successfully", booking: newBooking });
    } catch (error) {
        res.status(500).json({ message: "Failed to add booking", error: error.message });
    }
};

// Helper function to populate related fields
const populateBookingDetails = () => [
    { path: 'packages', select: 'packages price' },
    { path: 'roomType', select: 'type' },
    { path: 'roomNo', select: 'roomNumber rent' },
];


export const getBookingsByAdminId = async (req, res) => {
    const adminId = req.user.adminId || req.user._id;
    try {
        const bookings = await bookingModel.find({ adminId })
            .populate(populateBookingDetails())

        res.status(200).json({ message: "Bookings fetched successfully", bookings });
    } catch (error) {
        res.status(500).json({ message: "Failed to get bookings", error: error.message });
    }
};

// Update a booking by ID
export const updateBooking = async (req, res) => {
    const { id } = req.params;

    const { firstName, lastName, gender, phone, email, address, packages, roomType, roomNo, arrivedDate, departDate, totalPerson, note } = req.body;
    const documentThumbnail = req.files;
    try {
        // Find the room and package details
        const room = await roomModel.findById(roomNo).populate('type', 'type');
        const packageDetails = await packageModel.findById(packages);

        if (!room || !packageDetails) {
            return res.status(404).json({ message: "Room or package not found" });
        }

        // Calculate booking amount
        const roomRentPerNight = room.rent;
        const numberOfNights = (new Date(departDate) - new Date(arrivedDate)) / (1000 * 60 * 60 * 24);
        const totalAmount = (roomRentPerNight * numberOfNights) + packageDetails.price;

        // Update booking with calculated total amount
        const updatedBooking = await bookingModel.findByIdAndUpdate(id, {
            firstName,
            lastName,
            gender,
            phone,
            email,
            address,
            packages,
            roomType,
            roomNo,
            documentThumbnail,
            arrivedDate,
            departDate,
            totalPerson,
            note,
            bookingAmount: totalAmount
        }, {
            new: true,
            runValidators: true
        }).populate(populateBookingDetails());

        if (!updatedBooking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Log the income for the booking
        const income = new incomeModel({
            adminId: req.user.adminId,
            incomeName: "Room Booking",
            incomeType: "Booking",
            incomeAmount: totalAmount,
            description: `Booking by ${firstName} ${lastName} from ${arrivedDate} to ${departDate}`
        });
        await income.save();

        res.status(200).json({ message: "Booking updated successfully", booking: updatedBooking });
    } catch (error) {
        res.status(500).json({ message: "Failed to update booking", error: error.message });
    }
};

// Delete a booking by ID
export const deleteBooking = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedBooking = await bookingModel.findByIdAndDelete(id);

        if (!deletedBooking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.status(200).json({ message: "Booking deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete booking", error: error.message });
    }

    // await packageModel.updateOne(
    //     { _id: deletedBooking._id },
    //     { $inc: { numberOfPackage: -1 } }
    // );
};




