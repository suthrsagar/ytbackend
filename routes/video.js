const express = require('express');
const router = express.Router();
const { 
  getVideos, 
  uploadVideo, 
  getVideoById, 
  likeVideo, 
  addComment, 
  getVideoComments,
  incrementView
} = require('../controllers/videoController');
const { protect } = require('../middlewares/auth');
const { upload } = require('../utils/cloudinary');

router.route('/')
  .get(getVideos)
  .post(protect, upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), uploadVideo);

router.route('/:id')
  .get(getVideoById);

router.route('/:id/view')
  .post(incrementView);

router.route('/:id/like')
  .post(protect, likeVideo);

router.route('/:id/comment')
  .post(protect, addComment);

router.route('/:id/comments')
  .get(getVideoComments);

module.exports = router;
