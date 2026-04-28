const express = require('express');
const router = express.Router();
const { register, login, updateDriverStatus, updateLocation } = require('../controllers/authController');
const { protect, authorize } = require('../middlewares/auth');
const { upload } = require('../utils/cloudinary');

router.post('/register', upload.single('profileImage'), register);
router.post('/login', login);

router.put('/status', protect, authorize('rider'), updateDriverStatus);
router.put('/location', protect, authorize('rider'), updateLocation);

module.exports = router;
