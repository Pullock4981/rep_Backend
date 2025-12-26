const mongoose = require('mongoose');
const config = require('./env');

const connectDB = async () => {
  try {
    // Check if MONGODB_URI is provided
    if (!config.MONGODB_URI || config.MONGODB_URI.trim() === '') {
      console.error('❌ MONGODB_URI is not defined in .env file');
      console.error('   Please create a .env file and set MONGODB_URI');
      console.error('\n   For Local MongoDB:');
      console.error('   MONGODB_URI=mongodb://localhost:27017/erp_db');
      console.error('\n   For MongoDB Atlas:');
      console.error('   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/erp_db');
      process.exit(1);
    }

    // Validate URI format
    const uri = config.MONGODB_URI.trim();
    if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
      console.error('❌ Invalid MONGODB_URI format');
      console.error('   URI must start with mongodb:// or mongodb+srv://');
      console.error(`   Current value: ${uri.substring(0, 20)}...`);
      process.exit(1);
    }

    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('\n   Please check:');
    console.error('   1. MongoDB is running (for local) or cluster is accessible (for Atlas)');
    console.error('   2. MONGODB_URI in .env file is correct');
    console.error('   3. Network/firewall settings allow connection');
    console.error('\n   Example formats:');
    console.error('   Local: mongodb://localhost:27017/erp_db');
    console.error('   Atlas: mongodb+srv://user:pass@cluster.mongodb.net/erp_db');
    process.exit(1);
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

