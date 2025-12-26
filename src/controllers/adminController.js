const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const AppError = require('../exceptions/AppError');
const NotFoundError = require('../exceptions/NotFoundError');

class AdminController {
  /**
   * Get all admins (super_admin, admin, manager)
   */
  getAllAdmins = asyncHandler(async (req, res, next) => {
    const { page = 1, limit = 50, search, role, isActive } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {
      role: { $in: ['super_admin', 'admin', 'manager'] },
    };

    // Filter by role
    if (role && ['super_admin', 'admin', 'manager'].includes(role)) {
      query.role = role;
    }

    // Filter by active status
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [admins, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .populate('companyId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: admins,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  });

  /**
   * Get admin by ID
   */
  getAdminById = asyncHandler(async (req, res, next) => {
    const admin = await User.findOne({
      _id: req.params.id,
      role: { $in: ['super_admin', 'admin', 'manager'] },
    })
      .select('-password')
      .populate('companyId', 'name email phone address');

    if (!admin) {
      throw new NotFoundError('Admin not found');
    }

    res.status(200).json({
      success: true,
      data: admin,
    });
  });

  /**
   * Ban/Unban admin
   */
  toggleAdminStatus = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { isActive } = req.body;

    // Prevent self-ban
    if (id === req.user._id.toString()) {
      throw new AppError('You cannot ban/unban yourself', 400);
    }

    const admin = await User.findOne({
      _id: id,
      role: { $in: ['super_admin', 'admin', 'manager'] },
    });

    if (!admin) {
      throw new NotFoundError('Admin not found');
    }

    // Prevent banning super admin (only if not current user)
    if (admin.role === 'super_admin' && isActive === false) {
      throw new AppError('Cannot ban super admin', 403);
    }

    admin.isActive = isActive !== undefined ? isActive : !admin.isActive;
    await admin.save();

    res.status(200).json({
      success: true,
      data: admin,
      message: `Admin ${admin.isActive ? 'activated' : 'banned'} successfully`,
    });
  });

  /**
   * Promote admin to super admin
   */
  promoteToSuperAdmin = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const admin = await User.findOne({
      _id: id,
      role: { $in: ['admin', 'manager'] },
    });

    if (!admin) {
      throw new NotFoundError('Admin not found or already super admin');
    }

    admin.role = 'super_admin';
    await admin.save();

    res.status(200).json({
      success: true,
      data: admin,
      message: 'Admin promoted to super admin successfully',
    });
  });

  /**
   * Demote super admin to admin
   */
  demoteFromSuperAdmin = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    // Prevent self-demotion
    if (id === req.user._id.toString()) {
      throw new AppError('You cannot demote yourself', 400);
    }

    const superAdmin = await User.findOne({
      _id: id,
      role: 'super_admin',
    });

    if (!superAdmin) {
      throw new NotFoundError('Super admin not found');
    }

    superAdmin.role = 'admin';
    await superAdmin.save();

    res.status(200).json({
      success: true,
      data: superAdmin,
      message: 'Super admin demoted to admin successfully',
    });
  });

  /**
   * Update admin role
   */
  updateAdminRole = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'manager'].includes(role)) {
      throw new AppError('Invalid role. Allowed roles: admin, manager', 400);
    }

    // Prevent self-role change
    if (id === req.user._id.toString()) {
      throw new AppError('You cannot change your own role', 400);
    }

    const admin = await User.findOne({
      _id: id,
      role: { $in: ['super_admin', 'admin', 'manager'] },
    });

    if (!admin) {
      throw new NotFoundError('Admin not found');
    }

    // Prevent changing super admin role
    if (admin.role === 'super_admin') {
      throw new AppError('Cannot change super admin role. Use demote endpoint instead.', 403);
    }

    admin.role = role;
    await admin.save();

    res.status(200).json({
      success: true,
      data: admin,
      message: `Admin role updated to ${role} successfully`,
    });
  });
}

module.exports = new AdminController();

