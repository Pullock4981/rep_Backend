const BaseService = require('./baseService');
const salesRepository = require('../repositories/salesRepository');
const inventoryService = require('./inventoryService');
const productRepository = require('../repositories/productRepository');
const customerRepository = require('../repositories/customerRepository');
const warehouseRepository = require('../repositories/warehouseRepository');
const NotFoundError = require('../exceptions/NotFoundError');
const AppError = require('../exceptions/AppError');
const { generateOrderNumber } = require('../utils/generators');
const orderStatus = require('../enums/orderStatus');
const paymentStatus = require('../enums/paymentStatus');

class SalesService extends BaseService {
  constructor() {
    super(salesRepository);
  }

  /**
   * Create sales order
   */
  async create(orderData, userId, companyId) {
    // Validate customer
    const customer = await customerRepository.findById(orderData.customerId);
    if (!customer) {
      throw new NotFoundError('Customer');
    }
    if (customer.companyId.toString() !== companyId.toString()) {
      throw new AppError('Customer does not belong to your company', 403);
    }

    // Validate warehouse
    const warehouse = await warehouseRepository.findById(orderData.warehouseId);
    if (!warehouse) {
      throw new NotFoundError('Warehouse');
    }
    if (warehouse.companyId.toString() !== companyId.toString()) {
      throw new AppError('Warehouse does not belong to your company', 403);
    }

    // Validate products and check stock
    for (const item of orderData.items) {
      const product = await productRepository.findById(item.productId);
      if (!product) {
        throw new NotFoundError(`Product with ID ${item.productId}`);
      }
      if (product.companyId.toString() !== companyId.toString()) {
        throw new AppError(`Product does not belong to your company`, 403);
      }

      // Check stock availability
      const inventory = await inventoryService.getOrCreateInventory(
        item.productId,
        orderData.warehouseId,
        companyId
      );

      if (inventory.availableQuantity < item.quantity) {
        throw new AppError(
          `Insufficient stock for product ${product.name}. Available: ${inventory.availableQuantity}, Requested: ${item.quantity}`,
          400
        );
      }
    }

    // Generate order number
    let orderNumber;
    let exists = true;
    let attempts = 0;

    while (exists && attempts < 10) {
      orderNumber = generateOrderNumber('SO');
      exists = await salesRepository.findByOrderNumber(orderNumber, companyId);
      attempts++;
    }

    if (exists) {
      throw new AppError('Unable to generate unique order number', 500);
    }

    orderData.orderNumber = orderNumber;
    orderData.companyId = companyId;
    orderData.createdBy = userId;

    // Create order
    const order = await salesRepository.create(orderData);

    // Reserve stock (don't remove yet, wait for confirmation)
    for (const item of orderData.items) {
      await inventoryService.reserveQuantity(
        item.productId,
        orderData.warehouseId,
        item.quantity,
        userId,
        companyId
      );
    }

    return await salesRepository.findByIdWithItems(order._id);
  }

  /**
   * Update order status
   */
  async updateStatus(orderId, newStatus, userId, companyId) {
    const order = await salesRepository.findById(orderId);

    if (!order) {
      throw new NotFoundError('Sales order');
    }

    if (order.companyId.toString() !== companyId.toString()) {
      throw new AppError('Not authorized to update this order', 403);
    }

    const oldStatus = order.status;

    // Update status
    order.status = newStatus;
    order.updatedBy = userId;
    await order.save();

    // If confirmed, remove stock from inventory
    if (newStatus === orderStatus.CONFIRMED && oldStatus !== orderStatus.CONFIRMED) {
      for (const item of order.items) {
        await inventoryService.removeStock(
          item.productId,
          order.warehouseId,
          item.quantity,
          userId,
          companyId,
          {
            referenceType: 'sales',
            referenceId: order._id,
            notes: `Sales order ${order.orderNumber}`,
          }
        );
      }
    }

    // If cancelled, release reserved stock
    if (newStatus === orderStatus.CANCELLED && oldStatus !== orderStatus.CANCELLED) {
      for (const item of order.items) {
        await inventoryService.releaseReservedQuantity(
          item.productId,
          order.warehouseId,
          item.quantity,
          userId,
          companyId
        );
      }
    }

    return await salesRepository.findByIdWithItems(orderId);
  }

  /**
   * Add payment to order
   */
  async addPayment(orderId, paymentAmount, userId, companyId) {
    const order = await salesRepository.findById(orderId);

    if (!order) {
      throw new NotFoundError('Sales order');
    }

    if (order.companyId.toString() !== companyId.toString()) {
      throw new AppError('Not authorized', 403);
    }

    if (paymentAmount <= 0) {
      throw new AppError('Payment amount must be greater than 0', 400);
    }

    if (paymentAmount > order.balanceAmount) {
      throw new AppError(
        `Payment amount (${paymentAmount}) cannot exceed balance (${order.balanceAmount})`,
        400
      );
    }

    order.paidAmount = (order.paidAmount || 0) + paymentAmount;
    order.updatedBy = userId;
    await order.save();

    return await salesRepository.findByIdWithItems(orderId);
  }

  /**
   * Get order by ID with populated fields
   */
  async getById(id, companyId) {
    const order = await salesRepository.findByIdWithItems(id);

    if (!order) {
      throw new NotFoundError('Sales order');
    }

    if (order.companyId.toString() !== companyId.toString()) {
      throw new AppError('Not authorized to access this order', 403);
    }

    return order;
  }

  /**
   * Get all orders with filters
   */
  async getAll(queryParams, companyId) {
    const query = { companyId };

    // Filter by customer
    if (queryParams.customerId) {
      query.customerId = queryParams.customerId;
    }

    // Filter by status
    if (queryParams.status) {
      query.status = queryParams.status;
    }

    // Filter by payment status
    if (queryParams.paymentStatus) {
      query.paymentStatus = queryParams.paymentStatus;
    }

    // Filter by warehouse
    if (queryParams.warehouseId) {
      query.warehouseId = queryParams.warehouseId;
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

    // Search by order number
    if (queryParams.search) {
      query.orderNumber = { $regex: queryParams.search, $options: 'i' };
    }

    const options = {
      populate: [
        { path: 'customerId', select: 'name email phone' },
        { path: 'warehouseId', select: 'name code' },
        { path: 'createdBy', select: 'name email' },
      ],
      sort: queryParams.sort || { createdAt: -1 },
    };

    return await salesRepository.findAll(query, options);
  }

  /**
   * Get sales summary
   */
  async getSalesSummary(companyId, startDate, endDate) {
    return await salesRepository.getSalesSummary(companyId, startDate, endDate);
  }

  /**
   * Get orders by customer
   */
  async getByCustomer(customerId, companyId, options = {}) {
    return await salesRepository.findByCustomer(customerId, companyId, options);
  }
}

module.exports = new SalesService();

