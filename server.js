const app = require('./src/app');
const connectDB = require('./src/config/database');
const config = require('./src/config/env');
const logger = require('./src/utils/logger');

// Connect to database
connectDB();

// Start server
const PORT = config.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`Server running in ${config.NODE_ENV} mode on port ${PORT}`);
  console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use. Please use a different port or stop the process using this port.`);
    console.error(`\n❌ Port ${PORT} is already in use!`);
    console.error(`   Try one of these solutions:`);
    console.error(`   1. Change PORT in .env file`);
    console.error(`   2. Kill the process: netstat -ano | findstr :${PORT}`);
    console.error(`   3. Use different port: PORT=5001 npm run dev\n`);
    process.exit(1);
  } else {
    throw err;
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  console.error('Unhandled Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

