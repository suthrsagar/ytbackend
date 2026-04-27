const mongoose = require('mongoose');

const streamSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  thumbnail: { type: String, default: 'https://res.cloudinary.com/demo/image/upload/v1583344600/sample.jpg' },
  isLive: { type: Boolean, default: true },
  viewers: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  chatMode: { type: String, default: 'all' },
  recordedUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Stream', streamSchema);
