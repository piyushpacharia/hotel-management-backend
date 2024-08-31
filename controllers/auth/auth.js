import adminModel from "../../models/adminAuth.js";
import subAdminModel from '../../models/subAdminAuth.js';
import JWTService from '../../services/JWTService.js';
import bcrypt from 'bcrypt';
import Joi from 'joi';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 5;
const JWT_SECRET = process.env.JWT_SECRET || 'Akash';


export const adminSignup = async (req, res) => {
    const profile_thumbnail = req.file ? req.file.path : null;

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
            profile_thumbnail: profile_thumbnail,
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
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  const { email, password } = req.body;

  try {
    // Check if the user exists in adminModel or subAdminModel
    let user = await adminModel.findOne({ email: email });
    if (!user) {
      user = await subAdminModel.findOne({ email: email });
    }

    // If user not found, return 401
    if (!user) {
      return res.status(401).json({ success: false, message: "Email Not Found" });
    }

    // Compare provided password with stored hashed password
    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
      }

      if (result) {
        // Generate JWT token
        const token = JWTService.sign(
          {
            _id: user._id,
            name: user.name,
            role: user.role,
            adminId: user.adminId
          },
        );

        // Send response with Bearer token
        return res.status(200).json({
          success: true,
          message: "Logged In Successfully",
          token: `Bearer ${token}`, // Include Bearer prefix
          role: user.role
        });
      } else {
        // Incorrect password
        return res.status(401).json({ success: false, message: "Incorrect Password" });
      }
    });
  } catch (err) {
    // Catch and handle any errors that occur during processing
    return res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
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








