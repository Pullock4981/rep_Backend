// Vercel serverless function handler
// Wrap everything in try-catch to prevent crashes on module load

let app;
let mongoose;
let config;

try {
  mongoose = require('mongoose');
  app = require('../src/app');
  config = require('../src/config/env');
} catch (error) {
  console.error('Failed to load modules:', error);
  module.exports = async (req, res) => {
    res.status(500).json({
      success: false,
      error: 'Server configuration error',
      message: error.message,
    });
  };
  return;
}

// Global connection state
let dbConnected = false;
let connectionAttempted = false;

// Connect to database function
async function connectDB() {
  // If already connected, return
  if (dbConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // Prevent multiple simultaneous connection attempts
  if (connectionAttempted && !dbConnected) {
    return null;
  }

  connectionAttempted = true;

  try {
    // Check MONGODB_URI
    if (!config.MONGODB_URI || !config.MONGODB_URI.trim()) {
      console.error('❌ MONGODB_URI is not defined in environment variables');
      return null;
    }

    const uri = config.MONGODB_URI.trim();
    
    if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
      console.error('❌ Invalid MONGODB_URI format');
      return null;
    }

    // Connect
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });

    dbConnected = true;
    console.log('✅ MongoDB Connected');
    return mongoose.connection;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    dbConnected = false;
    connectionAttempted = false;
    return null;
  }
}

// Vercel serverless function handler
module.exports = async (req, res) => {
  try {
    // Try to connect to database (non-blocking, won't fail the request)
    connectDB().catch(err => {
      console.error('DB connection attempt failed:', err.message);
    });

    // Handle request with Express app
    // Use a promise to properly handle async Express middleware
    return new Promise((resolve, reject) => {
      const handler = (err) => {
        if (err) {
          console.error('Express handler error:', err);
          if (!res.headersSent) {
            res.status(500).json({
              success: false,
              error: 'Request handling error',
              message: err.message,
            });
          }
          reject(err);
        } else {
          resolve();
        }
      };

      // Call Express app
      app(req, res, handler);
    });
  } catch (error) {
    console.error('Handler error:', error);
    console.error('Error stack:', error.stack);
    
    // Send error response if headers not sent
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message || 'An error occurred',
        hint: 'Check Vercel logs. Ensure MONGODB_URI and JWT_SECRET are set in environment variables.',
      });
    }
  }
};
