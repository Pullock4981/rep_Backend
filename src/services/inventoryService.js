const BaseService = require('./baseService');
const inventoryRepository = require('../repositories/inventoryRepository');
const stockMovementRepository = require('../repositories/stockMovementRepository');
const productRepository = require('../repositories/productRepository');
const NotFoundError = require('../exceptions/NotFoundError');
const AppError = require('../exceptions/AppError');
const inventoryAction = require('../enums/inventoryAction');

class InventoryService extends BaseService {
  constructor() {
    super(inventoryRepository);
  }

  /**
   * Get or create inventory record
   */
  async getOrCreateInventory(productId, warehouseId, companyId) {
    let inventory = await inventoryRepository.findByProductAndWarehouse(
      productId,
      warehouseId
    );

    if (!inventory) {
      inventory = await inventoryRepository.create({
        productId,
        warehouseId,
        quantity: 0,
        companyId,
      });
    }

    return inventory;
  }

  /**
   * Add stock (IN)
   */
  async addStock(productId, warehouseId, quantity, cost, userId, companyId, options = {}) {
    const product = await productRepository.findById(productId);
    if (!product) {
      throw new NotFoundError('Product');
    }

    if (product.companyId.toString() !== companyId.toString()) {
      throw new AppError('Product does not belong to your company', 403);
    }

    const inventory = await this.getOrCreateInventory(productId, warehouseId, companyId);
    const previousQuantity = inventory.quantity;

    // Calculate new average cost
    const totalValue = inventory.quantity * inventory.averageCost;
    const newValue = quantity * cost;
    const newQuantity = inventory.quantity + quantity;
    const newAverageCost = newQuantity > 0 ? (totalValue + newValue) / newQuantity : cost;

    // Update inventory
    const updated = await inventoryRepository.updateById(inventory._id, {
      quantity: newQuantity,
      averageCost: newAverageCost,
      lastCost: cost,
    });

    // Create stock movement record
    await stockMovementRepository.create({
      productId,
      warehouseId,
      action: inventoryAction.IN,
      quantity,
      previousQuantity,
      newQuantity: updated.quantity,
      cost,
      referenceType: options.referenceType || 'other',
      referenceId: options.referenceId,
      notes: options.notes,
      companyId,
      createdBy: userId,
    });

    return updated;
  }

  /**
   * Remove stock (OUT)
   */
  async removeStock(productId, warehouseId, quantity, userId, companyId, options = {}) {
    const inventory = await inventoryRepository.findByProductAndWarehouse(
      productId,
      warehouseId
    );

    if (!inventory) {
      throw new NotFoundError('Inventory record');
    }

    if (inventory.companyId.toString() !== companyId.toString()) {
      throw new AppError('Not authorized', 403);
    }

    const previousQuantity = inventory.quantity;

    if (inventory.availableQuantity < quantity) {
      throw new AppError(
        `Insufficient stock. Available: ${inventory.availableQuantity}, Requested: ${quantity}`,
        400
      );
    }

    const newQuantity = inventory.quantity - quantity;

    // Update inventory
    const updated = await inventoryRepository.updateById(inventory._id, {
      quantity: newQuantity,
    });

    // Create stock movement record
    await stockMovementRepository.create({
      productId,
      warehouseId,
      action: inventoryAction.OUT,
      quantity: -quantity,
      previousQuantity,
      newQuantity: updated.quantity,
      cost: inventory.averageCost,
      referenceType: options.referenceType || 'other',
      referenceId: options.referenceId,
      notes: options.notes,
      companyId,
      createdBy: userId,
    });

    return updated;
  }

