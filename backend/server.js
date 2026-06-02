// Express
import express from "express";
const app = express();
app.use(express.json());

// Environment variables
import dotenv from "dotenv";
dotenv.config();
const PORT = process.env.PORT || 5000;

// Cookie parser
import cookieParser from "cookie-parser";
app.use(cookieParser());

// CORS
import cors from "cors";
app.use(cors());

// Routes
import authRoutes from "./routes/auth.route.js";
app.use("/api/auth", authRoutes);
import messageRoutes from "./routes/message.route.js";
app.use("/api/messages", messageRoutes);

// Database connection and server listening
import connectToMongoDB from "./db/connectToMongoDB.js";
app.listen(PORT, () => {
  connectToMongoDB();
  console.log(`Server running on port ${PORT}`);
});
