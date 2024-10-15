import expenseModel from "../../models/expense.js";
import Joi from "joi";
import { ledgerModel } from "../../models/ledger.model.js"
import { ledgerHistoryModel } from "../../models/ledgerHistory.model.js"


// Controller to add a new expense
export const addExpense = async (req, res) => {
  // Extracting filenames of uploaded thumbnails, if available
  const expenseThumbnail = req.files?.expenseThumbnail?.map(file => file.filename) || [];

  // Logging for debugging purposes
  console.log(req.body);
  console.log(expenseThumbnail);

  // Defining the validation schema for the expense
  const validateExpenseSchema = Joi.object({
    adminId: Joi.string(),
    expenseName: Joi.string().required(),
    expenseType: Joi.string().required(),
    expenseAmount: Joi.number().required(),
    description: Joi.string().optional(),
  });

  // Validating the request body using Joi schema
  const { error } = validateExpenseSchema.validate(req.body);
  if (error) {
    return res.status(400).json({success:false,
      message: "Validation error",
      error: error.details[0].message,
    });
  }

  // Extracting fields from the request body
  const { expenseName, expenseType, expenseAmount, description } = req.body;
  const adminId = req.user.adminId || req.user._id;

  try {
    // Check if there's an open ledger with no closing balance
    const ledger = await ledgerModel.findOne({ closingBalance: null });
        if (!ledger) {
            return res.status(401).json({ success: false, message: "Open Ledger First" });
        }

    // Creating a new ledger history entry for the expense
    await ledgerHistoryModel.create({
      ledgerId: ledger._id,
      type: `Expense ${expenseName}`,
      debit: expenseAmount,
      description: description || '',
    });

    // Creating a new expense document
    const newExpense = new expenseModel({
      adminId,
      expenseName,
      expenseType,
      expenseAmount,
      description,
      expenseThumbnail,
    });

    // Saving the new expense to the database
    await newExpense.save();

    // Sending a success response
    res.status(201).json({success:true,
      message: "Expense added successfully",
      expense: newExpense,
    });
  } catch (err) {
    // Handling any errors and sending a failure response
    console.error(err.message);
    res.status(500).json({
      success:false,
      message: "Failed to add expense",
      error: err.message,
    });
  }
};

// Controller to get all expenses
export const getExpenses = async (req, res) => {

  const adminId = req.user.adminId || req.user._id


  try {
    const expenses = await expenseModel.find({adminId:adminId})
    res.status(200).json({ expenses });
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve expenses", error: err.message });
  }
};

// Controller to update expenses
export const updateExpense = async (req, res) => {
  const { id } = req.params;
  const expenseThumbnail =req.files?.expenseThumbnail?.map(file => file.filename) || [];

  // Validation schema for updating an expense
  const validateExpenseUpdate = Joi.object({
    adminId: Joi.string(),
    expenseName: Joi.string(),
    expenseType: Joi.string(),
    expenseAmount: Joi.number(),
    description: Joi.string().optional(),
    expenseThumbnail: Joi.string().optional(),
  });

  // Validate request body
  const { error } = validateExpenseUpdate.validate(req.body);
  if (error)
    return res.status(400).json({ message: "Validation error", error: error.details[0].message });

  try {
    // Create an object with the update fields
    const updateData = { ...req.body };

    // If a new expense thumbnail is uploaded, add it to the update data
    if (expenseThumbnail) {
      updateData.expenseThumbnail = expenseThumbnail;
    }

    // Find and update the expense in the database
    const updatedExpense = await expenseModel.findByIdAndUpdate(id, updateData, { new: true });
    
    // Check if the expense was found and updated
    if (!updatedExpense) return res.status(404).json({ message: "Expense not found" });

    // Respond with the updated expense
    res.status(200).json({ message: "Expense updated successfully", expense: updatedExpense });
  } catch (err) {
    // Handle any server errors
    res.status(500).json({ message: "Failed to update expense", error: err.message });
  }
};


// Controller to delete an expense
export const deleteExpense = async (req, res) => {
  const { id } = req.params;

  try {
    const expense = await expenseModel.findByIdAndDelete(id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete expense", error: err.message });
  }
};