  /**
   * Adjust stock
   */
  async adjustStock(productId, warehouseId, newQuantity, userId, companyId, options = {}) {
    const inventory = await inventoryRepository.findByProductAndWarehouse(
      productId,
      warehouseId
    );

    if (!inventory) {
      throw new NotFoundError('Inventory record');
    }

    if (inventory.companyId.toString() !== companyId.toString()) {
      throw new AppError('Not authorized', 403);
    }

    const previousQuantity = inventory.quantity;
    const difference = newQuantity - previousQuantity;

    // Update inventory
    const updated = await inventoryRepository.updateById(inventory._id, {
      quantity: newQuantity,
    });

    // Create stock movement record
    await stockMovementRepository.create({
      productId,
      warehouseId,
      action: inventoryAction.ADJUSTMENT,
      quantity: difference,
      previousQuantity,
      newQuantity,
      cost: inventory.averageCost,
      referenceType: 'adjustment',
      notes: options.notes || `Stock adjustment: ${previousQuantity} → ${newQuantity}`,
      companyId,
      createdBy: userId,
    });

    return updated;
  }

  /**
   * Transfer stock between warehouses
   */
  async transferStock(
    productId,
    fromWarehouseId,
    toWarehouseId,
    quantity,
    userId,
    companyId,
    options = {}
  ) {
    if (fromWarehouseId.toString() === toWarehouseId.toString()) {
      throw new AppError('Source and destination warehouses cannot be the same', 400);
    }

    // Remove from source warehouse
    await this.removeStock(
      productId,
      fromWarehouseId,
      quantity,
      userId,
      companyId,
      { referenceType: 'transfer', ...options }
    );

    // Get source inventory for cost
    const sourceInventory = await inventoryRepository.findByProductAndWarehouse(
      productId,
      fromWarehouseId
    );

    // Add to destination warehouse
    await this.addStock(
      productId,
      toWarehouseId,
      quantity,
      sourceInventory.averageCost,
      userId,
      companyId,
      { referenceType: 'transfer', ...options }
    );

    // Create transfer movement record
    await stockMovementRepository.create({
      productId,
      warehouseId: fromWarehouseId,
      toWarehouseId,
      action: inventoryAction.TRANSFER,
      quantity: -quantity,
      notes: options.notes || `Transferred ${quantity} units to warehouse ${toWarehouseId}`,
      companyId,
      createdBy: userId,
    });

    return {
      from: await inventoryRepository.findByProductAndWarehouse(productId, fromWarehouseId),
      to: await inventoryRepository.findByProductAndWarehouse(productId, toWarehouseId),
    };
  }

  /**
   * Get inventory by product
   */
  async getByProduct(productId, companyId, options = {}) {
    return await inventoryRepository.findByProduct(productId, companyId, options);
  }

  /**
   * Get inventory by warehouse
   */
  async getByWarehouse(warehouseId, companyId, options = {}) {
    return await inventoryRepository.findByWarehouse(warehouseId, companyId, options);
  }

  /**
   * Get low stock items
   */
  async getLowStock(companyId, warehouseId = null, options = {}) {
    const { data, total } = await inventoryRepository.findLowStock(
      companyId,
      warehouseId,
      options
    );

    // Filter items where quantity <= reorderLevel
    const lowStockItems = data.filter((item) => {
      const product = item.productId;
      if (!product) return false;
      return item.quantity <= (product.reorderLevel || product.minStock || 0);
    });

    return {
      data: lowStockItems,
      total: lowStockItems.length,
    };
  }

  /**
   * Reserve quantity
   */
  async reserveQuantity(productId, warehouseId, quantity, userId, companyId) {
    const inventory = await inventoryRepository.findByProductAndWarehouse(
      productId,
      warehouseId
    );

    if (!inventory) {
      throw new NotFoundError('Inventory record');
    }

    if (inventory.availableQuantity < quantity) {
      throw new AppError('Insufficient available stock', 400);
    }

    return await inventoryRepository.reserveQuantity(productId, warehouseId, quantity);
  }

  /**
   * Release reserved quantity
   */
  async releaseReservedQuantity(productId, warehouseId, quantity, userId, companyId) {
    const inventory = await inventoryRepository.findByProductAndWarehouse(
      productId,
      warehouseId
    );

    if (!inventory) {
      throw new NotFoundError('Inventory record');
    }

    if (inventory.reservedQuantity < quantity) {
      throw new AppError('Cannot release more than reserved quantity', 400);
    }

    return await inventoryRepository.releaseReservedQuantity(productId, warehouseId, quantity);
  }
}

module.exports = new InventoryService();

