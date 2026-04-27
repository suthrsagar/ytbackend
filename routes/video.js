const express = require('express');
const router = express.Router();
const { 
  getVideos, 
  uploadVideo, 
  getVideoById, 
  likeVideo, 
  addComment, 
  getVideoComments 
} = require('../controllers/videoController');
const { protect } = require('../middlewares/auth');

router.route('/')
  .get(getVideos)
  .post(protect, uploadVideo);

router.route('/:id')
  .get(getVideoById);

router.route('/:id/like')
  .post(protect, likeVideo);

router.route('/:id/comment')
  .post(protect, addComment);

router.route('/:id/comments')
  .get(getVideoComments);

module.exports = router;
