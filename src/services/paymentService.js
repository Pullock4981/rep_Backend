const BaseService = require('./baseService');
const paymentRepository = require('../repositories/paymentRepository');
const invoiceRepository = require('../repositories/invoiceRepository');
const purchaseRepository = require('../repositories/purchaseRepository');
const { generateTransactionId } = require('../utils/generators');
const NotFoundError = require('../exceptions/NotFoundError');
const AppError = require('../exceptions/AppError');

class PaymentService extends BaseService {
  constructor() {
    super(paymentRepository);
  }

  /**
   * Create payment for invoice
   */
  async createForInvoice(invoiceId, paymentData, userId, companyId) {
    // Get invoice
    const invoice = await invoiceRepository.findById(invoiceId);

    if (!invoice) {
      throw new NotFoundError('Invoice');
    }

    if (invoice.companyId.toString() !== companyId.toString()) {
      throw new AppError('Not authorized', 403);
    }

    if (paymentData.amount > invoice.balanceAmount) {
      throw new AppError(
        `Payment amount (${paymentData.amount}) cannot exceed balance (${invoice.balanceAmount})`,
        400
      );
    }

    // Generate payment number
    let paymentNumber;
    let exists = true;
    let attempts = 0;

    while (exists && attempts < 10) {
      paymentNumber = generateTransactionId('PAY');
      exists = await paymentRepository.findByPaymentNumber(paymentNumber, companyId);
      attempts++;
    }

    if (exists) {
      throw new AppError('Unable to generate unique payment number', 500);
    }

    // Create payment
    const payment = await paymentRepository.create({
      paymentNumber,
      invoiceId: invoice._id,
      customerId: invoice.customerId,
      date: paymentData.date || new Date(),
      amount: paymentData.amount,
      method: paymentData.method,
      referenceNumber: paymentData.referenceNumber,
      bankName: paymentData.bankName,
      chequeNumber: paymentData.chequeNumber,
      notes: paymentData.notes,
      status: 'completed',
      companyId,
      createdBy: userId,
    });

    // Update invoice paid amount
    invoice.paidAmount = (invoice.paidAmount || 0) + paymentData.amount;
    invoice.updatedBy = userId;
    await invoice.save();

    return payment;
  }

  /**
   * Create payment for purchase order
   */
  async createForPurchaseOrder(purchaseOrderId, paymentData, userId, companyId) {
    // Get purchase order
    const purchaseOrder = await purchaseRepository.findById(purchaseOrderId);

    if (!purchaseOrder) {
      throw new NotFoundError('Purchase order');
    }

    if (purchaseOrder.companyId.toString() !== companyId.toString()) {
      throw new AppError('Not authorized', 403);
    }

    if (paymentData.amount > purchaseOrder.balanceAmount) {
      throw new AppError(
        `Payment amount (${paymentData.amount}) cannot exceed balance (${purchaseOrder.balanceAmount})`,
        400
      );
    }

    // Generate payment number
    let paymentNumber;
    let exists = true;
    let attempts = 0;

    while (exists && attempts < 10) {
      paymentNumber = generateTransactionId('PAY');
      exists = await paymentRepository.findByPaymentNumber(paymentNumber, companyId);
      attempts++;
    }

    if (exists) {
      throw new AppError('Unable to generate unique payment number', 500);
    }

    // Create payment
    const payment = await paymentRepository.create({
      paymentNumber,
      purchaseOrderId: purchaseOrder._id,
      supplierId: purchaseOrder.supplierId,
      date: paymentData.date || new Date(),
      amount: paymentData.amount,
      method: paymentData.method,
      referenceNumber: paymentData.referenceNumber,
      bankName: paymentData.bankName,
      chequeNumber: paymentData.chequeNumber,
      notes: paymentData.notes,
      status: 'completed',
      companyId,
      createdBy: userId,
    });

    // Update purchase order paid amount
    purchaseOrder.paidAmount = (purchaseOrder.paidAmount || 0) + paymentData.amount;
    purchaseOrder.updatedBy = userId;
    await purchaseOrder.save();

    return payment;
  }

  /**
   * Get all payments with filters
   */
  async getAll(queryParams, companyId) {
    const query = { companyId };

    // Filter by customer
    if (queryParams.customerId) {
      query.customerId = queryParams.customerId;
    }

    // Filter by supplier
    if (queryParams.supplierId) {
      query.supplierId = queryParams.supplierId;
    }

    // Filter by invoice
    if (queryParams.invoiceId) {
      query.invoiceId = queryParams.invoiceId;
    }

    // Filter by purchase order
    if (queryParams.purchaseOrderId) {
      query.purchaseOrderId = queryParams.purchaseOrderId;
    }

    // Filter by method
    if (queryParams.method) {
      query.method = queryParams.method;
    }

    // Filter by status
    if (queryParams.status) {
      query.status = queryParams.status;
    }

    // Filter by date range
    if (queryParams.startDate || queryParams.endDate) {
      query.date = {};
      if (queryParams.startDate) {
        query.date.$gte = new Date(queryParams.startDate);
      }
      if (queryParams.endDate) {
        query.date.$lte = new Date(queryParams.endDate);
      }
    }

    const options = {
      populate: [
        { path: 'invoiceId', select: 'invoiceNumber totalAmount' },
        { path: 'purchaseOrderId', select: 'orderNumber totalAmount' },
        { path: 'customerId', select: 'name email' },
        { path: 'supplierId', select: 'name email' },
        { path: 'createdBy', select: 'name email' },
      ],
      sort: queryParams.sort || { date: -1 },
    };

    return await paymentRepository.findAll(query, options);
  }

  /**
   * Get payment summary
   */
  async getPaymentSummary(companyId, startDate, endDate) {
    return await paymentRepository.getPaymentSummary(companyId, startDate, endDate);
  }

  /**
   * Get payments by invoice
   */
  async getByInvoice(invoiceId, companyId) {
    return await paymentRepository.findByInvoice(invoiceId, companyId);
  }

  /**
   * Get payments by customer
   */
  async getByCustomer(customerId, companyId, options = {}) {
    return await paymentRepository.findByCustomer(customerId, companyId, options);
  }
}

module.exports = new PaymentService();

