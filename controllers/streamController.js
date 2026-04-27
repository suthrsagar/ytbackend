const Stream = require('../models/Stream');
const { cloudinary, upload } = require('../utils/cloudinary');

exports.goLive = async (req, res) => {
  try {
    const { title, category, chatMode } = req.body;
    let thumbnailUrl = 'https://res.cloudinary.com/demo/image/upload/v1583344600/sample.jpg';

    if (req.file) {
      thumbnailUrl = req.file.path;
    }

    const stream = await Stream.create({
      user: req.user._id,
      title,
      category,
      thumbnail: thumbnailUrl,
      chatMode: chatMode || 'all',
      isLive: true
    });

    res.status(201).json(stream);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.endStream = async (req, res) => {
  try {
    const stream = await Stream.findById(req.params.id);

    if (!stream) return res.status(404).json({ message: 'Stream not found' });

    if (stream.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized to end this stream' });
    }

    stream.isLive = false;
    stream.recordedUrl = req.body.recordedUrl || ''; // If RTMP server provides a recording URL
    await stream.save();

    res.json({ message: 'Stream ended', stream });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getActiveStreams = async (req, res) => {
  try {
    const keyword = req.query.keyword ? {
      title: { $regex: req.query.keyword, $options: 'i' }
    } : {};

    const streams = await Stream.find({ ...keyword, isLive: true })
      .populate('user', 'username avatar')
      .sort({ viewers: -1 });

    res.json(streams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStreamDetails = async (req, res) => {
  try {
    const stream = await Stream.findById(req.params.id).populate('user', 'username avatar bio followers');
    
    if (stream) {
      res.json(stream);
    } else {
      res.status(404).json({ message: 'Stream not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
