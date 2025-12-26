const express = require('express');
const router = express.Router();
const hrController = require('../controllers/hrController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Employee routes
router
  .route('/employees')
  .get(hrController.getAllEmployees)
  .post(hrController.createEmployee);

router
  .route('/employees/:id')
  .get(hrController.getEmployeeById)
  .put(hrController.updateEmployee)
  .delete(hrController.deleteEmployee);

// Department routes
router
  .route('/departments')
  .get(hrController.getAllDepartments)
  .post(hrController.createDepartment);

router
  .route('/departments/:id')
  .put(hrController.updateDepartment)
  .delete(hrController.deleteDepartment);

// Attendance routes
router
  .route('/attendance')
  .get(hrController.getAllAttendance)
  .post(hrController.markAttendance);

router
  .route('/attendance/:id')
  .put(hrController.updateAttendance);

module.exports = router;

