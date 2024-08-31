import expenseModel from "../../models/expense.js";
import Joi from "joi";



// Controller to add a new expense
export const addExpense = async (req, res) => {
  const expense_thumbnail = req.file ? req.file.path : null;


  const validateExpenseSchema = Joi.object({
    adminId: Joi.string(),
    expenseName: Joi.string().required(),
    expenseType: Joi.string().required(),
    expenseAmount: Joi.number().required(),
    description: Joi.string().optional(),
  });

  const { error } = validateExpenseSchema.validate(req.body);
  if (error)
    return res
      .status(400)
      .json({ message: "Validation error", error: error.details[0].message });

  const { expenseName, expenseType, expenseAmount, description } = req.body;
  const adminId = req.user._id;

  try {
    const newExpense = new expenseModel({
      adminId,
      expenseName,
      expenseType,
      expenseAmount,
      description,
      expense_thumbnail,
    });

    await newExpense.save();
    res.status(201).json({ message: "Expense added successfully", expense: newExpense });
  } catch (err) {
    res.status(500).json({ message: "Failed to add expense", error: err.message });
  }
};

// Controller to get all expenses
export const getExpenses = async (req, res) => {
  try {
    const expenses = await expenseModel.find()
    res.status(200).json({ expenses });
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve expenses", error: err.message });
  }
};

// Controller to update expenses
export const updateExpense = async (req, res) => {
  const { id } = req.params; // Get the expense ID from the request parameters
  const expense_thumbnail = req.file ? req.file.path : null; // Get the thumbnail file path if uploaded

  // Validation schema for updating an expense
  const validateExpenseUpdate = Joi.object({
    adminId: Joi.string(),
    expenseName: Joi.string(),
    expenseType: Joi.string(),
    expenseAmount: Joi.number(),
    description: Joi.string().optional(),
    expense_thumbnail: Joi.string().optional(),
  });

  // Validate request body
  const { error } = validateExpenseUpdate.validate(req.body);
  if (error)
    return res.status(400).json({ message: "Validation error", error: error.details[0].message });

  try {
    // Create an object with the update fields
    const updateData = { ...req.body };

    // If a new expense thumbnail is uploaded, add it to the update data
    if (expense_thumbnail) {
      updateData.expense_thumbnail = expense_thumbnail;
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
