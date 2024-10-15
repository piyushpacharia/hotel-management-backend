import Joi from 'joi';
import bookingSourceModel from '../../models/bookingSourse.js';

const bookingSourceSchema = Joi.object({
    adminId: Joi.string().optional().messages({
        'string.empty': 'Admin ID is required',
        'any.required': 'Admin ID is required',
    }),
    bookingSourceName: Joi.string().required().messages({
        'string.empty': 'Booking source name is required',
        'any.required': 'Booking source name is required',
    }),
    description: Joi.string().optional().messages({
        'string.max': 'Description ',
    }),
});

// Add a new booking source
export const addBookingSource = async (req, res) => {
    try {

        const { adminId } = req.user.adminId || req.user._id
        // Validate request data using Joi
        const { error } = bookingSourceSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { bookingSourceName, description } = req.body;

        const newBookingSource = new bookingSourceModel({
            adminId: adminId,
            bookingSourceName: bookingSourceName,
            description: description,
        });

        const savedBookingSource = await newBookingSource.save();
        res.status(201).json({
            success: true,
            data: savedBookingSource,
            message: 'Booking source added successfully!',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding booking source',
            error: error.message,
        });
    }
};

// Get all booking sources
export const getBookingSources = async (req, res) => {

    const { adminId } = req.user.adminId || req.user._id
    try {
        const bookingSources = await bookingSourceModel.find({ adminId: adminId }).populate('adminId', 'name email');
        res.status(200).json({
            success: true,
            data: bookingSources,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching booking sources',
            error: error.message,
        });
    }
};

// Delete a booking source by ID
export const deleteBookingSource = async (req, res) => {
    try {
        const { bookingSoureceId } = req.params;

        const deletedBookingSource = await bookingSourceModel.findByIdAndDelete({_id:bookingSoureceId});
        if (!deletedBookingSource) {
            return res.status(404).json({
                success: false,
                message: 'Booking source not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Booking source deleted successfully!',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting booking source',
            error: error.message,
        });
    }
};
