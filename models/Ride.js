const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  passengerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  pickupLocation: {
    address: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  dropLocation: {
    address: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  status: {
    type: String,
    enum: ['searching', 'accepted', 'arriving', 'in_progress', 'completed', 'cancelled'],
    default: 'searching'
  },
  fare: { type: Number, default: 0 },
  distance: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Ride', rideSchema);
