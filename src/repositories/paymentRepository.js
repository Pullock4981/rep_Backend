const BaseRepository = require('./baseRepository');
const Payment = require('../models/Payment');

class PaymentRepository extends BaseRepository {
  constructor() {
    super(Payment);
  }

  /**
   * Find payment by payment number
   */
  async findByPaymentNumber(paymentNumber, companyId) {
    return await this.model.findOne({ paymentNumber, companyId });
  }

  /**
   * Find payments by invoice
   */
  async findByInvoice(invoiceId, companyId) {
    return await this.model.find({
      invoiceId,
      companyId,
      status: 'completed',
    }).sort({ date: -1 });
  }

  /**
   * Find payments by purchase order
   */
  async findByPurchaseOrder(purchaseOrderId, companyId) {
    return await this.model.find({
      purchaseOrderId,
      companyId,
      status: 'completed',
    }).sort({ date: -1 });
  }

  /**
   * Find payments by customer
   */
  async findByCustomer(customerId, companyId, options = {}) {
    const query = { customerId, companyId };

    return await this.findAll(query, {
      populate: [
        { path: 'invoiceId', select: 'invoiceNumber totalAmount' },
      ],
      sort: { date: -1 },
      ...options,
    });
  }

  /**
   * Find payments by supplier
   */
  async findBySupplier(supplierId, companyId, options = {}) {
    const query = { supplierId, companyId };

    return await this.findAll(query, {
      populate: [
        { path: 'purchaseOrderId', select: 'orderNumber totalAmount' },
      ],
      sort: { date: -1 },
      ...options,
    });
  }

  /**
   * Get payment summary
   */
  async getPaymentSummary(companyId, startDate, endDate) {
    const query = {
      companyId,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
      status: 'completed',
    };

    const payments = await this.model.find(query);

    const summary = {
      totalPayments: payments.length,
      totalAmount: 0,
      byMethod: {},
      customerPayments: 0,
      supplierPayments: 0,
    };

    payments.forEach((payment) => {
      summary.totalAmount += payment.amount || 0;
      summary.byMethod[payment.method] = (summary.byMethod[payment.method] || 0) + 1;

      if (payment.customerId) {
        summary.customerPayments += payment.amount || 0;
      }
      if (payment.supplierId) {
        summary.supplierPayments += payment.amount || 0;
      }
    });

    return summary;
  }
}

module.exports = new PaymentRepository();

