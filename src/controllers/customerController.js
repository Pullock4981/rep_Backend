const asyncHandler = require('express-async-handler');
const BaseController = require('./baseController');
const customerService = require('../services/customerService');
const { paginate, formatPaginationResponse } = require('../utils/helpers');

class CustomerController extends BaseController {
  constructor() {
    super(customerService);
  }

  /**
   * Get all customers
   */
  getAll = asyncHandler(async (req, res, next) => {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);

    const { data, total } = await customerService.getAll(
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
   * Get customer by ID
   */
  getById = asyncHandler(async (req, res, next) => {
    const customer = await customerService.getById(req.params.id, req.user.companyId);

    res.status(200).json({
      success: true,
      data: customer,
    });
  });

  /**
   * Create customer
   */
  create = asyncHandler(async (req, res, next) => {
    const customer = await customerService.create(
      req.body,
      req.user._id,
      req.user.companyId
    );

    res.status(201).json({
      success: true,
      data: customer,
    });
  });

  /**
   * Update customer
   */
  update = asyncHandler(async (req, res, next) => {
    const customer = await customerService.update(
      req.params.id,
      req.body,
      req.user._id,
      req.user.companyId
    );

    res.status(200).json({
      success: true,
      data: customer,
    });
  });

  /**
   * Delete customer
   */
  delete = asyncHandler(async (req, res, next) => {
    await customerService.deleteById(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully',
    });
  });

  /**
   * Search customers
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

    const { data, total } = await customerService.search(
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
   * Get active customers
   */
  getActive = asyncHandler(async (req, res, next) => {
    const { data, total } = await customerService.getActiveCustomers(req.user.companyId);

    res.status(200).json({
      success: true,
      data,
      total,
    });
  });
}

module.exports = new CustomerController();

