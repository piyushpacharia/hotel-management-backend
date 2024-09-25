import packageModel from "../../models/package.js";
import Joi from "joi";

// Validation schema for package
const packageValidationSchema = Joi.object({
  adminId: Joi.string(),
  packages: Joi.string().required(),
  price: Joi.number().valid().required(),
  description: Joi.string().required(),
  numberOfPackage: Joi.number().integer().min(0),
});

// Validate input data using Joi
const validatePackageData = (data) => {
  const { error } = packageValidationSchema.validate(data);
  if (error) {
    throw new Error(error.details[0].message);
  }
};

// Add a new package
export const addPackage = async (req, res) => {



  const { packages,price,description } = req.body;
  const adminId = req.user.adminId || req.user._id; 



  try {
    validatePackageData(req.body);

    const newPackage = new packageModel({ adminId, packages ,price,description});
    await newPackage.save();

    res.status(201).json({ message: "Package added successfully", data: newPackage });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all packages for a specific admin
export const getPackages = async (req, res) => {
  const adminId = req.user.adminId || req.user._id;

  try {
    const packages = await packageModel.find({ adminId: adminId });
    res.status(200).json(packages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch packages", details: err.message });
  }
};

// Update a package by ID
export const updatePackage = async (req, res) => {
  const { id } = req.params;
  const { packages, numberOfPackage } = req.body;

  try {
    validatePackageData(req.body); // Validate input

    const updatedPackage = await packageModel.findByIdAndUpdate(
      id,
      { packages, numberOfPackage },
      { new: true }
    );

    if (!updatedPackage) {
      return res.status(404).json({ error: "Package not found" });
    }

    res.status(200).json({ message: "Package updated successfully", data: updatedPackage });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a package by ID
export const deletePackage = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedPackage = await packageModel.findByIdAndDelete(id);

    if (!deletedPackage) {
      return res.status(404).json({ error: "Package not found" });
    }

    res.status(200).json({ message: "Package deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete package", details: err.message });
  }
};
