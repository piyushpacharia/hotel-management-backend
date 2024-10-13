import bookingModel from '../../models/bookingModel.js';
import roomCategoryModel from '../../models/roomCategory.js';
import packageModel from '../../models/package.js';
import roomModel from '../../models/rooms.js';
import incomeModel from '../../models/income.js';
import taxModel from '../../models/tax.model.js';
import mealModel from '../../models/meal.js';

import Joi from "joi";

const bookingValidationSchema = Joi.object({
    adminId: Joi.string().optional(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    gender: Joi.string().valid("male", "female", "other").required(),
    meal: Joi.string().required(),
    phone: Joi.string().required(),
    email: Joi.string().email().required(),
    address: Joi.string().required(),
    roomType: Joi.string().required(),
    packages: Joi.string().optional().allow(""), 
    roomNo: Joi.string().required(),
    arrivedDate: Joi.date().optional(),
    departDate: Joi.date().required(),
    totalPerson: Joi.number().integer().min(1).required(),
    tax: Joi.string().required(),
    note: Joi.string().optional(),
});

export const addBooking = async (req, res) => {
    const { 
        firstName, 
        lastName, 
        gender, 
        phone, 
        meal, 
        email, 
        address, 
        roomType, 
        packages, 
        roomNo, 
        arrivedDate, 
        departDate, 
        totalPerson, 
        note, 
        tax 
    } = req.body;


    const adminId = req.user.adminId || req.user._id;
    const documentThumbnail =req.files?.documentThumbnail?.map(file => file.filename) || [];
    console.log(documentThumbnail)
    const { error } = bookingValidationSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: "Validation error", errors: error.details });
    }

    try {
        // Check if room type and room number are valid
        const selectedRoomType = await roomCategoryModel.findById(roomType);
        const selectedRoom = await roomModel.findById(roomNo);

        if (!selectedRoom || selectedRoom.status !== "open") {
            return res.status(400).json({ message: "Room is not available" });
        }

        const arrivalDate = new Date(arrivedDate);
        const departureDate = new Date(departDate);
        const numberOfNights = (departureDate - arrivalDate) / (1000 * 60 * 60 * 24);

        if (numberOfNights <= 0) {
            return res.status(400).json({ message: "Invalid dates: departure date must be after arrival date" });
        }

        const roomPricePerNight = selectedRoom.rent;
        let packagePrice = 0;

        // Handle package price if package is selected
        if (packages) {
            const selectedPackage = await packageModel.findById(packages);
            if (selectedPackage) {
                packagePrice = selectedPackage.price;
            }
        }

        // Retrieve meal price based on selected meal
        const selectedMeal = await mealModel.findById(meal);
        const mealPrice = selectedMeal.price ? selectedMeal.price : 0; 

        // Calculate total booking amount
        let totalBookingAmount = (roomPricePerNight * numberOfNights) + (packagePrice * numberOfNights) + (mealPrice * totalPerson);

        // Retrieve tax details
        const selectedTax = await taxModel.findById(tax);
        if (selectedTax) {
            if (selectedTax.type === "fixed") {
                totalBookingAmount += selectedTax.amount; 
            } else if (selectedTax.type === "percentage") {
                totalBookingAmount += (totalBookingAmount * (selectedTax.amount / 100));
            }
        }

        // Create the new booking object
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
            packages: packages || null,
            roomType,
            roomNo,
            arrivedDate,
            departDate,
            totalPerson,
            tax,
            note,
            bookingAmount: totalBookingAmount,
        });

        // Save the booking
        await newBooking.save();

        // Update room status to "booked"
        await roomModel.findByIdAndUpdate(roomNo, { status: "booked" });

        // Add income entry
        const newIncome = new incomeModel({
            adminId,
            incomeName: `Booking in room ${roomNo}`,
            incomeType: 'Room Booking',
            incomeAmount: totalBookingAmount,
            description: `Income from booking: ${firstName} ${lastName} in room number ${roomNo}`,
        });
        await newIncome.save();

        // Update package if applicable
        if (packages) {
            await packageModel.updateOne(
                { _id: packages },
                { $inc: { numberOfPackage: 1 } }
            );
        }

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
    { path: 'meal', select: 'name price' },

];


export const getBookingsByAdminId = async (req, res) => {
    const adminId = req.user.adminId || req.user._id;
    try {
        const bookings = await bookingModel.find({ adminId: adminId })
            .populate(populateBookingDetails())

        res.status(200).json({ message: "Bookings fetched successfully", bookings });
    } catch (error) {
        res.status(500).json({ message: "Failed to get bookings", error: error.message });
    }
};

// Update a booking by ID
export const updateBooking = async (req, res) => {
    const { id } = req.params;

    const { 
        firstName, 
        lastName, 
        gender, 
        phone, 
        email, 
        address, 
        packages, 
        roomType, 
        roomNo, 
        arrivedDate, 
        departDate, 
        totalPerson, 
        note, 
        meal,
        tax 
    } = req.body;
    const documentThumbnail = req.files;

    try {
        // Find the room and package details
        const room = await roomModel.findById(roomNo).populate('type', 'type');
        const packageDetails = await packageModel.findById(packages);
        const selectedMeal = await mealModel.findById(meal);
        const selectedTax = await taxModel.findById(tax);

        if (!room || !packageDetails) {
            return res.status(404).json({ message: "Room or package not found" });
        }

        // Calculate booking amount
        const roomRentPerNight = room.rent;
        const numberOfNights = (new Date(departDate) - new Date(arrivedDate)) / (1000 * 60 * 60 * 24);
        
        // Calculate total amount
        let totalAmount = (roomRentPerNight * numberOfNights) + (packageDetails.price * numberOfNights);

        // Calculate meal price if meal is selected
        const mealPrice = selectedMeal.price ? selectedMeal.price : 0; 
        totalAmount += mealPrice * totalPerson; 

        // Calculate tax amount if tax is selected
        if (selectedTax) {
            if (selectedTax.type === "fixed") {
                totalAmount += selectedTax.amount;
            } else if (selectedTax.type === "percentage") {
                totalAmount += (totalAmount * (selectedTax.amount / 100));
            }
        }

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
        const booking = await bookingModel.findById(id)

        const deletedBooking = await bookingModel.findOneAndDelete(id)


        if (!deletedBooking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        await packageModel.updateOne(
            { _id: booking.packages },
            { $inc: { numberOfPackage: -1 } }
        );

        res.status(200).json({ message: "Booking deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete booking", error: error.message });
    }


};




