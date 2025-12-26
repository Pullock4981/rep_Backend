const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes require super admin access
router.use(protect);
router.use(authorize('super_admin'));

// Admin management routes
router.route('/').get(adminController.getAllAdmins);

router
  .route('/:id')
  .get(adminController.getAdminById)
  .put(adminController.updateAdminRole);

router.put('/:id/toggle-status', adminController.toggleAdminStatus);
router.put('/:id/promote', adminController.promoteToSuperAdmin);
router.put('/:id/demote', adminController.demoteFromSuperAdmin);

module.exports = router;

