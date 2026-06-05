// Express
import express from 'express';
import { app, server } from './socket/socket.js';

app.use(express.json());

// Environment variables
import dotenv from 'dotenv';
dotenv.config();
const PORT = process.env.PORT || 3000;

// Cookie parser
import cookieParser from 'cookie-parser';
app.use(cookieParser());

// CORS
import cors from 'cors';
app.use(cors());

// Routes
import authRoutes from './routes/auth.route.js';
app.use('/api/auth', authRoutes);
import messageRoutes from './routes/message.route.js';
app.use('/api/messages', messageRoutes);
import userRoutes from './routes/user.route.js';
app.use('/api/users', userRoutes);

//! build for web deployment
// import path from 'path';
// const __dirname = path.resolve();
// app.use(express.static(path.join(__dirname, '/frontend/dist')));
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
// });

// Database connection and server listening
import connectToMongoDB from './db/connectToMongoDB.js';
server.listen(PORT, () => {
  connectToMongoDB();
  console.log(`Server running on port ${PORT}`);
});
