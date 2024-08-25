// Import packages
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoute/authRoutes.js';
import addRoomRoute from './routes/rooms/roomRoute.js';

const app = express();


app.use(cors());
app.use(express.json());

dotenv.config();

// Database connection
mongoose.connect(process.env.DATA_BASE)
    .then(() => console.log("Database connected"))
    .catch((err) => console.log("Error occurred in database", err.message));

// Setup __dirname and __filename for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route handling
app.use('/auth', authRoutes);
app.use('/rooms', addRoomRoute);


// Setup port
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is running on port number: ${port}`);
});
