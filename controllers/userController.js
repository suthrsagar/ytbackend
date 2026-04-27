const User = require('../models/User');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('subscribers', 'username avatar')
      .populate('subscriptions', 'username avatar');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!userToFollow) return res.status(404).json({ message: 'User not found' });

    if (!currentUser.subscriptions.includes(userToFollow._id)) {
      currentUser.subscriptions.push(userToFollow._id);
      userToFollow.subscribers.push(currentUser._id);
      await currentUser.save();
      await userToFollow.save();
      res.json({ message: 'User subscribed successfully' });
    } else {
      res.status(400).json({ message: 'Already subscribed' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.unfollowUser = async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!userToUnfollow) return res.status(404).json({ message: 'User not found' });

    if (currentUser.subscriptions.includes(userToUnfollow._id)) {
      currentUser.subscriptions = currentUser.subscriptions.filter(id => id.toString() !== userToUnfollow._id.toString());
      userToUnfollow.subscribers = userToUnfollow.subscribers.filter(id => id.toString() !== currentUser._id.toString());
      await currentUser.save();
      await userToUnfollow.save();
      res.json({ message: 'User unsubscribed successfully' });
    } else {
      res.status(400).json({ message: 'Not subscribed to this user' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const keyword = req.query.keyword ? {
      username: { $regex: req.query.keyword, $options: 'i' }
    } : {};
    const users = await User.find({ ...keyword, _id: { $ne: req.user._id } }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// NEW: Create Channel logic
exports.createChannel = async (req, res) => {
  try {
    const { channelName, channelDescription, channelCategory, bannerUrl } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isChannel = true;
    user.channelName = channelName;
    user.bio = channelDescription; // Using bio as description
    user.channelCategory = channelCategory;
    if (bannerUrl) user.channelBanner = bannerUrl;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
