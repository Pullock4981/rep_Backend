const salesRepository = require('../repositories/salesRepository');
const purchaseRepository = require('../repositories/purchaseRepository');
const invoiceRepository = require('../repositories/invoiceRepository');
const paymentRepository = require('../repositories/paymentRepository');
const inventoryRepository = require('../repositories/inventoryRepository');
const productRepository = require('../repositories/productRepository');
const customerRepository = require('../repositories/customerRepository');
const supplierRepository = require('../repositories/supplierRepository');
const salesService = require('./salesService');
const purchaseService = require('./purchaseService');
const inventoryService = require('./inventoryService');

class DashboardService {
  /**
   * Get dashboard overview
   */
  async getDashboardOverview(companyId, dateRange = {}) {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    const startDate = dateRange.startDate || startOfMonth;
    const endDate = dateRange.endDate || today;

    // Get all statistics in parallel
    const [
      salesStats,
      purchaseStats,
      invoiceStats,
      paymentStats,
      inventoryStats,
      productStats,
      customerStats,
      supplierStats,
      lowStockItems,
      recentSales,
      recentPurchases,
    ] = await Promise.all([
      this.getSalesStatistics(companyId, startDate, endDate),
      this.getPurchaseStatistics(companyId, startDate, endDate),
      this.getInvoiceStatistics(companyId, startDate, endDate),
      this.getPaymentStatistics(companyId, startDate, endDate),
      this.getInventoryStatistics(companyId),
      this.getProductStatistics(companyId),
      this.getCustomerStatistics(companyId),
      this.getSupplierStatistics(companyId),
      inventoryService.getLowStock(companyId),
      this.getRecentSales(companyId, 5),
      this.getRecentPurchases(companyId, 5),
    ]);

    return {
      overview: {
        sales: salesStats,
        purchase: purchaseStats,
        invoice: invoiceStats,
        payment: paymentStats,
        inventory: inventoryStats,
        products: productStats,
        customers: customerStats,
        suppliers: supplierStats,
      },
      alerts: {
        lowStock: lowStockItems.data || [],
        overdueInvoices: await this.getOverdueInvoices(companyId),
      },
      recent: {
        sales: recentSales,
        purchases: recentPurchases,
      },
      dateRange: {
        startDate,
        endDate,
      },
    };
  }

  /**
   * Get sales statistics
   */
  async getSalesStatistics(companyId, startDate, endDate) {
    const summary = await salesRepository.getSalesSummary(companyId, startDate, endDate);

    // Get today's sales
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaySummary = await salesRepository.getSalesSummary(companyId, today, tomorrow);

    return {
      totalOrders: summary.totalOrders,
      totalAmount: summary.totalAmount,
      totalPaid: summary.totalPaid,
      totalBalance: summary.totalBalance,
      todayOrders: todaySummary.totalOrders,
      todayAmount: todaySummary.totalAmount,
      byStatus: summary.byStatus,
      byPaymentStatus: summary.byPaymentStatus,
    };
  }

  /**
   * Get purchase statistics
   */
  async getPurchaseStatistics(companyId, startDate, endDate) {
    const summary = await purchaseRepository.getPurchaseSummary(companyId, startDate, endDate);

    // Get today's purchases
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaySummary = await purchaseRepository.getPurchaseSummary(companyId, today, tomorrow);

    return {
      totalOrders: summary.totalOrders,
      totalAmount: summary.totalAmount,
      totalPaid: summary.totalPaid,
      totalBalance: summary.totalBalance,
      todayOrders: todaySummary.totalOrders,
      todayAmount: todaySummary.totalAmount,
      byStatus: summary.byStatus,
      byPaymentStatus: summary.byPaymentStatus,
    };
  }

  /**
   * Get invoice statistics
   */
  async getInvoiceStatistics(companyId, startDate, endDate) {
    const summary = await invoiceRepository.getInvoiceSummary(companyId, startDate, endDate);

    return {
      totalInvoices: summary.totalInvoices,
      totalAmount: summary.totalAmount,
      totalPaid: summary.totalPaid,
      totalOutstanding: summary.totalOutstanding,
      byPaymentStatus: summary.byPaymentStatus,
      byStatus: summary.byStatus,
    };
  }

  /**
   * Get payment statistics
   */
  async getPaymentStatistics(companyId, startDate, endDate) {
    const summary = await paymentRepository.getPaymentSummary(companyId, startDate, endDate);

    return {
      totalPayments: summary.totalPayments,
      totalAmount: summary.totalAmount,
      customerPayments: summary.customerPayments,
      supplierPayments: summary.supplierPayments,
      byMethod: summary.byMethod,
    };
  }

  /**
   * Get inventory statistics
   */
  async getInventoryStatistics(companyId) {
    const products = await productRepository.findAll(
      { companyId, isActive: true },
      { limit: 10000 }
    );

    const totalProducts = products.total;
    const totalValue = await this.calculateTotalInventoryValue(companyId);
    const lowStockCount = (await inventoryService.getLowStock(companyId)).total;

    return {
      totalProducts,
      totalValue,
      lowStockCount,
    };
  }

