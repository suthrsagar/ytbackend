const User = require('../models/User');
const Channel = require('../models/Channel');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('subscribers', 'username avatar')
      .populate('subscriptions', 'username avatar')
      .populate('channelId');
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
    const { channelName, description, channelLogo, bannerUrl } = req.body;
    
    if (!channelName || !description) {
      return res.status(400).json({ message: 'Channel Name and Description are required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const newChannel = new Channel({
      channelName,
      description,
      channelLogo: channelLogo || user.avatar,
      bannerUrl,
      user: user._id
    });

    const savedChannel = await newChannel.save();

    user.channelId = savedChannel._id;
    await user.save();

    res.json({ success: true, channel: savedChannel });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.subscribeChannel = async (req, res) => {
  try {
    const channelId = req.params.id;
    const channel = await Channel.findById(channelId);
    const currentUser = await User.findById(req.user._id);

    if (!channel) return res.status(404).json({ message: 'Channel not found' });

    if (!currentUser.subscriptions.includes(channel._id)) {
      currentUser.subscriptions.push(channel._id);
      if (!channel.subscribers.includes(currentUser._id)) {
        channel.subscribers.push(currentUser._id);
      }
      await currentUser.save();
      await channel.save();
      res.json({ message: 'Subscribed successfully', subscribersCount: channel.subscribers.length });
    } else {
      res.status(400).json({ message: 'Already subscribed' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.unsubscribeChannel = async (req, res) => {
  try {
    const channelId = req.params.id;
    const channel = await Channel.findById(channelId);
    const currentUser = await User.findById(req.user._id);

    if (!channel) return res.status(404).json({ message: 'Channel not found' });

    if (currentUser.subscriptions.includes(channel._id)) {
      currentUser.subscriptions = currentUser.subscriptions.filter(id => id.toString() !== channel._id.toString());
      channel.subscribers = channel.subscribers.filter(id => id.toString() !== currentUser._id.toString());
      await currentUser.save();
      await channel.save();
      res.json({ message: 'Unsubscribed successfully', subscribersCount: channel.subscribers.length });
    } else {
      res.status(400).json({ message: 'Not subscribed to this channel' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfileImage = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!req.file) return res.status(400).json({ message: 'No image provided' });

    user.avatar = req.file.path;
    await user.save();

    res.json({ success: true, avatar: user.avatar });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
