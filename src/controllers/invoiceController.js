const asyncHandler = require('express-async-handler');
const invoiceService = require('../services/invoiceService');
const { paginate, formatPaginationResponse } = require('../utils/helpers');

class InvoiceController {
  /**
   * Get all invoices
   */
  getAll = asyncHandler(async (req, res, next) => {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);

    const { data, total } = await invoiceService.getAll(
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
   * Get invoice by ID
   */
  getById = asyncHandler(async (req, res, next) => {
    const invoice = await invoiceService.getById(req.params.id, req.user.companyId);

    res.status(200).json({
      success: true,
      data: invoice,
    });
  });

  /**
   * Create invoice from sales order
   */
  createFromSalesOrder = asyncHandler(async (req, res, next) => {
    const { salesOrderId } = req.body;

    const invoice = await invoiceService.createFromSalesOrder(
      salesOrderId,
      req.body,
      req.user._id,
      req.user.companyId
    );

    res.status(201).json({
      success: true,
      data: invoice,
      message: 'Invoice created successfully',
    });
  });

  /**
   * Create standalone invoice
   */
  createStandalone = asyncHandler(async (req, res, next) => {
    const invoice = await invoiceService.createStandalone(
      req.body,
      req.user._id,
      req.user.companyId
    );

    res.status(201).json({
      success: true,
      data: invoice,
      message: 'Invoice created successfully',
    });
  });

  /**
   * Get overdue invoices
   */
  getOverdue = asyncHandler(async (req, res, next) => {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);

    const { data, total } = await invoiceService.getOverdueInvoices(
      req.user.companyId,
      { skip, limit }
    );

    res.status(200).json({
      success: true,
      ...formatPaginationResponse(data, total, page, limit),
    });
  });

  /**
   * Get invoice summary
   */
  getSummary = asyncHandler(async (req, res, next) => {
    const startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : new Date(new Date().setDate(1));
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

    const summary = await invoiceService.getInvoiceSummary(
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
   * Get invoices by customer
   */
  getByCustomer = asyncHandler(async (req, res, next) => {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const customerId = req.params.customerId;

    const { data, total } = await invoiceService.getByCustomer(
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

module.exports = new InvoiceController();

