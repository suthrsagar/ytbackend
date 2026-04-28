const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true },
  profileImage: { type: String, default: 'https://res.cloudinary.com/demo/image/upload/v1583344600/sample.jpg' },
  role: { type: String, enum: ['passenger', 'rider'], required: true },
  driverStatus: { type: String, enum: ['online', 'offline', 'in-ride'], default: 'offline' },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
