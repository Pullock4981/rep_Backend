const BaseRepository = require('./baseRepository');
const Inventory = require('../models/Inventory');

class InventoryRepository extends BaseRepository {
  constructor() {
    super(Inventory);
  }

  /**
   * Find inventory by product and warehouse
   */
  async findByProductAndWarehouse(productId, warehouseId) {
    return await this.model.findOne({ productId, warehouseId });
  }

  /**
   * Find all inventory for a product across all warehouses
   */
  async findByProduct(productId, companyId, options = {}) {
    const query = { productId, companyId };

    return await this.findAll(query, {
      populate: [{ path: 'warehouseId', select: 'name code' }],
      ...options,
    });
  }

  /**
   * Find all inventory for a warehouse
   */
  async findByWarehouse(warehouseId, companyId, options = {}) {
    const query = { warehouseId, companyId };

    return await this.findAll(query, {
      populate: [
        { path: 'productId', select: 'name sku sellingPrice' },
      ],
      ...options,
    });
  }

  /**
   * Find low stock items
   */
  async findLowStock(companyId, warehouseId = null, options = {}) {
    const query = { companyId };

    if (warehouseId) {
      query.warehouseId = warehouseId;
    }

    // This will need to join with Product model to check reorderLevel
    // For now, we'll filter in service layer
    return await this.findAll(query, {
      populate: [
        { path: 'productId', select: 'name sku reorderLevel minStock' },
        { path: 'warehouseId', select: 'name code' },
      ],
      ...options,
    });
  }

  /**
   * Update quantity
   */
  async updateQuantity(productId, warehouseId, quantity, cost = null) {
    const inventory = await this.findByProductAndWarehouse(productId, warehouseId);

    if (!inventory) {
      return null;
    }

    const updateData = { quantity };

    if (cost !== null && cost > 0) {
      // Calculate new average cost
      const totalValue = inventory.quantity * inventory.averageCost;
      const newValue = quantity * cost;
      const newTotalQuantity = inventory.quantity + quantity;

      if (newTotalQuantity > 0) {
        updateData.averageCost = (totalValue + newValue) / newTotalQuantity;
      }
      updateData.lastCost = cost;
    }

    return await this.model.findOneAndUpdate(
      { productId, warehouseId },
      updateData,
      { new: true, runValidators: true }
    );
  }

  /**
   * Reserve quantity
   */
  async reserveQuantity(productId, warehouseId, quantity) {
    return await this.model.findOneAndUpdate(
      { productId, warehouseId },
      { $inc: { reservedQuantity: quantity } },
      { new: true, runValidators: true }
    );
  }

  /**
   * Release reserved quantity
   */
  async releaseReservedQuantity(productId, warehouseId, quantity) {
    return await this.model.findOneAndUpdate(
      { productId, warehouseId },
      { $inc: { reservedQuantity: -quantity } },
      { new: true, runValidators: true }
    );
  }
}

module.exports = new InventoryRepository();

