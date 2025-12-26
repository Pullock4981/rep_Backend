const asyncHandler = require('express-async-handler');
const paymentService = require('../services/paymentService');
const { paginate, formatPaginationResponse } = require('../utils/helpers');

class PaymentController {
  /**
   * Get all payments
   */
  getAll = asyncHandler(async (req, res, next) => {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);

    const { data, total } = await paymentService.getAll(
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
   * Create payment for invoice
   */
  createForInvoice = asyncHandler(async (req, res, next) => {
    const { invoiceId } = req.body;

    const payment = await paymentService.createForInvoice(
      invoiceId,
      req.body,
      req.user._id,
      req.user.companyId
    );

    res.status(201).json({
      success: true,
      data: payment,
      message: 'Payment recorded successfully',
    });
  });

  /**
   * Create payment for purchase order
   */
  createForPurchaseOrder = asyncHandler(async (req, res, next) => {
    const { purchaseOrderId } = req.body;

    const payment = await paymentService.createForPurchaseOrder(
      purchaseOrderId,
      req.body,
      req.user._id,
      req.user.companyId
    );

    res.status(201).json({
      success: true,
      data: payment,
      message: 'Payment recorded successfully',
    });
  });

  /**
   * Get payment summary
   */
  getSummary = asyncHandler(async (req, res, next) => {
    const startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : new Date(new Date().setDate(1));
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

    const summary = await paymentService.getPaymentSummary(
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
   * Get payments by invoice
   */
  getByInvoice = asyncHandler(async (req, res, next) => {
    const invoiceId = req.params.invoiceId;

    const payments = await paymentService.getByInvoice(invoiceId, req.user.companyId);

    res.status(200).json({
      success: true,
      data: payments,
      total: payments.length,
    });
  });

  /**
   * Get payments by customer
   */
  getByCustomer = asyncHandler(async (req, res, next) => {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const customerId = req.params.customerId;

    const { data, total } = await paymentService.getByCustomer(
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

module.exports = new PaymentController();

