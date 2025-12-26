const fs = require('fs');
const path = require('path');

// Check if we're in a serverless environment (Vercel, AWS Lambda, etc.)
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NODE_ENV === 'production';

const logDir = isServerless ? null : path.join(__dirname, '../../logs');

// Create logs directory if it doesn't exist (only in non-serverless)
if (!isServerless && logDir && !fs.existsSync(logDir)) {
  try {
    fs.mkdirSync(logDir, { recursive: true });
  } catch (err) {
    // Ignore errors creating log directory
    console.warn('Could not create log directory:', err.message);
  }
}

const logger = {
  info: (message) => {
    const logMessage = `[INFO] ${new Date().toISOString()} - ${message}`;
    console.log(logMessage);
    // Only write to file in non-serverless environments
    if (!isServerless && logDir) {
      try {
        fs.appendFileSync(path.join(logDir, 'app.log'), logMessage + '\n');
      } catch (err) {
        // Ignore file write errors in serverless
      }
    }
  },

  error: (message, error = null) => {
    const logMessage = `[ERROR] ${new Date().toISOString()} - ${message}${error ? `\n${error.stack}` : ''}`;
    console.error(logMessage);
    // Only write to file in non-serverless environments
    if (!isServerless && logDir) {
      try {
        fs.appendFileSync(path.join(logDir, 'error.log'), logMessage + '\n');
      } catch (err) {
        // Ignore file write errors in serverless
      }
    }
  },

  warn: (message) => {
    const logMessage = `[WARN] ${new Date().toISOString()} - ${message}`;
    console.warn(logMessage);
    // Only write to file in non-serverless environments
    if (!isServerless && logDir) {
      try {
        fs.appendFileSync(path.join(logDir, 'app.log'), logMessage + '\n');
      } catch (err) {
        // Ignore file write errors in serverless
      }
    }
  },

  debug: (message) => {
    if (process.env.NODE_ENV === 'development') {
      const logMessage = `[DEBUG] ${new Date().toISOString()} - ${message}`;
      console.debug(logMessage);
      // Only write to file in non-serverless environments
      if (!isServerless && logDir) {
        try {
          fs.appendFileSync(path.join(logDir, 'app.log'), logMessage + '\n');
        } catch (err) {
          // Ignore file write errors in serverless
        }
      }
    }
  },
};

module.exports = logger;

