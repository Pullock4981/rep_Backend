const asyncHandler = require('express-async-handler');
const purchaseService = require('../services/purchaseService');
const { paginate, formatPaginationResponse } = require('../utils/helpers');

class PurchaseController {
  /**
   * Get all purchase orders
   */
  getAll = asyncHandler(async (req, res, next) => {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);

    const { data, total } = await purchaseService.getAll(
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
   * Get purchase order by ID
   */
  getById = asyncHandler(async (req, res, next) => {
    const order = await purchaseService.getById(req.params.id, req.user.companyId);

    res.status(200).json({
      success: true,
      data: order,
    });
  });

  /**
   * Create purchase order
   */
  create = asyncHandler(async (req, res, next) => {
    const order = await purchaseService.create(
      req.body,
      req.user._id,
      req.user.companyId
    );

    res.status(201).json({
      success: true,
      data: order,
      message: 'Purchase order created successfully',
    });
  });

  /**
   * Receive goods
   */
  receiveGoods = asyncHandler(async (req, res, next) => {
    const { receivedItems } = req.body;

    const order = await purchaseService.receiveGoods(
      req.params.id,
      receivedItems,
      req.user._id,
      req.user.companyId
    );

    res.status(200).json({
      success: true,
      data: order,
      message: 'Goods received successfully',
    });
  });

  /**
   * Update order status
   */
  updateStatus = asyncHandler(async (req, res, next) => {
    const { status } = req.body;

    const order = await purchaseService.updateStatus(
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

    const order = await purchaseService.addPayment(
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
   * Get purchase summary
   */
  getSummary = asyncHandler(async (req, res, next) => {
    const startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : new Date(new Date().setDate(1)); // First day of current month
    const endDate = req.query.endDate
      ? new Date(req.query.endDate)
      : new Date(); // Today

    const summary = await purchaseService.getPurchaseSummary(
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
   * Get orders by supplier
   */
  getBySupplier = asyncHandler(async (req, res, next) => {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const supplierId = req.params.supplierId;

    const { data, total } = await purchaseService.getBySupplier(
      supplierId,
      req.user.companyId,
      { skip, limit }
    );

    res.status(200).json({
      success: true,
      ...formatPaginationResponse(data, total, page, limit),
    });
  });
}

module.exports = new PurchaseController();

