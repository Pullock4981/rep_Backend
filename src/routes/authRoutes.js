const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { checkValidation } = require('../middleware/validation');
const authValidation = require('../validations/authValidation');
const { authLimiter } = require('../middleware/rateLimiter');

// Public routes
router.post(
  '/register',
  authLimiter,
  authValidation.register,
  checkValidation,
  authController.register
);

router.post(
  '/login',
  authLimiter,
  authValidation.login,
  checkValidation,
  authController.login
);

// Protected routes
router.use(protect);

router.get('/me', authController.getMe);
router.put(
  '/profile',
  authValidation.updateProfile,
  checkValidation,
  authController.updateProfile
);
router.put(
  '/change-password',
  authValidation.changePassword,
  checkValidation,
  authController.changePassword
);
router.post('/logout', authController.logout);

module.exports = router;

