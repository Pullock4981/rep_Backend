const asyncHandler = require('express-async-handler');
const BaseController = require('./baseController');
const supplierService = require('../services/supplierService');
const { paginate, formatPaginationResponse } = require('../utils/helpers');

class SupplierController extends BaseController {
  constructor() {
    super(supplierService);
  }

  /**
   * Get all suppliers
   */
  getAll = asyncHandler(async (req, res, next) => {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);

    const { data, total } = await supplierService.getAll(
      req.query,
      req.user.companyId,
      {
        skip,
        limit,
      }
    );

    res.status(200).json({
      success: true,
      ...formatPaginationResponse(data, total, page, limit),
    });
  });

  /**
   * Get supplier by ID
   */
  getById = asyncHandler(async (req, res, next) => {
    const supplier = await supplierService.getById(req.params.id, req.user.companyId);

    res.status(200).json({
      success: true,
      data: supplier,
    });
  });

  /**
   * Create supplier
   */
  create = asyncHandler(async (req, res, next) => {
    const supplier = await supplierService.create(
      req.body,
      req.user._id,
      req.user.companyId
    );

    res.status(201).json({
      success: true,
      data: supplier,
    });
  });

  /**
   * Update supplier
   */
  update = asyncHandler(async (req, res, next) => {
    const supplier = await supplierService.update(
      req.params.id,
      req.body,
      req.user._id,
      req.user.companyId
    );

    res.status(200).json({
      success: true,
      data: supplier,
    });
  });

  /**
   * Delete supplier
   */
  delete = asyncHandler(async (req, res, next) => {
    await supplierService.deleteById(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Supplier deleted successfully',
    });
  });

  /**
   * Search suppliers
   */
  search = asyncHandler(async (req, res, next) => {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const searchTerm = req.query.q || req.query.search;

    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        error: 'Search term is required',
      });
    }

    const { data, total } = await supplierService.search(
      searchTerm,
      req.user.companyId,
      { skip, limit }
    );

    res.status(200).json({
      success: true,
      ...formatPaginationResponse(data, total, page, limit),
    });
  });

  /**
   * Get active suppliers
   */
  getActive = asyncHandler(async (req, res, next) => {
    const { data, total } = await supplierService.getActiveSuppliers(req.user.companyId);

    res.status(200).json({
      success: true,
      data,
      total,
    });
  });
}

module.exports = new SupplierController();

