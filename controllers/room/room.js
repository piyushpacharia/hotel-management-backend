import Room from "../../models/rooms.js";
import Joi from "joi";

const validateRoom = (room) => {
    const schema = Joi.object({
        roomNumber: Joi.number().integer().required(),
        type: Joi.string().valid("Single", "Double", "Suite").required(),
        price: Joi.number().required(),
        amenities: Joi.array().items(Joi.string()).required(),
        description: Joi.string().allow('').required(),
        availability: Joi.boolean().default(true),
    });
    return schema.validate(room);
};

export const addRoom = async (req, res) => {
    // Validate request body
    const { error, value } = validateRoom(req.body);
    if (error) return res.status(400).json({ message: 'Validation error', error: error.details[0].message });

    try {

        console.log(req.user._id)
        const newRoom = new Room({
            ...value,
            createdBy: req.user._id,
        });

        // Save the room to the database
        await newRoom.save();

        res.status(201).json({ message: 'Room added successfully', room: newRoom });
    } catch (err) {
        res.status(500).json({ message: 'Failed to add room', error: err.message });
    }
};

export const getRooms = async (req, res) => {
    try {
        const rooms = await Room.find();
        res.status(200).json({ rooms });
    } catch (err) {
        res.status(500).json({ message: 'Failed to retrieve rooms', error: err.message });
    }
};

const validateRoomUpdate = (room) => {
    const schema = Joi.object({
        roomNumber: Joi.number().integer(),
        type: Joi.string().valid("Single", "Double", "Suite"),
        price: Joi.number(),
        amenities: Joi.array().items(Joi.string()),
        description: Joi.string().allow(''),
        availability: Joi.boolean(),
    });
    return schema.validate(room);
};

export const updateRoom = async (req, res) => {
    const { error } = validateRoomUpdate(req.body);
    if (error) return res.status(400).json({ message: 'Validation error', error: error.details[0].message });

    try {
        const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!room) return res.status(404).json({ message: 'Room not found' });

        res.status(200).json({ message: 'Room updated successfully', room });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update room', error: err.message });
    }
};

export const deleteRoom = async (req, res) => {
    try {

        console.log(req.user.role)
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Only admins can delete rooms.' });
        }

        const room = await Room.findByIdAndDelete(req.params.id);
        if (!room) return res.status(404).json({ message: 'Room not found' });

        res.status(200).json({ message: 'Room deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete room', error: err.message });
    }
};





