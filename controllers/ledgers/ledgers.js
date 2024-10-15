import Joi from "joi";
import { ledgerModel } from "../../models/ledger.model.js";
import { ledgerHistoryModel } from "../../models/ledgerHistory.model.js"

export const addLedger = async (req, res, next) => {

  const ledgerSchema = Joi.object({
    openingBalance: Joi.number().required(),
    description: Joi.string().allow(""),
    type: Joi.string().required(""),
  });
  const { error } = ledgerSchema.validate(req.body);
  if (error) {
    return next(error);
  }
  const { openingBalance, description ,type } = req.body;

  try {
    const date = new Date();

    const ledger = await ledgerModel.findOne({
      closingBalance: null,
    });

    if (ledger) {
      return res
        .status(409)
        .json({
          success: false,
          message:
            "A ledger is already open if you want to open new please close first",
        });
    }
    const newLedger = await ledgerModel.create({
      openingBalance: openingBalance,
      description: description,
      type:type
    })
    await ledgerHistoryModel.create({ ledgerId: newLedger._id, credit: type === "credit" ? openingBalance : null ,debit:type === "debit" ? openingBalance : null, type: "Opening Balance" })
    return res
      .status(200)
      .json({ success: true, message: "Ledger Added Successfully" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server error" });
  }
};
export const getAllLedgers = async (req, res) => {
  try {
    const ledgers = await ledgerModel.find({});
    return res.status(200).json({ success: true, ledgers });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server error" });
  }
};
export const getLedger = async (req, res , next) => {
  const inputSanitizer = Joi.object({
    ledgerId: Joi.string().required(),
  })
  const { error } = inputSanitizer.validate(req.body)
  if (error) {
    return next(error)
  }
  const { ledgerId } = req.body
  try {
    const ledger = await ledgerModel.findOne({ _id: ledgerId });
    console.log(ledger)
    return res.status(200).json({ success: true, ledger });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server error" });
  }
};
export const getLedgerDetails = async (req, res, next) => {
  const inputSanitizer = Joi.object({
    ledgerId: Joi.string().required(),
  })
  const { error } = inputSanitizer.validate(req.body)
  if (error) {
    return next(error)
  }
  const { ledgerId } = req.body
  try {
    const ledgerDetails = await ledgerHistoryModel.find({ ledgerId: ledgerId }).populate("ledgerId", "openingBalance");
    return res.status(200).json({ success: true, ledgerDetails });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server error" });
  }
};
export const closeLedger = async (req, res, next) => {
  const inputSanitizer = Joi.object({
    ledgerId: Joi.string().required(),
  });
  const { error } = inputSanitizer.validate(req.body);
  if (error) {
    return next(error);
  }
  const { ledgerId } = req.body;

  try {
    const ledger = await ledgerModel.findOne({ _id: ledgerId, closingBalance: null });
    if (!ledger) {
      return res.status(404).json({ success: false, message: 'Ledger not found or already closed' });
    }

    const ledgerHistory = await ledgerHistoryModel.find({ ledgerId: ledgerId });

    // Calculate total debit and credit
    const totalDebit = ledgerHistory.reduce((acc, curr) => acc + (curr.debit || 0), 0);
    const totalCredit = ledgerHistory.reduce((acc, curr) => acc + (curr.credit || 0), 0);



    // Calculate closing balance
    const closingBalance =  totalCredit - totalDebit;

    // Update ledger with closing balance
    ledger.closingBalance = closingBalance;
    ledger.closingDate = new Date();

    await ledger.save();

    return res.status(200).json({
      success: true,
      message: 'Ledger closed successfully',
      closingBalance: ledger.closingBalance
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
