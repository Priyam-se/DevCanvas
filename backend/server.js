require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', 
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;

// In-memory state: { roomId: [stroke1, stroke2, ...] }
const roomHistory = {};

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
    
    // Initialize room history if it doesn't exist
    if (!roomHistory[roomId]) {
      roomHistory[roomId] = [];
    }
    
    // Send existing history to the new client
    socket.emit('initial-history', roomHistory[roomId]);
  });

  socket.on('draw', ({ roomId, drawData }) => {
    if (roomHistory[roomId]) {
      roomHistory[roomId].push(drawData);
      socket.to(roomId).emit('draw', drawData);
    }
  });

  socket.on('clear', (roomId) => {
    roomHistory[roomId] = [];
    io.to(roomId).emit('clear');
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
