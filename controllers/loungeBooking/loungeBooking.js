import loungeBookingModel from '../../models/loungeBooking.js';
import loungeModel from '../../models/lounge.js';
import { ledgerModel } from "../../models/ledger.model.js";
import { ledgerHistoryModel } from "../../models/ledgerHistory.model.js";
import incomeModel from '../../models/income.js';
import taxModel from '../../models/tax.model.js';
import Joi from 'joi';

// JOI Validation Schema for lounge booking
const loungeBookingValidationSchema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    gender: Joi.string().valid('male', 'female', 'other').required(),
    phone: Joi.string().required(),
    email: Joi.string().email().required(),
    address: Joi.string().required(),
    advanceloungeBookingAmount: Joi.number().min(0).optional(),
    loungeNo: Joi.string().required(),
    tax: Joi.string().optional(),
    loungeBookingSourceId: Joi.string().optional(),
    arrivedDate: Joi.date().optional(),
    departDate: Joi.date().required(),
    note: Joi.string().optional(),
    loungeBookingAmount: Joi.number().optional(),
    discount: Joi.string().optional(),
});

// CREATE: Add a new lounge booking
export const createLoungeBooking = async (req, res) => {
    try {
        const {
            firstName, lastName, gender, phone, email, address,
            advanceloungeBookingAmount, loungeNo, tax, loungeBookingSourceId,
            arrivedDate, departDate, note, discount
        } = req.body;

        // JOI validation
        const { error } = loungeBookingValidationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        // Find open ledger
        const ledger = await ledgerModel.findOne({ closingBalance: null });
        if (!ledger) {
            return res.status(401).json({ success: false, message: "Open Ledger First" });
        }

        // Find the selected lounge
        const selectedLounge = await loungeModel.findById(loungeNo);
        if (!selectedLounge || selectedLounge.status !== "open") {
            return res.status(400).json({ success: false, message: "Lounge is not available" });
        }

        // Calculate number of nights and booking amount
        const arrivalDate = new Date(arrivedDate || Date.now());
        const departureDate = new Date(departDate);
        const numberOfNights = (departureDate - arrivalDate) / (1000 * 60 * 60 * 24);

        const loungePricePerNight = selectedLounge.rent;
        let loungeBookingAmount = loungePricePerNight * numberOfNights;


        // Apply discount if provided
        if (discount) {
            loungeBookingAmount -= Number(discount);
        }

        // Retrieve and apply tax if provided
        if (tax) {
            const selectedTax = await taxModel.findById(tax);
            if (selectedTax) {
                if (selectedTax.type === "fixed") {
                    loungeBookingAmount += selectedTax.amount;
                } else if (selectedTax.type === "percentage") {
                    loungeBookingAmount += (loungeBookingAmount * (selectedTax.amount / 100));
                }
            }
        }


        // Calculate remaining amount and payment status
        const remainingLoungeBookingAmount = loungeBookingAmount - advanceloungeBookingAmount;
        const loungeBookingPaymentStatus = remainingLoungeBookingAmount === 0 ? "paid" : "pending";

        // Create new lounge booking
        const adminId = req.user.adminId || req.user._id;
        const newBooking = new loungeBookingModel({
            adminId,
            firstName,
            lastName,
            gender,
            phone,
            email,
            address,
            advanceloungeBookingAmount: advanceloungeBookingAmount || 0,
            remainingLoungeBookingAmount: remainingLoungeBookingAmount,
            loungeBookingPaymentStatus,
            loungeNo: selectedLounge._id,
            tax: tax || null,
            loungeBookingSourceId: loungeBookingSourceId || null,
            arrivedDate: arrivalDate,
            departDate,
            note,
            loungeBookingAmount: loungeBookingAmount,
            discount: discount || null
        });

        const savedBooking = await newBooking.save();

        // Update lounge status to "booked"
        await loungeModel.findByIdAndUpdate(loungeNo, { status: "booked" });

        // Add income entry
        const newIncome = new incomeModel({
            adminId,
            incomeName: `Lounge booking in lounge ${selectedLounge.loungeNumber}`,
            incomeType: 'Lounge Booking',
            incomeAmount: loungeBookingAmount,
            description: `Income from lounge booking: ${firstName} ${lastName} in lounge number ${selectedLounge.loungeNumber}`,
        });
        await newIncome.save();

        // Add ledger history entry
        await ledgerHistoryModel.create({
            ledgerId: ledger._id,
            type: "Booking",
            credit: advanceloungeBookingAmount || 0,
            description: `Income from lounge booking: ${firstName} ${lastName} in lounge ${selectedLounge.loungeNumber}`,
        });

        res.status(201).json({ success: true, message: "Lounge booking added successfully", savedBooking });
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Helper function to populate related fields
const populateBookingDetails = () => [
  
    { path: "bookingSourceId", select: "bookingSourceName description" },
    { path: "loungeNo", select: "loungeNumber" },
    { path: "tax", select: "name amount" },


];

// READ: Get all lounge bookings or a specific booking by ID
export const getLoungeBookings = async (req, res) => {
    try {
        const adminId = req.user.adminId || req.user._id;

        const bookings = await loungeBookingModel.find({ adminId })
           

        if (!bookings) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        res.status(200).json({ success: true, message: "Bookings retrieved successfully", bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// DELETE: Delete a lounge booking by ID
export const deleteLoungeBooking = async (req, res) => {
    try {
        const { id } = req.params;

        const booking = await loungeBookingModel.findById(id);
        console.log(booking)
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        await loungeBookingModel.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Booking deleted successfully" });
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// UPDATE: Checkout a booking and update room status
export const updateCheckOut = async (req, res) => {
    const { bookingId } = req.params;
    const { status } = req.body;

    try {
        // Find the booking by ID
        const booking = await loungeBookingModel.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        // Find the lounge associated with the booking
        const lounge = await loungeModel.findById(booking.loungeNo);
        if (!lounge) {
            return res.status(404).json({ success: false, message: "Lounge not found" });
        }

        // Update the booking and lounge status
        if (status === "deActive") {
            booking.departDate = new Date();
            booking.status = status;

            lounge.status = "open";
            await lounge.save();
            await booking.save();
        }

        return res.status(200).json({
            success: true,
            message: "Checkout successful",
            booking,
            lounge
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Something went wrong", error: error.message });
    }
};

// UPDATE: Update lounge booking payment status
export const updateBookingStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { loungeBookingPaymentStatus } = req.body;

        // Find open ledger
        const ledger = await ledgerModel.findOne({ closingBalance: null });
        if (!ledger) {
            return res.status(401).json({ success: false, message: "Open Ledger First" });
        }

        // Find the booking by ID
        const booking = await loungeBookingModel.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        // Add ledger history entry
        await ledgerHistoryModel.create({
            ledgerId: ledger._id,
            type: "Remaining Lounge Booking Amount",
            credit: booking.remainingloungeBookingAmount,
            description: `Income from lounge booking: ${booking.firstName} ${booking.lastName} in lounge ${booking.loungeNo.loungeNumber}`,
        });

        // If the payment status is set to "paid"
        if (loungeBookingPaymentStatus === "paid") {
            booking.loungeBookingPaymentStatus = loungeBookingPaymentStatus;

        }

        await booking.save();

        res.status(200).json({ success: true, message: "Lounge booking updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};
