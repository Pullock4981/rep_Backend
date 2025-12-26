const asyncHandler = require('express-async-handler');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Attendance = require('../models/Attendance');
const AppError = require('../exceptions/AppError');
const NotFoundError = require('../exceptions/NotFoundError');

class HRController {
  // ============ EMPLOYEES ============
  
  getAllEmployees = asyncHandler(async (req, res, next) => {
    const { page = 1, limit = 50, search, departmentId, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = { companyId: req.user.companyId };

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { empId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (departmentId) {
      query.departmentId = departmentId;
    }

    if (status) {
      query.status = status;
    }

    const [employees, total] = await Promise.all([
      Employee.find(query)
        .populate('departmentId', 'name code')
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Employee.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: employees,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  });

  getEmployeeById = asyncHandler(async (req, res, next) => {
    const employee = await Employee.findOne({
      _id: req.params.id,
      companyId: req.user.companyId,
    })
      .populate('departmentId', 'name code')
      .populate('userId', 'name email');

    if (!employee) {
      throw new NotFoundError('Employee not found');
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  });

  createEmployee = asyncHandler(async (req, res, next) => {
    const employeeData = {
      ...req.body,
      companyId: req.user.companyId,
      createdBy: req.user._id,
    };

    const employee = await Employee.create(employeeData);

    res.status(201).json({
      success: true,
      data: employee,
    });
  });

  updateEmployee = asyncHandler(async (req, res, next) => {
    const employee = await Employee.findOneAndUpdate(
      { _id: req.params.id, companyId: req.user.companyId },
      req.body,
      { new: true, runValidators: true }
    ).populate('departmentId', 'name code');

    if (!employee) {
      throw new NotFoundError('Employee not found');
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  });

  deleteEmployee = asyncHandler(async (req, res, next) => {
    const employee = await Employee.findOneAndDelete({
      _id: req.params.id,
      companyId: req.user.companyId,
    });

    if (!employee) {
      throw new NotFoundError('Employee not found');
    }

    res.status(200).json({
      success: true,
      message: 'Employee deleted successfully',
    });
  });

  // ============ DEPARTMENTS ============

  getAllDepartments = asyncHandler(async (req, res, next) => {
    const { page = 1, limit = 50, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = { companyId: req.user.companyId };

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const [departments, total] = await Promise.all([
      Department.find(query)
        .populate('manager', 'name email')
        .populate('parentDepartment', 'name')
        .sort({ name: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Department.countDocuments(query),
    ]);

    // Get employee count for each department
    const departmentsWithCount = await Promise.all(
      departments.map(async (dept) => {
        const count = await Employee.countDocuments({
          departmentId: dept._id,
          companyId: req.user.companyId,
        });
        return {
          ...dept.toObject(),
          employeeCount: count,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: departmentsWithCount,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  });

  createDepartment = asyncHandler(async (req, res, next) => {
    const departmentData = {
      ...req.body,
      companyId: req.user.companyId,
      createdBy: req.user._id,
    };

    const department = await Department.create(departmentData);

    res.status(201).json({
      success: true,
      data: department,
    });
  });

  updateDepartment = asyncHandler(async (req, res, next) => {
    const department = await Department.findOneAndUpdate(
      { _id: req.params.id, companyId: req.user.companyId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!department) {
      throw new NotFoundError('Department not found');
    }

    res.status(200).json({
      success: true,
      data: department,
    });
  });

  deleteDepartment = asyncHandler(async (req, res, next) => {
    const department = await Department.findOneAndDelete({
      _id: req.params.id,
      companyId: req.user.companyId,
    });

    if (!department) {
      throw new NotFoundError('Department not found');
    }

    res.status(200).json({
      success: true,
      message: 'Department deleted successfully',
    });
  });

  // ============ ATTENDANCE ============

  getAllAttendance = asyncHandler(async (req, res, next) => {
    const { page = 1, limit = 50, search, employeeId, startDate, endDate, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = { companyId: req.user.companyId };

    if (employeeId) {
      query.employeeId = employeeId;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (status) {
      query.status = status;
    }

    const [attendance, total] = await Promise.all([
      Attendance.find(query)
        .populate('employeeId', 'empId firstName lastName position')
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Attendance.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: attendance,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  });

  markAttendance = asyncHandler(async (req, res, next) => {
    const { employeeId, date, checkIn, checkOut, status, notes } = req.body;

    const attendanceData = {
      employeeId,
      date: date || new Date(),
      checkIn,
      checkOut,
      status,
      notes,
      companyId: req.user.companyId,
      createdBy: req.user._id,
    };

    // Check if attendance already exists for this date
    const existing = await Attendance.findOne({
      employeeId,
      date: attendanceData.date,
      companyId: req.user.companyId,
    });

    let attendance;
    if (existing) {
      attendance = await Attendance.findByIdAndUpdate(
        existing._id,
        attendanceData,
        { new: true, runValidators: true }
      ).populate('employeeId', 'empId firstName lastName');
    } else {
      attendance = await Attendance.create(attendanceData);
      await attendance.populate('employeeId', 'empId firstName lastName');
    }

    res.status(201).json({
      success: true,
      data: attendance,
    });
  });

  updateAttendance = asyncHandler(async (req, res, next) => {
    const attendance = await Attendance.findOneAndUpdate(
      { _id: req.params.id, companyId: req.user.companyId },
      req.body,
      { new: true, runValidators: true }
    ).populate('employeeId', 'empId firstName lastName');

    if (!attendance) {
      throw new NotFoundError('Attendance record not found');
    }

    res.status(200).json({
      success: true,
      data: attendance,
    });
  });
}

module.exports = new HRController();

