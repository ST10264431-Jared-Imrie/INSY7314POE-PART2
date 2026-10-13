const mongoose = require('mongoose');
const config = require('./keys');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri);
    console.log(`[HustleHub+ DB] MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('[HustleHub+ DB] MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
