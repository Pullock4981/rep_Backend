const BaseRepository = require('./baseRepository');
const PurchaseOrder = require('../models/PurchaseOrder');

class PurchaseRepository extends BaseRepository {
  constructor() {
    super(PurchaseOrder);
  }

  /**
   * Find order by order number
   */
  async findByOrderNumber(orderNumber, companyId) {
    return await this.model.findOne({ orderNumber, companyId });
  }

  /**
   * Find orders by supplier
   */
  async findBySupplier(supplierId, companyId, options = {}) {
    const query = { supplierId, companyId };

    return await this.findAll(query, {
      populate: [
        { path: 'supplierId', select: 'name email phone' },
        { path: 'warehouseId', select: 'name code' },
        { path: 'createdBy', select: 'name email' },
      ],
      sort: { createdAt: -1 },
      ...options,
    });
  }

  /**
   * Find orders by status
   */
  async findByStatus(status, companyId, options = {}) {
    const query = { status, companyId };

    return await this.findAll(query, {
      populate: [
        { path: 'supplierId', select: 'name email phone' },
        { path: 'warehouseId', select: 'name code' },
      ],
      sort: { createdAt: -1 },
      ...options,
    });
  }

  /**
   * Find orders by payment status
   */
  async findByPaymentStatus(paymentStatus, companyId, options = {}) {
    const query = { paymentStatus, companyId };

    return await this.findAll(query, {
      populate: [
        { path: 'supplierId', select: 'name email phone' },
        { path: 'warehouseId', select: 'name code' },
      ],
      sort: { createdAt: -1 },
      ...options,
    });
  }

  /**
   * Get purchase summary by date range
   */
  async getPurchaseSummary(companyId, startDate, endDate) {
    const query = {
      companyId,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    };

    const orders = await this.model.find(query);

    const summary = {
      totalOrders: orders.length,
      totalAmount: 0,
      totalPaid: 0,
      totalBalance: 0,
      byStatus: {},
      byPaymentStatus: {},
    };

    orders.forEach((order) => {
      summary.totalAmount += order.totalAmount || 0;
      summary.totalPaid += order.paidAmount || 0;
      summary.totalBalance += order.balanceAmount || 0;

      // Count by status
      summary.byStatus[order.status] = (summary.byStatus[order.status] || 0) + 1;

      // Count by payment status
      summary.byPaymentStatus[order.paymentStatus] =
        (summary.byPaymentStatus[order.paymentStatus] || 0) + 1;
    });

    return summary;
  }

  /**
   * Get orders with items populated
   */
  async findByIdWithItems(id) {
    return await this.model.findById(id).populate([
      { path: 'supplierId', select: 'name email phone address' },
      { path: 'warehouseId', select: 'name code' },
      { path: 'items.productId', select: 'name sku costPrice' },
      { path: 'createdBy', select: 'name email' },
      { path: 'updatedBy', select: 'name email' },
    ]);
  }
}

module.exports = new PurchaseRepository();

