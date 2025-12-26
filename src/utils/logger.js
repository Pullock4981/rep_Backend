const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../../logs');

// Create logs directory if it doesn't exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logger = {
  info: (message) => {
    const logMessage = `[INFO] ${new Date().toISOString()} - ${message}\n`;
    console.log(logMessage);
    fs.appendFileSync(path.join(logDir, 'app.log'), logMessage);
  },

  error: (message, error = null) => {
    const logMessage = `[ERROR] ${new Date().toISOString()} - ${message}${error ? `\n${error.stack}` : ''}\n`;
    console.error(logMessage);
    fs.appendFileSync(path.join(logDir, 'error.log'), logMessage);
  },

  warn: (message) => {
    const logMessage = `[WARN] ${new Date().toISOString()} - ${message}\n`;
    console.warn(logMessage);
    fs.appendFileSync(path.join(logDir, 'app.log'), logMessage);
  },

  debug: (message) => {
    if (process.env.NODE_ENV === 'development') {
      const logMessage = `[DEBUG] ${new Date().toISOString()} - ${message}\n`;
      console.debug(logMessage);
      fs.appendFileSync(path.join(logDir, 'app.log'), logMessage);
    }
  },
};

module.exports = logger;

