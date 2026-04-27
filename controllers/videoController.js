const Video = require('../models/Video');
const Comment = require('../models/Comment');
const User = require('../models/User');
const Channel = require('../models/Channel');

// @desc    Get all videos (Feed)
// @route   GET /api/videos
// @access  Public
exports.getVideos = async (req, res) => {
  try {
    const type = req.query.type || 'video'; // 'video' or 'short'
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const videos = await Video.find({ type })
      .populate('creator', 'username avatar')
      .populate('channelId', 'channelName channelLogo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Upload a video
// @route   POST /api/videos
// @access  Private
exports.uploadVideo = async (req, res) => {
  try {
    const { title, description, duration, type, category, tags } = req.body;
    
    // Fallback to req.body in case it was sent as string, but prefer req.files from multer
    const videoUrl = req.files?.video ? req.files.video[0].path : req.body.videoUrl;
    const thumbnailUrl = req.files?.thumbnail ? req.files.thumbnail[0].path : req.body.thumbnailUrl;

    if (!videoUrl) {
      return res.status(400).json({ message: 'Video file or URL is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user.channelId) {
      return res.status(400).json({ message: 'Channel is required to upload a video. Please create a channel first.' });
    }

    let finalType = type;
    if (!finalType || finalType === 'auto') {
      finalType = (duration && duration < 60) ? 'short' : 'video';
    }

    const newVideo = new Video({
      title,
      description,
      videoUrl,
      thumbnailUrl,
      type: finalType,
      duration: duration || 0,
      category: category || 'All',
      tags: tags || [],
      creator: user._id,
      channelId: user.channelId
    });

    const savedVideo = await newVideo.save();
    
    // Populate channel info to return
    await savedVideo.populate('channelId', 'channelName channelLogo');
    await savedVideo.populate('creator', 'username avatar');

    res.status(201).json(savedVideo);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get video by ID
// @route   GET /api/videos/:id
// @access  Public
exports.getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('creator', 'username avatar')
      .populate('channelId', 'channelName channelLogo subscribers');
    
    if (!video) return res.status(404).json({ message: 'Video not found' });

    res.json(video);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Increment view count
// @route   POST /api/videos/:id/view
// @access  Public
exports.incrementView = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });

    video.views += 1;
    await video.save();

    res.json({ views: video.views });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Like / Dislike a video
// @route   POST /api/videos/:id/like
// @access  Private
exports.likeVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });

    const userId = req.user.id;
    const isLiked = video.likes.includes(userId);

    if (isLiked) {
      video.likes = video.likes.filter(id => id.toString() !== userId);
    } else {
      video.likes.push(userId);
      video.dislikes = video.dislikes.filter(id => id.toString() !== userId); // Remove from dislikes
    }

    await video.save();
    res.json(video);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Add a comment
// @route   POST /api/videos/:id/comment
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const videoId = req.params.id;

    const comment = new Comment({
      text,
      user: req.user.id,
      video: videoId
    });

    await comment.save();
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get comments for a video
// @route   GET /api/videos/:id/comments
// @access  Public
exports.getVideoComments = async (req, res) => {
  try {
    const comments = await Comment.find({ video: req.params.id })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
