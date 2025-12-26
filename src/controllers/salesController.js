const asyncHandler = require('express-async-handler');
const salesService = require('../services/salesService');
const { paginate, formatPaginationResponse } = require('../utils/helpers');

class SalesController {
  /**
   * Get all sales orders
   */
  getAll = asyncHandler(async (req, res, next) => {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);

    const { data, total } = await salesService.getAll(
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
   * Get sales order by ID
   */
  getById = asyncHandler(async (req, res, next) => {
    const order = await salesService.getById(req.params.id, req.user.companyId);

    res.status(200).json({
      success: true,
      data: order,
    });
  });

  /**
   * Create sales order
   */
  create = asyncHandler(async (req, res, next) => {
    const order = await salesService.create(
      req.body,
      req.user._id,
      req.user.companyId
    );

    res.status(201).json({
      success: true,
      data: order,
      message: 'Sales order created successfully',
    });
  });

  /**
   * Update order status
   */
  updateStatus = asyncHandler(async (req, res, next) => {
    const { status } = req.body;

    const order = await salesService.updateStatus(
      req.params.id,
      status,
      req.user._id,
      req.user.companyId
    );

    res.status(200).json({
      success: true,
      data: order,
      message: 'Order status updated successfully',
    });
  });

  /**
   * Add payment
   */
  addPayment = asyncHandler(async (req, res, next) => {
    const { paymentAmount } = req.body;

    const order = await salesService.addPayment(
      req.params.id,
      paymentAmount,
      req.user._id,
      req.user.companyId
    );

    res.status(200).json({
      success: true,
      data: order,
      message: 'Payment added successfully',
    });
  });

  /**
   * Get sales summary
   */
  getSummary = asyncHandler(async (req, res, next) => {
    const startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : new Date(new Date().setDate(1)); // First day of current month
    const endDate = req.query.endDate
      ? new Date(req.query.endDate)
      : new Date(); // Today

    const summary = await salesService.getSalesSummary(
      req.user.companyId,
      startDate,
      endDate
    );

    res.status(200).json({
      success: true,
      data: summary,
    });
  });

  /**
   * Get orders by customer
   */
  getByCustomer = asyncHandler(async (req, res, next) => {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const customerId = req.params.customerId;

    const { data, total } = await salesService.getByCustomer(
      customerId,
      req.user.companyId,
      { skip, limit }
    );

    res.status(200).json({
      success: true,
      ...formatPaginationResponse(data, total, page, limit),
    });
  });
}

module.exports = new SalesController();

