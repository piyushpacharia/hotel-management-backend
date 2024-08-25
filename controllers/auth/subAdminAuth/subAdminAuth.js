import SubAdmin from '../../../models/subAdminAuth.js';
import bcrypt from 'bcrypt';
import Joi from 'joi';

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 5;

export const subAdminRegister = async (req, res) => {
    
    // Validation schema for user input
    const validateUser = (user) => {
        const schema = Joi.object({
          
            name: Joi.string().min(3).max(30).required(),
            password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
            email: Joi.string().email({ minDomainSegments: 2 }).required(),
            role: Joi.string().valid('subAdmin').required(),
        });
        return schema.validate(user);
    };

    try {
        // Log the request body for debugging
        

        // Validate user input
        const { error } = validateUser(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        // Check if the user already exists
        let user = await SubAdmin.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ message: 'User already registered.' });
        }

        // Create a new sub-admin user
        user = new SubAdmin({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            role: req.body.role,
            createdBy: req.user._id  
        });

        // Hash the user's password
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        user.password = await bcrypt.hash(user.password, salt);

        // Save the user to the database
        await user.save();

        res.status(201).json({ message: 'Sub-Admin account has been created.', user });
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
};
