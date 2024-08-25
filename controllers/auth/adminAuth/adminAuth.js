import Admin from "../../../models/adminAuth.js";
import bcrypt from 'bcrypt';
import Joi from 'joi';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 5;
const JWT_SECRET = process.env.JWT_SECRET || 'Akash';

export const adminSignup = async (req, res) => {
    const imageUrl = req.file ? req.file.path : null;

    // Validation schema for user input
    const validateUser = (user) => {
        const schema = Joi.object({
            role: Joi.string().valid('admin').required(),
            name: Joi.string().min(3).max(30).required(),
            number: Joi.string().pattern(/^\d{10}$/).required(), 
            password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
            email: Joi.string().email({ minDomainSegments: 2 }).required(),
        });
        return schema.validate(user);
    };

    try {
        // Validate user input
        const { error } = validateUser(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        // Check if the user already exists
        let user = await Admin.findOne({ email: req.body.email });
        if (user) return res.status(400).json({ message: 'User already registered.' });

        // Create a new user
        user = new Admin({
            name: req.body.name,
            number: req.body.number,
            email: req.body.email,
            password: req.body.password,
            role: req.body.role,
            imageUrl: imageUrl
        });

        // Hash the user's password
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        user.password = await bcrypt.hash(user.password, salt);

        // Save the user to the database
        await user.save();
        res.status(201).json({ message: 'Admin account has been created.', user });
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
};

export const login = async (req, res) => {
    // Validation schema for login input
    const validateLogin = (user) => {
        const schema = Joi.object({
            email: Joi.string().email({ minDomainSegments: 2 }).required(),
            password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
        });
        return schema.validate(user);
    };

    try {
        // Validate login input
        const { error } = validateLogin(req.body);
        if (error) return res.status(400).json({ message: 'Invalid email or password.' });

        // Check if the user exists
        const user = await Admin.findOne({ email: req.body.email });
        if (!user) return res.status(400).json({ message: 'Invalid email or password.' });

        // Validate the password
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.status(400).json({ message: 'Invalid email or password.' });

        // Generate a JWT token
        const token = jwt.sign({ _id: user._id, role: user.role, name: user.name }, JWT_SECRET);

        // Respond with the token and user info
        res.status(200).json({ message: `${user.role} login successful.`, token, role: user.role, name: user.name });
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
};