  /**
   * Calculate total inventory value
   */
  async calculateTotalInventoryValue(companyId) {
    const inventories = await inventoryRepository.findAll(
      { companyId },
      { limit: 10000 }
    );

    return inventories.data.reduce((sum, inv) => {
      return sum + (inv.totalValue || 0);
    }, 0);
  }

  /**
   * Get product statistics
   */
  async getProductStatistics(companyId) {
    const { total: totalProducts } = await productRepository.findAll(
      { companyId },
      { limit: 1 }
    );

    const { total: activeProducts } = await productRepository.findAll(
      { companyId, isActive: true },
      { limit: 1 }
    );

    const { total: inactiveProducts } = await productRepository.findAll(
      { companyId, isActive: false },
      { limit: 1 }
    );

    return {
      total: totalProducts,
      active: activeProducts,
      inactive: inactiveProducts,
    };
  }

  /**
   * Get customer statistics
   */
  async getCustomerStatistics(companyId) {
    const { total: totalCustomers } = await customerRepository.findAll(
      { companyId },
      { limit: 1 }
    );

    const { total: activeCustomers } = await customerRepository.findAll(
      { companyId, isActive: true, status: 'active' },
      { limit: 1 }
    );

    return {
      total: totalCustomers,
      active: activeCustomers,
    };
  }

  /**
   * Get supplier statistics
   */
  async getSupplierStatistics(companyId) {
    const { total: totalSuppliers } = await supplierRepository.findAll(
      { companyId },
      { limit: 1 }
    );

    const { total: activeSuppliers } = await supplierRepository.findAll(
      { companyId, isActive: true, status: 'active' },
      { limit: 1 }
    );

    return {
      total: totalSuppliers,
      active: activeSuppliers,
    };
  }

  /**
   * Get recent sales orders
   */
  async getRecentSales(companyId, limit = 5) {
    const { data } = await salesRepository.findAll(
      { companyId },
      {
        populate: [
          { path: 'customerId', select: 'name email' },
        ],
        sort: { createdAt: -1 },
        limit,
      }
    );

    return data;
  }

  /**
   * Get recent purchase orders
   */
  async getRecentPurchases(companyId, limit = 5) {
    const { data } = await purchaseRepository.findAll(
      { companyId },
      {
        populate: [
          { path: 'supplierId', select: 'name email' },
        ],
        sort: { createdAt: -1 },
        limit,
      }
    );

    return data;
  }

  /**
   * Get overdue invoices
   */
  async getOverdueInvoices(companyId, limit = 10) {
    const { data } = await invoiceRepository.findOverdueInvoices(companyId, { limit });

    return data;
  }

  /**
   * Get sales chart data (for charts)
   */
  async getSalesChartData(companyId, startDate, endDate, groupBy = 'day') {
    const orders = await salesRepository.model.find({
      companyId,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ date: 1 });

    // Group by day/week/month
    const grouped = {};
    orders.forEach((order) => {
      let key;
      const date = new Date(order.date);

      if (groupBy === 'day') {
        key = date.toISOString().split('T')[0];
      } else if (groupBy === 'week') {
        const week = this.getWeekNumber(date);
        key = `${date.getFullYear()}-W${week}`;
      } else if (groupBy === 'month') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!grouped[key]) {
        grouped[key] = { date: key, orders: 0, amount: 0 };
      }

      grouped[key].orders += 1;
      grouped[key].amount += order.totalAmount || 0;
    });

    return Object.values(grouped);
  }

  /**
   * Get week number
   */
  getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  }

  /**
   * Get top selling products
   */
  async getTopSellingProducts(companyId, startDate, endDate, limit = 10) {
    const orders = await salesRepository.model.find({
      companyId,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
      status: { $ne: 'cancelled' },
    }).populate('items.productId', 'name sku');

    const productSales = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const productId = item.productId._id.toString();
        if (!productSales[productId]) {
          productSales[productId] = {
            productId: item.productId._id,
            productName: item.productId.name,
            sku: item.productId.sku,
            quantity: 0,
            amount: 0,
          };
        }
        productSales[productId].quantity += item.quantity;
        productSales[productId].amount += item.total;
      });
    });

    return Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, limit);
  }

  /**
   * Get top customers
   */
  async getTopCustomers(companyId, startDate, endDate, limit = 10) {
    const summary = await salesRepository.getSalesSummary(companyId, startDate, endDate);

    const orders = await salesRepository.model.find({
      companyId,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }).populate('customerId', 'name email');

    const customerSales = {};

    orders.forEach((order) => {
      const customerId = order.customerId._id.toString();
      if (!customerSales[customerId]) {
        customerSales[customerId] = {
          customerId: order.customerId._id,
          customerName: order.customerId.name,
          orders: 0,
          amount: 0,
        };
      }
      customerSales[customerId].orders += 1;
      customerSales[customerId].amount += order.totalAmount || 0;
    });

    return Object.values(customerSales)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, limit);
  }
}

module.exports = new DashboardService();

