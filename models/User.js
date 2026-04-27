const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: 'https://res.cloudinary.com/demo/image/upload/v1583344600/sample.jpg' },
  bio: { type: String, default: '' },
  subscribers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  subscriptions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  watchHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
  likedVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
  isChannel: { type: Boolean, default: false },
  channelName: { type: String, default: '' },
  channelCategory: { type: String, default: 'General' },
  channelBanner: { type: String, default: 'https://via.placeholder.com/800x200' }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
