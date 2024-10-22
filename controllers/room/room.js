import roomModel from "../../models/rooms.js";
import roomCategory from "../../models/roomCategory.js";
import Joi from "joi";

// Controller to add a new room
export const addRoom = async (req, res) => {
  // Validation schema for adding a new room
  const validateRoom = Joi.object({
    roomNumber: Joi.number().integer().required(),
    type: Joi.string().trim().required(),
    rent: Joi.number().required(),
    airConditioner: Joi.string().trim().valid("ac", "non ac").required(),
    bedCapacity: Joi.number().required(),
    status: Joi.string().trim().valid("booked", "open", "inactive"),
  });

  // Validate request body
  const { error } = validateRoom.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ message: "Validation error", error: error.details[0].message });
  }

  const { roomNumber, type, rent, bedCapacity, airConditioner, status } = req.body;

  try {
    // Check if room number already exists
    const existingRoom = await roomModel.findOne({ roomNumber });
    if (existingRoom) {
      return res.status(400).json({ message: "Room number already exists." });
    }

    // Check if the provided type exists in roomCategory collection
    const category = await roomCategory.findById(type);
    if (!category) {
      return res
        .status(400)
        .json({ message: "Invalid room type. Room category does not exist." });
    }

    // Create new room
    const newRoom = new roomModel({
      roomNumber,
      type: category._id,
      rent,
      bedCapacity,
      airConditioner,
      status,
      adminId: req.user.adminId || req.user._id
    });



    // Save new room
    await newRoom.save();

    // Increment number of rooms in roomCategory
    await roomCategory.updateOne(
      { _id: category._id },
      { $inc: { numberOfRooms: 1 } }
    );

    res.status(201).json({ message: "Room added successfully", room: newRoom });
  } catch (err) {
    res.status(500).json({ message: "Failed to add room", error: err.message });
  }
};

// Controller to get all rooms for an admin
export const getRooms = async (req, res) => {
  const adminId = req.user.adminId || req.user._id;

  try {
    const rooms = await roomModel.find({ adminId }).populate("type", "type name");

    res.status(200).json({ rooms });
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve rooms", error: err.message });
  }
};

// Controller to update a room

export const updateRoom = async (req, res) => {


  const { id } = req.params;
  const { roomNumber, type, rent, bedCapacity, airConditioner, status } = req.body;



  const validateRoomUpdate = Joi.object({
    roomNumber: Joi.number().integer(),
    type: Joi.string(),
    rent: Joi.number().required(),
    airConditioner: Joi.string().trim().valid("ac", "non ac").required(),
    bedCapacity: Joi.number().required(),
    status: Joi.string().valid("booked", "open", "inactive"),
  });

  // Validate request body
  const { error } = validateRoomUpdate.validate(req.body);
  if (error) {
    return res.status(400).json({ message: "Validation error", error: error.details[0].message });
  }

  try {
   
    // Find and update the room
    const room = await roomModel.findByIdAndUpdate(id, { roomNumber, type, rent, bedCapacity, airConditioner, status }, { new: true });
    if (!room) return res.status(404).json({ message: "Room not found" });

    res.status(200).json({ message: "Room updated successfully", room });
  } catch (err) {
    res.status(500).json({ message: "Failed to update room", error: err.message });
  }
};

// Controller to delete a room
export const deleteRoom = async (req, res) => {
  const { id } = req.params;
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Only admins can delete rooms." });
    }

    const room = await roomModel.findByIdAndDelete(id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    // Decrement the number of rooms in roomCategory after deletion
    await roomCategory.updateOne(
      { _id: room.type },
      { $inc: { numberOfRooms: -1 } }
    );

    res.status(200).json({ message: "Room deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete room", error: err.message });
  }
};
