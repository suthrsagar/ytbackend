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
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const rideRoutes = require('./routes/ride');

app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);

// Socket.io Logic
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join a specific ride room for real-time tracking
  socket.on('joinRide', (rideId) => {
    socket.join(rideId);
    console.log(`User joined ride: ${rideId}`);
  });

  // Handle location updates from driver
  socket.on('updateLocation', (data) => {
    // data: { rideId, location: { lat, lng } }
    io.to(data.rideId).emit('locationUpdated', data.location);
  });

  // Handle status updates
  socket.on('rideStatusUpdate', (data) => {
    // data: { rideId, status }
    io.to(data.rideId).emit('statusUpdated', data.status);
  });

  // Driver going online/offline
  socket.on('driverStatus', (data) => {
    // Notify passengers searching for rides
    io.emit('driverStatusChanged', data);
  });

  socket.on('leaveRide', (rideId) => {
    socket.leave(rideId);
    console.log(`User left ride: ${rideId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.get('/', (req, res) => {
  res.send('Ride Booking API is running');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
