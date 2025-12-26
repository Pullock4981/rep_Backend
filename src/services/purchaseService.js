const BaseService = require('./baseService');
const purchaseRepository = require('../repositories/purchaseRepository');
const inventoryService = require('./inventoryService');
const productRepository = require('../repositories/productRepository');
const supplierRepository = require('../repositories/supplierRepository');
const warehouseRepository = require('../repositories/warehouseRepository');
const NotFoundError = require('../exceptions/NotFoundError');
const AppError = require('../exceptions/AppError');
const { generatePONumber } = require('../utils/generators');
const orderStatus = require('../enums/orderStatus');
const paymentStatus = require('../enums/paymentStatus');

class PurchaseService extends BaseService {
  constructor() {
    super(purchaseRepository);
  }

  /**
   * Create purchase order
   */
  async create(orderData, userId, companyId) {
    // Validate supplier
    const supplier = await supplierRepository.findById(orderData.supplierId);
    if (!supplier) {
      throw new NotFoundError('Supplier');
    }
    if (supplier.companyId.toString() !== companyId.toString()) {
      throw new AppError('Supplier does not belong to your company', 403);
    }

    // Validate warehouse
    const warehouse = await warehouseRepository.findById(orderData.warehouseId);
    if (!warehouse) {
      throw new NotFoundError('Warehouse');
    }
    if (warehouse.companyId.toString() !== companyId.toString()) {
      throw new AppError('Warehouse does not belong to your company', 403);
    }

    // Validate products
    for (const item of orderData.items) {
      const product = await productRepository.findById(item.productId);
      if (!product) {
        throw new NotFoundError(`Product with ID ${item.productId}`);
      }
      if (product.companyId.toString() !== companyId.toString()) {
        throw new AppError(`Product does not belong to your company`, 403);
      }
    }

    // Generate order number
    let orderNumber;
    let exists = true;
    let attempts = 0;

    while (exists && attempts < 10) {
      orderNumber = generatePONumber('PO');
      exists = await purchaseRepository.findByOrderNumber(orderNumber, companyId);
      attempts++;
    }

    if (exists) {
      throw new AppError('Unable to generate unique order number', 500);
    }

    orderData.orderNumber = orderNumber;
    orderData.companyId = companyId;
    orderData.createdBy = userId;

    // Initialize received quantities
    orderData.items.forEach((item) => {
      item.receivedQuantity = 0;
    });

    // Create order
    const order = await purchaseRepository.create(orderData);

    return await purchaseRepository.findByIdWithItems(order._id);
  }

  /**
   * Receive goods (partial or full)
   */
  async receiveGoods(orderId, receivedItems, userId, companyId) {
    const order = await purchaseRepository.findById(orderId);

    if (!order) {
      throw new NotFoundError('Purchase order');
    }

    if (order.companyId.toString() !== companyId.toString()) {
      throw new AppError('Not authorized to update this order', 403);
    }

    // Update received quantities and add to inventory
    for (const receivedItem of receivedItems) {
      const orderItem = order.items.id(receivedItem.itemId);
      if (!orderItem) {
        throw new NotFoundError(`Order item with ID ${receivedItem.itemId}`);
      }

      const newReceivedQuantity = (orderItem.receivedQuantity || 0) + receivedItem.quantity;

      if (newReceivedQuantity > orderItem.quantity) {
        throw new AppError(
          `Cannot receive more than ordered. Ordered: ${orderItem.quantity}, Already received: ${orderItem.receivedQuantity}, Trying to receive: ${receivedItem.quantity}`,
          400
        );
      }

      // Update received quantity
      orderItem.receivedQuantity = newReceivedQuantity;

      // Add to inventory
      await inventoryService.addStock(
        orderItem.productId,
        order.warehouseId,
        receivedItem.quantity,
        orderItem.unitCost, // Use order cost
        userId,
        companyId,
        {
          referenceType: 'purchase',
          referenceId: order._id,
          notes: `Purchase order ${order.orderNumber}`,
        }
      );
    }

    // Update received date if first time receiving
    if (!order.receivedDate && receivedItems.length > 0) {
      order.receivedDate = new Date();
    }

    // Update status if fully received
    if (order.isFullyReceived && order.status === orderStatus.PENDING) {
      order.status = orderStatus.CONFIRMED;
    }

    order.updatedBy = userId;
    await order.save();

    return await purchaseRepository.findByIdWithItems(orderId);
  }

  /**
   * Update order status
   */
  async updateStatus(orderId, newStatus, userId, companyId) {
    const order = await purchaseRepository.findById(orderId);

    if (!order) {
      throw new NotFoundError('Purchase order');
    }

    if (order.companyId.toString() !== companyId.toString()) {
      throw new AppError('Not authorized to update this order', 403);
    }

    order.status = newStatus;
    order.updatedBy = userId;
    await order.save();

    return await purchaseRepository.findByIdWithItems(orderId);
  }

  /**
   * Add payment to order
   */
  async addPayment(orderId, paymentAmount, userId, companyId) {
    const order = await purchaseRepository.findById(orderId);

    if (!order) {
      throw new NotFoundError('Purchase order');
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

    return await purchaseRepository.findByIdWithItems(orderId);
  }

  /**
   * Get order by ID with populated fields
   */
  async getById(id, companyId) {
    const order = await purchaseRepository.findByIdWithItems(id);

    if (!order) {
      throw new NotFoundError('Purchase order');
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

    // Filter by supplier
    if (queryParams.supplierId) {
      query.supplierId = queryParams.supplierId;
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
        { path: 'supplierId', select: 'name email phone' },
        { path: 'warehouseId', select: 'name code' },
        { path: 'createdBy', select: 'name email' },
      ],
      sort: queryParams.sort || { createdAt: -1 },
    };

    return await purchaseRepository.findAll(query, options);
  }

  /**
   * Get purchase summary
   */
  async getPurchaseSummary(companyId, startDate, endDate) {
    return await purchaseRepository.getPurchaseSummary(companyId, startDate, endDate);
  }

  /**
   * Get orders by supplier
   */
  async getBySupplier(supplierId, companyId, options = {}) {
    return await purchaseRepository.findBySupplier(supplierId, companyId, options);
  }
}

module.exports = new PurchaseService();

