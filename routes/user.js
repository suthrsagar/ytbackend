const express = require('express');
const router = express.Router();
const { getProfile, followUser, unfollowUser, searchUsers } = require('../controllers/userController');
const { protect } = require('../middlewares/auth');

router.route('/profile').get(protect, getProfile);
router.route('/follow/:id').post(protect, followUser);
router.route('/unfollow/:id').post(protect, unfollowUser);
router.route('/search').get(protect, searchUsers);

module.exports = router;
