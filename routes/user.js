const express = require('express');
const router = express.Router();
const { getProfile, followUser, unfollowUser, searchUsers, createChannel, subscribeChannel, unsubscribeChannel } = require('../controllers/userController');
const { protect } = require('../middlewares/auth');

router.route('/profile').get(protect, getProfile);
router.route('/follow/:id').post(protect, followUser);
router.route('/unfollow/:id').post(protect, unfollowUser);
router.route('/channel/:id/subscribe').post(protect, subscribeChannel);
router.route('/channel/:id/unsubscribe').post(protect, unsubscribeChannel);
router.route('/search').get(protect, searchUsers);
router.route('/channel/create').post(protect, createChannel);

module.exports = router;
