import Joi from 'joi';
import taxModel from "../../models/tax.model.js";

// Joi validation schema for tax
const taxValidationSchema = Joi.object({
  
    name: Joi.string().required(),
    amount: Joi.number().min(0).required(),
    type: Joi.string().valid('fixed', 'percentage').required(),
    description: Joi.string().optional(),
});

export const createTax = async (req, res) => {
    try {

        const { error } = taxValidationSchema.validate(req.body);
        if (error) return res.status(400).json({ success: false, message: error.details[0].message });

        const { name, type, amount, description } = req.body;

        const adminId = req.user.adminId || req.user._id

        const newTax = new taxModel({
            adminId: adminId,
            name: name,
            type: type,
            amount: amount,
            description: description || ''
        });

        await newTax.save();

        res.status(201).json({ success: true, message: 'Tax created successfully', tax: newTax });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getAllTaxes = async (req, res) => {
    try {
        const adminId = req.user.adminId || req.user._id
        const taxes = await taxModel.find({ adminId: adminId });

        if (!taxes || taxes.length === 0) {
            return res.status(404).json({ success: false, message: 'No taxes found' });
        }
        res.status(200).json({ success: true, message: 'Taxes fetched successfully', taxes });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const updateTax = async (req, res) => {
    try {
        const { taxId } = req.params;
        const { error } = taxValidationSchema.validate(req.body);

        if (error) return res.status(400).json({ success: false, message: error.details[0].message });

        const { name, type, amount, description } = req.body;

        const updatedTax = await taxModel.findByIdAndUpdate(
            {_id:taxId},
            { name: name, type: type, amount: amount, description: description },
            { new: true }
        );

        if (!updatedTax) {
            return res.status(404).json({ success: false, message: 'Tax not found' });
        }

        res.status(200).json({ success: true, message: 'Tax updated successfully', tax: updatedTax });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const deleteTax = async (req, res) => {
    try {
        const { taxId } = req.params;
        const deletedTax = await taxModel.findByIdAndDelete({_id:taxId});
        if (!deletedTax) {
            return res.status(404).json({ success: false, message: 'Tax not found' });
        }
        res.status(200).json({ success: true, message: 'Tax deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


