import adminModel from "../../models/adminAuth.js";
import subAdminModel from '../../models/subAdminAuth.js';
import JWTService from '../../services/JWTService.js';
import bcrypt from 'bcrypt';
import Joi from 'joi';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 5;
const JWT_SECRET = process.env.JWT_SECRET || 'Akash';


export const adminSignup = async (req, res) => {
  const profileThumbnail = req.files;

  // Validation schema for user input
  const registerAdminSchema = Joi.object({
    email: Joi.string().email().allow(""),
    name: Joi.string().allow(""),
    number: Joi.string().pattern(/^\d{10}$/).required(),
    password: Joi.string()
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%?&])[A-Za-z\\d@$!%?&]{8,}$'))
      .required()
      .messages({
        'string.pattern.base': 'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
        'any.required': 'Password is required.',
      }),
  });

  try {
    // Validate user input
    const { error } = registerAdminSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, name, number, password } = req.body;

    // Check if the user already exists
    let user = await adminModel.findOne({ email: req.body.email });
    if (user) return res.status(400).json({ message: 'User already registered.' });

    // Hash the password
    const hashPassword = bcrypt.hashSync(password, SALT_ROUNDS);

    // Create a new user
    user = new adminModel({
      name: name,
      number: number,
      email: email,
      password: hashPassword,
      role: 'admin',
      profileThumbnail,
    });

    // Save the user to the database
    await user.save();
    res.status(201).json({ message: 'Admin account has been created.', user });
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
};


export const login = async (req, res) => {
  // Validation schema for login input
  const loginAdminSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  // Validate input
  const { error } = loginAdminSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }


  const { email, password } = req.body;


  try {
    // Check if the user exists in adminModel or subAdminModel
    let user = await adminModel.findOne({ email });
    if (!user) {
      user = await subAdminModel.findOne({ email });
    }

    // If user not found, return 401
    if (!user) {
      return res.status(401).json({ success: false, message: "Email not found." });
    }


    // Check if user account is active
    if (user.status !== "active") {
      return res.status(401).json({
        success: false,
        message: "User account is inactive. Please contact support.",
      });
    }

    // Compare provided password with stored hashed password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ success: false, message: "Incorrect password." });
    }

    const adminId = user.adminId 
    // Generate JWT token
    const token = JWTService.sign({
      _id: user._id,
      name: user.name,
      role: user.role,
      adminId
    });

    // Send response with Bearer token
    return res.status(200).json({
      success: true,
      message: "Logged in successfully.",
      token: `Bearer ${token}`,
      user: {
        _id: user._id,
        name: user.name,
        role: user.role,
        adminId: user.adminId,
      },
    });
  } catch (err) {
    
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
      error: err.message,
    });
  }
};


export const subAdminRegister = async (req, res, next) => {
  // Validation schema for user input
  const registerSubAdminSchema = Joi.object({
    adminId: Joi.string(),
    email: Joi.string().email().allow(''),
    name: Joi.string().allow(''),
    password: Joi.string()
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%?&])[A-Za-z\\d@$!%?&]{8,}$'))
      .required()
      .messages({
        'string.pattern.base': 'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
        'any.required': 'Password is required.',
      }),
  });

  try {
    // Validate user input
    const { error } = registerSubAdminSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { email, name, number, password } = req.body;
    const adminId = req.user._id;

    // Check if the user already exists
    let user = await subAdminModel.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already registered.' });
    }

    // Hash the password
    const hashPassword = bcrypt.hashSync(password, SALT_ROUNDS);

    // Create a new sub-admin user
    user = new subAdminModel({
      name,
      email,
      password: hashPassword,
      role: 'subAdmin',
      adminId
    })
    // Save the user to the database
    await user.save();

    res.status(201).json({ success: true, message: 'Sub-Admin account has been created.', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
  }
};


export const getSubAdmin = async (req, res) => {

  const id = req.user.adminId || req.user._id;
  
  try {

    const subAdmins = await subAdminModel.find({ adminId: id });
    res.status(200).json({ subAdmins });
  } catch (error) {
    console.error('Error fetching agent details:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};


export const deleteSubAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    const subAdmin = await subAdminModel.findByIdAndDelete(id);


    res.status(200).json({ message: 'Sub-admin deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting sub-admin', error: error.message });
  }
};

export const profileThumbnail = async (req, res) => {
  try {

    const { _id, role } = req.body;

    const thumbnailSchema = Joi.object({

      _id: Joi.string().required().messages({
        'any.required': 'User ID is required.',
      }),
      role: Joi.string().valid('admin', 'agent').required().messages({
        'any.required': 'Role is required.',
        'any.only': 'Invalid user role. Only "admin" or "agent" is allowed.',
      }),
    });
    // Validate the incoming request body
    const { error } = thumbnailSchema.validate({ _id, role });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    let user;
    // Fetch the user based on role
    if (role === 'admin') {
      user = await adminModel.findById(_id);
    }
    // If user not found, return 404
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Return the profile thumbnail
    res.status(200).json({ profileThumbnail: user.profileThumbnail });
  } catch (error) {
    console.error('Error fetching profile thumbnail:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

export const editSubAdminStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  console.log(id)
  console.log(status)

  try {
    // Find the sub-admin by ID and update the status
    const updatedSubAdmin = await subAdminModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }  // 
    );

    // If sub-admin not found
    if (!updatedSubAdmin) {
      return res.status(404).json({ success: false, message: 'Sub-admin not found' });
    }

    // Respond with success message and updated data
    return res.status(200).json({
      success: true,
      message: `Sub-admin account ${status} successfully`,
      subAdmin: updatedSubAdmin,
    });
  } catch (error) {
    // Handle errors
    return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};


const editSubAdminSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),
});

// Edit Sub-Admin Details Controller
export const editSubAdminDetails = async (req, res) => {
  const { id } = req.params;
  const { name, email, password } = req.body;

  // Validate input using Joi schema
  const { error } = editSubAdminSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  try {
    // Prepare the update object
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) {
      // Hash the new password before saving it
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    // Find the sub-admin by ID and update their details
    const updatedSubAdmin = await subAdmin.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    // If sub-admin not found
    if (!updatedSubAdmin) {
      return res.status(404).json({ success: false, message: 'Sub-admin not found' });
    }

    // Respond with success message and updated data
    return res.status(200).json({
      success: true,
      message: 'Sub-admin details updated successfully',
      subAdmin: updatedSubAdmin,
    });
  } catch (error) {
    // Handle errors
    return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};








