const express = require('express');
const router = express.Router();
const { 
  requestRide, 
  getNearbyDrivers, 
  acceptRide, 
  updateRideStatus, 
  getCurrentRide,
  getAvailableRides
} = require('../controllers/rideController');
const { protect } = require('../middlewares/auth');

router.route('/request')
  .post(protect, requestRide);

router.route('/drivers/nearby')
  .get(protect, getNearbyDrivers);

router.route('/available')
  .get(protect, getAvailableRides);

router.route('/current')
  .get(protect, getCurrentRide);

router.route('/:id/accept')
  .put(protect, acceptRide);

router.route('/:id/status')
  .put(protect, updateRideStatus);

module.exports = router;
