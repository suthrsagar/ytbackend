require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io for Real-time features
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const streamRoutes = require('./routes/stream');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/streams', streamRoutes);

// Socket.io Logic
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join a specific stream room
  socket.on('joinStream', (streamId) => {
    socket.join(streamId);
    console.log(`User joined stream: ${streamId}`);
  });

  // Handle chat messages
  socket.on('sendMessage', (data) => {
    // data should contain { streamId, user: { username, avatar }, message }
    io.to(data.streamId).emit('newMessage', data);
  });

  // Handle likes/hearts
  socket.on('sendLike', (streamId) => {
    io.to(streamId).emit('newLike');
  });

  // Handle viewers count (basic implementation)
  socket.on('leaveStream', (streamId) => {
    socket.leave(streamId);
    console.log(`User left stream: ${streamId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.get('/', (req, res) => {
  res.send('StreamSphere API is running');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Cloudinary Connected');
});
