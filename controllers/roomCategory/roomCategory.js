import roomCategory from "../../models/roomCategory.js";
import Joi from "joi";




// Add a new room category
export const addRoomCategory = async (req, res) => {

  const roomCategorySchema = Joi.object({
    AdminId: Joi.string(),
    type: Joi.string().min(3).max(50).required(),
  });

  try {
    // Validate request body
    const { error } = roomCategorySchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
  
    const { type } = req.body;
    const adminId = req.user._id;
   
    // Create a new room category document
    const newCategory = new roomCategory({
      type,
      adminId
    });
    await newCategory.save();

    res.status(201).json({ message: "Room category added successfully", data: newCategory });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all room categories
export const getRoomCategories = async (req, res) => {
  try {
    const categories = await roomCategory.find()
    res.status(200).json({ data: categories });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a room category by ID
export const updateRoomCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body; 

  
    if (!type) {
      return res.status(400).json({ message: "Type is required for updating the room category" });
    }
    
    const updatedCategory = await roomCategory.findByIdAndUpdate(
      id,
      { type }, 
      { new: true, runValidators: true } 
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Room category not found" });
    }

    res.status(200).json({ message: "Room category updated successfully", data: updatedCategory });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Delete a room category by ID
export const deleteRoomCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCategory = await roomCategory.findByIdAndDelete(id);

    if (!deletedCategory) return res.status(404).json({ message: "Room category not found" });

    res.status(200).json({ message: "Room category deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
