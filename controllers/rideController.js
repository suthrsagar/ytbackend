const Video = require('../models/Video');
const User = require('../models/User');
const Comment = require('../models/Comment');

// MAPPING LOGIC:
// Video -> Ride
// title -> pickup address
// description -> drop address
// videoUrl -> coordinates JSON
// views -> fare
// duration -> distance
// creator -> passenger
// channelId -> passenger (to pass validation)
// likes[0] -> assigned driver
// category -> ride status string
// Comments -> Ride update logs

exports.requestRide = async (req, res) => {
  try {
    const { pickupLocation, dropLocation, rideType } = req.body;
    
    const distance = Math.random() * 10 + 2; // Mock distance
    const fare = distance * 15; // Mock fare

    const newRide = new Video({
      title: pickupLocation.address,
      description: dropLocation.address,
      videoUrl: JSON.stringify({ pickup: pickupLocation.coordinates, drop: dropLocation.coordinates }),
      thumbnailUrl: rideType || 'regular',
      creator: req.user.id,
      channelId: req.user.id, 
      views: fare,
      duration: distance,
      category: 'searching', // Initial status
      type: 'video'
    });

    const savedRide = await newRide.save();
    
    // Create log using Comment
    await new Comment({ text: 'Ride requested', user: req.user.id, video: savedRide._id }).save();

    res.status(201).json(mapVideoToRide(savedRide));
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.getNearbyDrivers = async (req, res) => {
  try {
    const drivers = await User.find({ role: 'driver', driverStatus: 'online' }).select('-password');
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.acceptRide = async (req, res) => {
  try {
    const ride = await Video.findById(req.params.id);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });
    if (ride.category !== 'searching') return res.status(400).json({ message: 'Ride is no longer available' });

    ride.category = 'accepted';
    // Use likes array to store the driver ID as requested "Likes -> Ride Actions/Status"
    ride.likes.push(req.user.id);
    await ride.save();

    await User.findByIdAndUpdate(req.user.id, { driverStatus: 'in-ride' });
    await new Comment({ text: 'Driver accepted ride', user: req.user.id, video: ride._id }).save();

    const updatedRide = await Video.findById(ride._id).populate('creator', 'username avatar').populate('likes', 'username avatar vehicleDetails');
    res.json(mapVideoToRide(updatedRide));
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.updateRideStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const ride = await Video.findById(req.params.id);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });

    ride.category = status;
    await ride.save();
    
    await new Comment({ text: `Ride status updated to ${status}`, user: req.user.id, video: ride._id }).save();

    if (status === 'completed' || status === 'cancelled') {
      if (ride.likes && ride.likes.length > 0) {
        await User.findByIdAndUpdate(ride.likes[0], { driverStatus: 'online' });
      }
    }
    
    const updatedRide = await Video.findById(ride._id).populate('creator', 'username avatar').populate('likes', 'username avatar vehicleDetails');
    res.json(mapVideoToRide(updatedRide));
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.getCurrentRide = async (req, res) => {
  try {
    const ride = await Video.findOne({
      $or: [{ creator: req.user.id }, { likes: req.user.id }],
      category: { $in: ['searching', 'accepted', 'arriving', 'in_progress'] }
    }).populate('creator', 'username avatar').populate('likes', 'username avatar vehicleDetails');

    if (!ride) return res.status(404).json({ message: 'No active ride' });
    res.json(mapVideoToRide(ride));
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.getAvailableRides = async (req, res) => {
  try {
    const rides = await Video.find({ category: 'searching' })
      .populate('creator', 'username avatar rating')
      .sort({ createdAt: -1 });
    res.json(rides.map(mapVideoToRide));
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Helper to transform Video model structure back to Ride structure for the frontend
function mapVideoToRide(v) {
  let coords = { pickup: [0,0], drop: [0,0] };
  try { coords = JSON.parse(v.videoUrl); } catch(e){}
  
  return {
    _id: v._id,
    passenger: v.creator,
    driver: v.likes && v.likes.length > 0 ? v.likes[0] : null,
    pickupLocation: { address: v.title, coordinates: coords.pickup },
    dropLocation: { address: v.description, coordinates: coords.drop },
    rideType: v.thumbnailUrl,
    status: v.category,
    fare: v.views,
    distance: v.duration,
    createdAt: v.createdAt
  };
}
