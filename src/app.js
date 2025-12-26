const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const config = require('./config/env');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const logger = require('./utils/logger');

// Initialize express app
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    config.CORS_ORIGIN,
].filter(Boolean); // Remove undefined values

app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);
            
            // Allow if origin is in allowed list or if in development
            if (allowedOrigins.includes(origin) || config.NODE_ENV === 'development') {
                callback(null, true);
            } else {
                // In production, allow specific origins
                callback(null, true); // For now, allow all origins - update this for production
            }
        },
        credentials: true,
    })
);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (config.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
}

// Rate limiting - Disable in development for easier testing
if (config.NODE_ENV === 'production') {
  app.use('/api/', apiLimiter);
}

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
    });
});

// Legacy route support for frontend compatibility (must be before /api/v1)
const authController = require('./controllers/authController');
const { protect } = require('./middleware/auth');
const { authLimiter } = require('./middleware/rateLimiter');
const { checkValidation } = require('./middleware/validation');
const authValidation = require('./validations/authValidation');

// Map /api/users/me to /api/v1/auth/me
app.get('/api/users/me', protect, authController.getMe);

// Map /api/auth/* to /api/v1/auth/*
app.post('/api/auth/login', authLimiter, authValidation.login, checkValidation, authController.login);
app.post('/api/auth/register', authLimiter, authValidation.register, checkValidation, authController.register);
app.post('/api/auth/login-password', authLimiter, authValidation.login, checkValidation, authController.login); // Alias
app.get('/api/auth/me', protect, authController.getMe);
app.put('/api/auth/profile', protect, authValidation.updateProfile, checkValidation, authController.updateProfile);
app.put('/api/auth/change-password', protect, authValidation.changePassword, checkValidation, authController.changePassword);
app.post('/api/auth/logout', protect, authController.logout);

// API routes (v1)
app.use('/api/v1', require('./routes'));

// Legacy /api routes (without /v1) for frontend compatibility
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/brands', require('./routes/brandRoutes'));
app.use('/api/units', require('./routes/unitRoutes'));
app.use('/api/warehouses', require('./routes/warehouseRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/suppliers', require('./routes/supplierRoutes'));
app.use('/api/sales', require('./routes/salesRoutes'));
app.use('/api/purchase', require('./routes/purchaseRoutes'));
app.use('/api/invoices', require('./routes/invoiceRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/admin-management', require('./routes/adminRoutes'));
app.use('/api/hr', require('./routes/hrRoutes'));
app.use('/api/hr', require('./routes/hrRoutes'));

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
    });
});

// Error handler middleware (must be last)
app.use(errorHandler);

module.exports = app;

