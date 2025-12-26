const BaseRepository = require('./baseRepository');
const Invoice = require('../models/Invoice');

class InvoiceRepository extends BaseRepository {
  constructor() {
    super(Invoice);
  }

  /**
   * Find invoice by invoice number
   */
  async findByInvoiceNumber(invoiceNumber, companyId) {
    return await this.model.findOne({ invoiceNumber, companyId });
  }

  /**
   * Find invoices by customer
   */
  async findByCustomer(customerId, companyId, options = {}) {
    const query = { customerId, companyId };

    return await this.findAll(query, {
      populate: [
        { path: 'customerId', select: 'name email phone' },
        { path: 'salesOrderId', select: 'orderNumber' },
        { path: 'createdBy', select: 'name email' },
      ],
      sort: { createdAt: -1 },
      ...options,
    });
  }

  /**
   * Find invoices by payment status
   */
  async findByPaymentStatus(paymentStatus, companyId, options = {}) {
    const query = { paymentStatus, companyId };

    return await this.findAll(query, {
      populate: [
        { path: 'customerId', select: 'name email phone' },
      ],
      sort: { createdAt: -1 },
      ...options,
    });
  }

  /**
   * Find overdue invoices
   */
  async findOverdueInvoices(companyId, options = {}) {
    const query = {
      companyId,
      status: 'overdue',
      balanceAmount: { $gt: 0 },
    };

    return await this.findAll(query, {
      populate: [
        { path: 'customerId', select: 'name email phone' },
      ],
      sort: { dueDate: 1 },
      ...options,
    });
  }

  /**
   * Get invoice summary
   */
  async getInvoiceSummary(companyId, startDate, endDate) {
    const query = {
      companyId,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    };

    const invoices = await this.model.find(query);

    const summary = {
      totalInvoices: invoices.length,
      totalAmount: 0,
      totalPaid: 0,
      totalOutstanding: 0,
      byPaymentStatus: {},
      byStatus: {},
    };

    invoices.forEach((invoice) => {
      summary.totalAmount += invoice.totalAmount || 0;
      summary.totalPaid += invoice.paidAmount || 0;
      summary.totalOutstanding += invoice.balanceAmount || 0;

      summary.byPaymentStatus[invoice.paymentStatus] =
        (summary.byPaymentStatus[invoice.paymentStatus] || 0) + 1;
      summary.byStatus[invoice.status] = (summary.byStatus[invoice.status] || 0) + 1;
    });

    return summary;
  }

  /**
   * Get invoice with items populated
   */
  async findByIdWithItems(id) {
    return await this.model.findById(id).populate([
      { path: 'customerId', select: 'name email phone address' },
      { path: 'salesOrderId', select: 'orderNumber date' },
      { path: 'items.productId', select: 'name sku' },
      { path: 'createdBy', select: 'name email' },
      { path: 'updatedBy', select: 'name email' },
    ]);
  }
}

module.exports = new InvoiceRepository();

