const asyncHandler = require('express-async-handler');
const authService = require('../services/authService');

class AuthController {
  /**
   * Register new user
   */
  register = asyncHandler(async (req, res, next) => {
    const { user, token, company } = await authService.register(req.body);

    res.status(201).json({
      success: true,
      data: {
        user,
        company,
        token,
      },
      message: 'Registration successful',
    });
  });

  /**
   * Login user
   */
  login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password',
      });
    }

    const { user, token, company } = await authService.login(email, password);

    res.status(200).json({
      success: true,
      data: {
        user,
        company,
        token,
      },
      message: 'Login successful',
    });
  });

  /**
   * Get current user
   */
  getMe = asyncHandler(async (req, res, next) => {
    const user = await authService.getMe(req.user._id);

    res.status(200).json({
      success: true,
      data: user,
    });
  });

  /**
   * Update profile
   */
  updateProfile = asyncHandler(async (req, res, next) => {
    const user = await authService.updateProfile(req.user._id, req.body);

    res.status(200).json({
      success: true,
      data: user,
      message: 'Profile updated successfully',
    });
  });

  /**
   * Change password
   */
  changePassword = asyncHandler(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Please provide current password and new password',
      });
    }

    await authService.changePassword(req.user._id, currentPassword, newPassword);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  });

  /**
   * Logout (client-side token removal)
   */
  logout = asyncHandler(async (req, res, next) => {
    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  });
}

module.exports = new AuthController();

