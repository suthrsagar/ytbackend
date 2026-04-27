const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
  channelName: { type: String, required: true },
  channelLogo: { type: String },
  description: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subscribers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  category: { type: String, default: 'General' },
  bannerUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Channel', channelSchema);
