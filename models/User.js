const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: 'https://res.cloudinary.com/demo/image/upload/v1583344600/sample.jpg' },
  bio: { type: String, default: '' },
  role: { type: String, enum: ['passenger', 'driver'], default: 'passenger' },
  currentLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
  },
  driverStatus: { type: String, enum: ['online', 'offline', 'in-ride'], default: 'offline' },
  vehicleDetails: {
    type: { type: String }, // e.g., 'Sedan', 'SUV', 'Bike'
    model: { type: String },
    color: { type: String },
    plateNumber: { type: String }
  },
  rating: { type: Number, default: 5.0 },
  rideHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ride' }]
}, { timestamps: true });

userSchema.index({ currentLocation: "2dsphere" });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
