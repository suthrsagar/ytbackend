require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const dropIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Check indexes
    const indexes = await User.collection.indexes();
    console.log('Indexes:', indexes);
    
    // Drop username index if it exists
    const hasUsernameIndex = indexes.some(idx => idx.name === 'username_1');
    if (hasUsernameIndex) {
      await User.collection.dropIndex('username_1');
      console.log('Dropped username_1 index');
    }

    const hasChannelIdIndex = indexes.some(idx => idx.name === 'channelId_1');
    if (hasChannelIdIndex) {
      await User.collection.dropIndex('channelId_1');
      console.log('Dropped channelId_1 index');
    }

    console.log('Done cleaning up indexes');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
};

dropIndex();
