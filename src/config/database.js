const mongoose = require('mongoose');
const config = require('./env');

const connectDB = async () => {
  // If already connected, return
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    // Check if MONGODB_URI is provided
    if (!config.MONGODB_URI || config.MONGODB_URI.trim() === '') {
      const error = new Error('MONGODB_URI is not defined in environment variables');
      console.error('❌ MONGODB_URI is not defined');
      throw error;
    }

    // Validate URI format
    const uri = config.MONGODB_URI.trim();
    if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
      const error = new Error('Invalid MONGODB_URI format');
      console.error('❌ Invalid MONGODB_URI format');
      throw error;
    }

    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // Increased timeout for serverless
      socketTimeoutMS: 45000,
      maxPoolSize: 10, // Maintain up to 10 socket connections for serverless
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn.connection;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Don't exit in serverless - throw error instead
    throw error;
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error(`MongoDB error: ${err}`);
});

module.exports = connectDB;

