const asyncHandler = require('express-async-handler');
const BaseController = require('./baseController');
const warehouseService = require('../services/warehouseService');
const { paginate, formatPaginationResponse } = require('../utils/helpers');

class WarehouseController extends BaseController {
  constructor() {
    super(warehouseService);
  }

  /**
   * Get all warehouses
   */
  getAll = asyncHandler(async (req, res, next) => {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);

    const { data, total } = await warehouseService.getAll(
      { companyId: req.user.companyId },
      { skip, limit }
    );

    res.status(200).json({
      success: true,
      ...formatPaginationResponse(data, total, page, limit),
    });
  });

  /**
   * Get warehouse by ID
   */
  getById = asyncHandler(async (req, res, next) => {
    const warehouse = await warehouseService.getById(req.params.id, req.user.companyId);
    
    res.status(200).json({
      success: true,
      data: warehouse,
    });
  });

  /**
   * Get active warehouses only
   */
  getActive = asyncHandler(async (req, res, next) => {
    const { data, total } = await warehouseService.getActiveWarehouses(
      req.user.companyId
    );

    res.status(200).json({
      success: true,
      data,
      total,
    });
  });

  /**
   * Get main warehouse
   */
  getMain = asyncHandler(async (req, res, next) => {
    const warehouse = await warehouseService.getMainWarehouse(req.user.companyId);

    res.status(200).json({
      success: true,
      data: warehouse,
    });
  });

  /**
   * Create warehouse
   */
  create = asyncHandler(async (req, res, next) => {
    const warehouse = await warehouseService.create(
      req.body,
      req.user._id,
      req.user.companyId
    );

    res.status(201).json({
      success: true,
      data: warehouse,
    });
  });

  /**
   * Update warehouse
   */
  update = asyncHandler(async (req, res, next) => {
    const warehouse = await warehouseService.update(
      req.params.id,
      req.body,
      req.user._id,
      req.user.companyId
    );

    res.status(200).json({
      success: true,
      data: warehouse,
    });
  });

  /**
   * Delete warehouse
   */
  delete = asyncHandler(async (req, res, next) => {
    await warehouseService.deleteById(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Warehouse deleted successfully',
    });
  });
}

module.exports = new WarehouseController();

