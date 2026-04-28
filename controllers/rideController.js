const Ride = require('../models/Ride');
const User = require('../models/User');

exports.createRide = async (req, res) => {
  try {
    const { pickupLocation, dropLocation, distance, fare } = req.body;
    
    const ride = await Ride.create({
      passengerId: req.user.id,
      pickupLocation,
      dropLocation,
      distance: distance || 0,
      fare: fare || 0,
      status: 'searching'
    });

    res.status(201).json(ride);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.getNearbyDrivers = async (req, res) => {
  try {
    // Basic implementation: get all online drivers
    // In a real app we would use geospatial queries $near
    const drivers = await User.find({ role: 'rider', driverStatus: 'online' }).select('-password');
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.acceptRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });
    if (ride.status !== 'searching') return res.status(400).json({ message: 'Ride is no longer available' });

    ride.driverId = req.user.id;
    ride.status = 'accepted';
    await ride.save();

    await User.findByIdAndUpdate(req.user.id, { driverStatus: 'in-ride' });

    const updatedRide = await Ride.findById(ride._id).populate('passengerId', 'name profileImage phone').populate('driverId', 'name profileImage phone');
    res.json(updatedRide);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.updateRideStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const ride = await Ride.findById(req.params.id);
    
    if (!ride) return res.status(404).json({ message: 'Ride not found' });
    
    ride.status = status;
    await ride.save();

    if (status === 'completed' || status === 'cancelled') {
      if (ride.driverId) {
        await User.findByIdAndUpdate(ride.driverId, { driverStatus: 'online' });
      }
    }

    const updatedRide = await Ride.findById(ride._id).populate('passengerId', 'name profileImage phone').populate('driverId', 'name profileImage phone');
    res.json(updatedRide);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.getActiveRide = async (req, res) => {
  try {
    const ride = await Ride.findOne({
      $or: [{ passengerId: req.user.id }, { driverId: req.user.id }],
      status: { $in: ['searching', 'accepted', 'arriving', 'in_progress'] }
    }).populate('passengerId', 'name profileImage phone').populate('driverId', 'name profileImage phone');

    if (!ride) return res.status(404).json({ message: 'No active ride found' });
    res.json(ride);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.getAvailableRides = async (req, res) => {
  try {
    const rides = await Ride.find({ status: 'searching' }).populate('passengerId', 'name profileImage').sort({ createdAt: -1 });
    res.json(rides);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
