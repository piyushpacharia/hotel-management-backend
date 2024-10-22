// Import packages
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoute/auth.routes.js';
import addRoomRoute from './routes/roomRoute/room.routes.js';
import roomCategory from './routes/roomCategoryRoute/roomCategory.routes.js';
import incomeRoute from "./routes/incomeRoute/income.routes.js"
import expenseRoute from "./routes/expenseRoute/expense.routes.js"
import packageRoute from "./routes/packageRoute/package.routes.js"
import bookingRoute from "./routes/bookingRoute/booking.routes.js"
import employeeRoute from "./routes/employeeRoute/employee.routes.js"
import attendanceRoute from "./routes/attedanceRoute/attendance.Routes.js"
import paySlipRoute from "./routes/paySlipRoute/paySlip.Routes.js"
import mealRoute from "./routes/mealRoute/meal.Routes.js"
import taxRoute from "./routes/taxRoute/tax.Routes.js"
import bookingSourceRoute from "./routes/bookingSourceRoute/bookingSource.Routes.js"
import ledgerRoute from "./routes/ledgerRoute/ledger.Routes.js"
import loungeRoute from "./routes/lounge/lounge.Routes.js"


import errorHandler from './middleware/errorHandler.js';


const app = express();


app.use(cors());
app.use(express.json());
app.use(errorHandler);

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
app.use('/category', roomCategory);
app.use('/income', incomeRoute);
app.use('/expense', expenseRoute);
app.use('/package', packageRoute);
app.use('/booking', bookingRoute);
app.use('/employee', employeeRoute);
app.use('/attendance', attendanceRoute);
app.use('/salary', paySlipRoute);
app.use('/meal', mealRoute);
app.use('/tax', taxRoute);
app.use('/source', bookingSourceRoute);
app.use('/ledger', ledgerRoute);
app.use('/lounge', loungeRoute);


// Setup port
const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`Server is running on port number: ${port}`);
});
