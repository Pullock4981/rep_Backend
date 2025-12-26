const BaseService = require('./baseService');
const invoiceRepository = require('../repositories/invoiceRepository');
const salesRepository = require('../repositories/salesRepository');
const customerRepository = require('../repositories/customerRepository');
const NotFoundError = require('../exceptions/NotFoundError');
const AppError = require('../exceptions/AppError');
const { generateInvoiceNumber } = require('../utils/generators');

class InvoiceService extends BaseService {
  constructor() {
    super(invoiceRepository);
  }

  /**
   * Create invoice from sales order
   */
  async createFromSalesOrder(salesOrderId, invoiceData, userId, companyId) {
    // Get sales order
    const salesOrder = await salesRepository.findByIdWithItems(salesOrderId);

    if (!salesOrder) {
      throw new NotFoundError('Sales order');
    }

    if (salesOrder.companyId.toString() !== companyId.toString()) {
      throw new AppError('Not authorized', 403);
    }

    // Check if invoice already exists
    const existingInvoice = await invoiceRepository.findOne({
      salesOrderId,
      companyId,
    });

    if (existingInvoice) {
      throw new AppError('Invoice already exists for this sales order', 400);
    }

    // Generate invoice number
    let invoiceNumber;
    let exists = true;
    let attempts = 0;

    while (exists && attempts < 10) {
      invoiceNumber = generateInvoiceNumber('INV');
      exists = await invoiceRepository.findByInvoiceNumber(invoiceNumber, companyId);
      attempts++;
    }

    if (exists) {
      throw new AppError('Unable to generate unique invoice number', 500);
    }

    // Calculate due date (default: 30 days from invoice date)
    const invoiceDate = invoiceData.date ? new Date(invoiceData.date) : new Date();
    const dueDate = invoiceData.dueDate
      ? new Date(invoiceData.dueDate)
      : new Date(invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Create invoice from sales order
    const invoice = await invoiceRepository.create({
      invoiceNumber,
      salesOrderId: salesOrder._id,
      customerId: salesOrder.customerId,
      date: invoiceDate,
      dueDate,
      items: salesOrder.items.map((item) => ({
        productId: item.productId,
        productName: item.productId?.name || '',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        tax: item.tax || 0,
        total: item.total,
      })),
      subtotal: salesOrder.subtotal,
      totalDiscount: salesOrder.totalDiscount,
      totalTax: salesOrder.totalTax,
      shippingCharges: salesOrder.shippingCharges || 0,
      totalAmount: salesOrder.totalAmount,
      paidAmount: salesOrder.paidAmount || 0,
      notes: invoiceData.notes || salesOrder.notes,
      terms: invoiceData.terms,
      companyId,
      createdBy: userId,
    });

    return await invoiceRepository.findByIdWithItems(invoice._id);
  }

  /**
   * Create standalone invoice
   */
  async createStandalone(invoiceData, userId, companyId) {
    // Validate customer
    const customer = await customerRepository.findById(invoiceData.customerId);
    if (!customer) {
      throw new NotFoundError('Customer');
    }
    if (customer.companyId.toString() !== companyId.toString()) {
      throw new AppError('Customer does not belong to your company', 403);
    }

    // Generate invoice number
    let invoiceNumber;
    let exists = true;
    let attempts = 0;

    while (exists && attempts < 10) {
      invoiceNumber = generateInvoiceNumber('INV');
      exists = await invoiceRepository.findByInvoiceNumber(invoiceNumber, companyId);
      attempts++;
    }

    if (exists) {
      throw new AppError('Unable to generate unique invoice number', 500);
    }

    invoiceData.invoiceNumber = invoiceNumber;
    invoiceData.companyId = companyId;
    invoiceData.createdBy = userId;

    const invoice = await invoiceRepository.create(invoiceData);
    return await invoiceRepository.findByIdWithItems(invoice._id);
  }

  /**
   * Get invoice by ID
   */
  async getById(id, companyId) {
    const invoice = await invoiceRepository.findByIdWithItems(id);

    if (!invoice) {
      throw new NotFoundError('Invoice');
    }

    if (invoice.companyId.toString() !== companyId.toString()) {
      throw new AppError('Not authorized to access this invoice', 403);
    }

    return invoice;
  }

  /**
   * Get all invoices with filters
   */
  async getAll(queryParams, companyId) {
    const query = { companyId };

    // Filter by customer
    if (queryParams.customerId) {
      query.customerId = queryParams.customerId;
    }

    // Filter by payment status
    if (queryParams.paymentStatus) {
      query.paymentStatus = queryParams.paymentStatus;
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

    // Search by invoice number
    if (queryParams.search) {
      query.invoiceNumber = { $regex: queryParams.search, $options: 'i' };
    }

    const options = {
      populate: [
        { path: 'customerId', select: 'name email phone' },
        { path: 'salesOrderId', select: 'orderNumber' },
        { path: 'createdBy', select: 'name email' },
      ],
      sort: queryParams.sort || { createdAt: -1 },
    };

    return await invoiceRepository.findAll(query, options);
  }

  /**
   * Get overdue invoices
   */
  async getOverdueInvoices(companyId, options = {}) {
    return await invoiceRepository.findOverdueInvoices(companyId, options);
  }

  /**
   * Get invoice summary
   */
  async getInvoiceSummary(companyId, startDate, endDate) {
    return await invoiceRepository.getInvoiceSummary(companyId, startDate, endDate);
  }

  /**
   * Get invoices by customer
   */
  async getByCustomer(customerId, companyId, options = {}) {
    return await invoiceRepository.findByCustomer(customerId, companyId, options);
  }
}

module.exports = new InvoiceService();

