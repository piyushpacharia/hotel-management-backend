import loungeModel from '../../models/lounge.js';
import Joi from 'joi';

// JOI Validation Schema
const loungeValidationSchema = Joi.object({
    loungeNumber: Joi.number().required(),
    rent: Joi.number().min(0).required(),
    status: Joi.string().valid('booked', 'open', 'inactive'),
    loungeThumbnail: Joi.any().optional()  
});

// CREATE: Add a new lounge
export const createLounge = async (req, res) => {
    try {
        const { loungeNumber, rent, status } = req.body;
        const loungeThumbnail = req.files?.loungeThumbnail?.map(file => file.filename) || [];

        const adminId = req.user.adminId || req.user._id;

        // Validate request body with Joi
        const { error } = loungeValidationSchema.validate({ loungeNumber, rent, status });
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const existingLounge = await loungeModel.findOne({ loungeNumber });
        if (existingLounge) {
            return res.status(400).json({ success: false, message: "Lounge number already exists" });
        }

        // Create new lounge
        const newLounge = new loungeModel({
            adminId,
            loungeNumber,
            rent,
            loungeThumbnail: loungeThumbnail.length > 0 ? loungeThumbnail : "null",
            status: status || "open"
        });

        const savedLounge = await newLounge.save();
        res.status(201).json({ success: true, message: "Lounge added successfully", savedLounge });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// READ: Get all lounges
export const getLounges = async (req, res) => {
    try {
        const adminId = req.user.adminId || req.user._id;

        // Fetch all lounges associated with the admin
        const lounges = await loungeModel.find({ adminId }).populate('adminId');
        res.status(200).json({ success: true, message: "Fetched all lounges", lounges });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// UPDATE: Update lounge details by ID
export const updateLounge = async (req, res) => {
    try {
        const { loungeId } = req.params;
        const { loungeNumber, rent, status } = req.body;

        const loungeThumbnail = req.files?.loungeThumbnail?.map(file => file.filename) || [];

        // Validate request body with Joi
        const { error } = loungeValidationSchema.validate({ loungeNumber, rent, status });
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        // Find the lounge by ID
        const lounge = await loungeModel.findById(loungeId);
        if (!lounge) {
            return res.status(404).json({ success: false, message: "Lounge not found" });
        }

        // Update fields
        if (loungeNumber) lounge.loungeNumber = loungeNumber;
        if (rent) lounge.rent = rent;
        if (loungeThumbnail.length > 0) lounge.loungeThumbnail = loungeThumbnail;
        if (status) lounge.status = status;

        const updatedLounge = await lounge.save();
        res.status(200).json({ success: true, message: "Lounge updated successfully", updatedLounge });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// DELETE: Delete a lounge by ID
export const deleteLounge = async (req, res) => {
    try {
        const { loungeId } = req.params;

        const lounge = await loungeModel.findById(id);
        if (!lounge) {
            return res.status(404).json({ success: false, message: "Lounge not found" });
        }

        await loungeModel.findByIdAndDelete(loungeId);
        res.status(200).json({ success: true, message: "Lounge deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};
