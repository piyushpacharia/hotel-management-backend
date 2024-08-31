import roomModel from "../../models/rooms.js";
import roomCategory from "../../models/roomCategory.js";
import Joi from "joi";

export const addRoom = async (req, res) => {
  // Validation schema for adding a new room
  const validateRoom = Joi.object({
    roomNumber: Joi.number().integer().required(),
    type: Joi.string().required(),
    rent: Joi.number().required(),
    amenities: Joi.array().items(Joi.string()).required(),
    bedCapacity: Joi.number().required(),
    status: Joi.string().trim().valid("booked", "open", "inactive"),
  });

  // Validate request body
  const { error } = validateRoom.validate(req.body);
  if (error)
    return res.status(400).json({ message: "Validation error", error: error.details[0].message });

  const { roomNumber, type, rent, bedCapacity, amenities, status } = req.body;

  try {
    // Check if the provided type exists in roomCategory collection
    const category = await roomCategory.findOne({ type });
    if (!category) {
      return res.status(400).json({ message: "Invalid room type. Room category does not exist." });
    }

    // Create a new room instance
    const newRoom = new roomModel({
      roomNumber,
      type,
      rent,
      bedCapacity,
      amenities,
      status,
    });

    // Save the room to the database
    await newRoom.save();

    res.status(201).json({ message: "Room added successfully", room: newRoom });
  } catch (err) {
    res.status(500).json({ message: "Failed to add room", error: err.message });
  }
};

export const getRooms = async (req, res) => {
  try {
    const rooms = await roomModel.find();
    res.status(200).json({ rooms });
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve rooms", error: err.message });
  }
};

export const updateRoom = async (req, res) => {
  const { id } = req.params;

  const validateRoomUpdate = Joi.object({
    roomNumber: Joi.number().integer(),
    type: Joi.string(),
    rent: Joi.number(),
    amenities: Joi.array().items(Joi.string()),
    bedCapacity: Joi.number(),
    status: Joi.string().valid("booked", "open", "inactive"),
  });

  // Validate request body
  const { error } = validateRoomUpdate.validate(req.body);
  if (error)
    return res.status(400).json({ message: "Validation error", error: error.details[0].message });

  try {
    if (req.body.type) {
      const category = await roomCategory.findOne({ type: req.body.type });
      if (!category) {
        return res.status(400).json({ message: "Invalid room type. Room category does not exist." });
      }
    }

    // Find and update the room
    const room = await roomModel.findByIdAndUpdate(id, req.body, { new: true });
    if (!room) return res.status(404).json({ message: "Room not found" });

    res.status(200).json({ message: "Room updated successfully", room });
  } catch (err) {
    res.status(500).json({ message: "Failed to update room", error: err.message });
  }
};

export const deleteRoom = async (req, res) => {
  const { id } = req.params;
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Only admins can delete rooms." });
    }

    const room = await roomModel.findByIdAndDelete(id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    res.status(200).json({ message: "Room deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete room", error: err.message });
  }
};
