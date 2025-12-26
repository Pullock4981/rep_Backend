const BaseRepository = require('./baseRepository');
const StockMovement = require('../models/StockMovement');

class StockMovementRepository extends BaseRepository {
  constructor() {
    super(StockMovement);
  }

  /**
   * Get movements by product
   */
  async findByProduct(productId, companyId, options = {}) {
    const query = { productId, companyId };

    return await this.findAll(query, {
      populate: [
        { path: 'warehouseId', select: 'name code' },
        { path: 'toWarehouseId', select: 'name code' },
        { path: 'createdBy', select: 'name email' },
      ],
      sort: { createdAt: -1 },
      ...options,
    });
  }

  /**
   * Get movements by warehouse
   */
  async findByWarehouse(warehouseId, companyId, options = {}) {
    const query = {
      companyId,
      $or: [{ warehouseId }, { toWarehouseId: warehouseId }],
    };

    return await this.findAll(query, {
      populate: [
        { path: 'productId', select: 'name sku' },
        { path: 'warehouseId', select: 'name code' },
        { path: 'toWarehouseId', select: 'name code' },
        { path: 'createdBy', select: 'name email' },
      ],
      sort: { createdAt: -1 },
      ...options,
    });
  }

  /**
   * Get movements by reference
   */
  async findByReference(referenceType, referenceId, companyId) {
    return await this.model.find({
      referenceType,
      referenceId,
      companyId,
    }).populate([
      { path: 'productId', select: 'name sku' },
      { path: 'warehouseId', select: 'name code' },
    ]);
  }
}

module.exports = new StockMovementRepository();

