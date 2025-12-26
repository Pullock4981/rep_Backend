const User = require('../models/User');
const Company = require('../models/Company');
const AppError = require('../exceptions/AppError');
const NotFoundError = require('../exceptions/NotFoundError');
const { formatEmail, formatName } = require('../utils/formatters');

class AuthService {
  /**
   * Register new user
   */
  async register(userData) {
    const { name, email, password, companyName, phone } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email: formatEmail(email) });
    if (existingUser) {
      throw new AppError('User already exists with this email', 400);
    }

    // Create company first
    let company = await Company.findOne({ email: formatEmail(email) });
    
    if (!company) {
      company = await Company.create({
        name: companyName || `${formatName(name)}'s Company`,
        email: formatEmail(email),
        phone: phone || '',
        isActive: true,
      });
    }

    // Create user
    const user = await User.create({
      name: formatName(name),
      email: formatEmail(email),
      password,
      role: 'super_admin', // First user is super admin
      companyId: company._id,
      phone: phone || '',
      isActive: true,
    });

    // Generate token
    const token = user.generateToken();

    // Remove password from output
    user.password = undefined;

    return {
      user,
      token,
      company,
    };
  }

  /**
   * Login user
   */
  async login(email, password) {
    // Find user and include password for comparison
    const user = await User.findOne({ email: formatEmail(email) }).select('+password');

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError('Your account has been deactivated', 403);
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      throw new AppError('Invalid credentials', 401);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = user.generateToken();

    // Remove password from output
    user.password = undefined;

    // Get company info
    const company = await Company.findById(user.companyId);

    return {
      user,
      token,
      company,
    };
  }

  /**
   * Get current user
   */
  async getMe(userId) {
    const user = await User.findById(userId)
      .populate('companyId', 'name email phone address logo')
      .select('-password');

    if (!user) {
      throw new NotFoundError('User');
    }

    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, updateData) {
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError('User');
    }

    // Format data
    if (updateData.name) {
      updateData.name = formatName(updateData.name);
    }

    if (updateData.email && updateData.email !== user.email) {
      // Check if email already exists
      const existing = await User.findOne({ email: formatEmail(updateData.email) });
      if (existing) {
        throw new AppError('Email already exists', 400);
      }
      updateData.email = formatEmail(updateData.email);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select('-password');

    return updatedUser;
  }

  /**
   * Change password
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');

    if (!user) {
      throw new NotFoundError('User');
    }

    // Verify current password
    const isPasswordMatch = await user.comparePassword(currentPassword);
    if (!isPasswordMatch) {
      throw new AppError('Current password is incorrect', 400);
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return { message: 'Password changed successfully' };
  }
}

module.exports = new AuthService();

