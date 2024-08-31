import incomeModel from "../../models/income.js";
import Joi from "joi";


// Controller to add a new income
export const addIncome = async (req, res) => {

    const validateIncome = Joi.object({
        adminId: Joi.string(),
        incomeName: Joi.string().required(),
        incomeType: Joi.string().required(),
        incomeAmount: Joi.number().required(),
        description: Joi.string().optional(),
    });

    const { error } = validateIncome.validate(req.body);
    if (error)
        return res.status(400).json({ message: "Validation error", error: error.details[0].message });

    const { incomeName, incomeType, incomeAmount, description } = req.body;
    const adminId = req.user._id

    try {
        const newIncome = new incomeModel({
            adminId,
            incomeName,
            incomeType,
            incomeAmount,
            description,
        });

        await newIncome.save();
        res.status(201).json({ message: "Income added successfully", income: newIncome });
    } catch (err) {
        res.status(500).json({ message: "Failed to add income", error: err.message });
    }
};

// Controller to get all incomes
export const getIncomes = async (req, res) => {
    try {
        const incomes = await incomeModel.find()
        res.status(200).json({ incomes });
    } catch (err) {
        res.status(500).json({ message: "Failed to retrieve incomes", error: err.message });
    }
};

// Controller to update an income
export const updateIncome = async (req, res) => {
    const { id } = req.params;

    const validateIncomeUpdate = Joi.object({
        adminId: Joi.string(),
        incomeName: Joi.string(),
        incomeType: Joi.string(),
        incomeAmount: Joi.number(),
        description: Joi.string().optional(),
    });

    // Validate request body
    const { error } = validateIncomeUpdate.validate(req.body);
    if (error)
        return res.status(400).json({ message: "Validation error", error: error.details[0].message });

    try {
        const updatedIncome = await incomeModel.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedIncome) return res.status(404).json({ message: "Income not found" });

        res.status(200).json({ message: "Income updated successfully", income: updatedIncome });
    } catch (err) {
        res.status(500).json({ message: "Failed to update income", error: err.message });
    }
};

// Controller to delete an income
export const deleteIncome = async (req, res) => {
    const { id } = req.params;

    try {
        const income = await incomeModel.findByIdAndDelete(id);
        if (!income) return res.status(404).json({ message: "Income not found" });

        res.status(200).json({ message: "Income deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete income", error: err.message });
    }
};
