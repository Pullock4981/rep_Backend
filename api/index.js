const mongoose = require('mongoose');
const app = require('../src/app');
const config = require('../src/config/env');

// Cache connection state
let isConnecting = false;
let connectionPromise = null;

async function ensureDatabaseConnection() {
  // If already connected, return
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If already connecting, return the existing promise
  if (isConnecting && connectionPromise) {
    return connectionPromise;
  }

  isConnecting = true;
  connectionPromise = (async () => {
    try {
      // Check if MONGODB_URI is provided
      if (!config.MONGODB_URI || config.MONGODB_URI.trim() === '') {
        console.error('❌ MONGODB_URI is not defined');
        isConnecting = false;
        return null;
      }

      // Validate URI format
      const uri = config.MONGODB_URI.trim();
      if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
        console.error('❌ Invalid MONGODB_URI format');
        isConnecting = false;
        return null;
      }

      // Connect to MongoDB
      const conn = await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
      });

      isConnecting = false;
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return conn.connection;
    } catch (error) {
      console.error(`❌ MongoDB Connection Error: ${error.message}`);
      isConnecting = false;
      return null;
    }
  })();

  return connectionPromise;
}

// Vercel serverless function handler
module.exports = async (req, res) => {
  // Ensure database connection (non-blocking, will use cached connection)
  ensureDatabaseConnection().catch((err) => {
    console.error('DB connection error:', err);
  });

  // Handle request with Express app
  return app(req, res);
};
