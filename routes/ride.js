const express = require('express');
const router = express.Router();
const { 
  createRide, 
  getNearbyDrivers, 
  acceptRide, 
  updateRideStatus, 
  getActiveRide, 
  getAvailableRides 
} = require('../controllers/rideController');
const { protect, authorize } = require('../middlewares/auth');

router.post('/create', protect, authorize('passenger'), createRide);
router.get('/nearby-drivers', protect, getNearbyDrivers);
router.get('/active', protect, getActiveRide);
router.get('/available', protect, authorize('rider'), getAvailableRides);
router.put('/:id/accept', protect, authorize('rider'), acceptRide);
router.put('/:id/status', protect, updateRideStatus);

module.exports = router;
