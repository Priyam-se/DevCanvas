require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const Room = require('./models/Room');

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

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB gracefully...'))
  .catch(err => console.error('MongoDB connection error:', err));

const roomHistory = {};
const pendingSaves = new Set();

setInterval(async () => {
  if (pendingSaves.size === 0) return;
  
  console.log(`Flushing ${pendingSaves.size} rooms to MongoDB...`);
  
  for (const roomId of pendingSaves) {
    try {
      await Room.findOneAndUpdate(
        { roomId },
        { 
          roomId,
          history: roomHistory[roomId],
          lastUpdated: Date.now()
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error(`Error saving room ${roomId}:`, err);
    }
  }
  
  pendingSaves.clear();
}, 5000);

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  socket.on('join-room', async (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
    
    if (!roomHistory[roomId]) {
      try {
        const roomDoc = await Room.findOne({ roomId });
        roomHistory[roomId] = roomDoc ? roomDoc.history : [];
      } catch (err) {
        console.error('Error fetching room from DB:', err);
        roomHistory[roomId] = [];
      }
    }
    
    socket.emit('initial-history', roomHistory[roomId]);
  });

  socket.on('draw', ({ roomId, drawData }) => {
    if (roomHistory[roomId]) {
      roomHistory[roomId].push(drawData);
      pendingSaves.add(roomId); 
      socket.to(roomId).emit('draw', drawData);
    }
  });

  socket.on('clear', (roomId) => {
    roomHistory[roomId] = [];
    pendingSaves.add(roomId); 
    io.to(roomId).emit('clear');
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
