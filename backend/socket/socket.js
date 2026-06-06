import { Server } from 'socket.io';
import http from 'http';
import express from 'express';

const app = express(); // app is used for storing routes and middlewares in Express.js

const server = http.createServer(app); // server is used for creating a server with http

const io = new Server(server, {
  // io is used for creating a server with Socket.IO
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

const userSocketMap = {}; // {userId: socketId}

io.on('connection', (socket) => {
  // event listener for incoming connections : when a client connects
  //console.log('a user connected', socket.id);

  const userId = socket.handshake.query.userId; // get user ID from the handshake query
  if (userId && userId !== 'undefined') {
    userSocketMap[userId] = socket.id;
  }

  // io.emit() is used to send events to all the connected clients
  io.emit('getOnlineUsers', Object.keys(userSocketMap));

  socket.on('disconnect', () => {
    //console.log('user disconnected', socket.id);
    if (userId) {
      delete userSocketMap[userId];
    }
    io.emit('getOnlineUsers', Object.keys(userSocketMap));
  });
});

export { app, io, server };
