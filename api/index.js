const app = require('../src/app');
const connectDB = require('../src/config/database');

// Vercel serverless function handler
module.exports = async (req, res) => {
  try {
    // Connect to database (will reuse connection if already connected)
    await connectDB();
    
    // Handle the request with Express app
    return app(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    
    // If it's a database connection error, return a helpful message
    if (error.message.includes('MONGODB_URI') || error.message.includes('MongoDB')) {
      return res.status(500).json({
        success: false,
        error: 'Database connection failed',
        message: 'Please check your MONGODB_URI environment variable in Vercel settings',
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'production' 
        ? 'An error occurred' 
        : error.message,
    });
  }
};

