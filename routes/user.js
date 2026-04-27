const express = require('express');
const router = express.Router();
const { getProfile, followUser, unfollowUser, searchUsers, createChannel, subscribeChannel, unsubscribeChannel, updateProfileImage } = require('../controllers/userController');
const { protect } = require('../middlewares/auth');
const { upload } = require('../utils/cloudinary');

router.route('/profile').get(protect, getProfile);
router.route('/profile/avatar').post(protect, upload.single('avatar'), updateProfileImage);
router.route('/follow/:id').post(protect, followUser);
router.route('/unfollow/:id').post(protect, unfollowUser);
router.route('/channel/:id/subscribe').post(protect, subscribeChannel);
router.route('/channel/:id/unsubscribe').post(protect, unsubscribeChannel);
router.route('/search').get(protect, searchUsers);
router.route('/channel/create').post(protect, createChannel);

module.exports = router;
