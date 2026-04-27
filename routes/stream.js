const express = require('express');
const router = express.Router();
const { goLive, endStream, getActiveStreams, getStreamDetails } = require('../controllers/streamController');
const { protect } = require('../middlewares/auth');
const { upload } = require('../utils/cloudinary');

router.route('/')
  .get(getActiveStreams)
  .post(protect, upload.single('thumbnail'), goLive);

router.route('/:id')
  .get(getStreamDetails)
  .put(protect, endStream);

module.exports = router;
