const BaseRepository = require('./baseRepository');
const Warehouse = require('../models/Warehouse');

class WarehouseRepository extends BaseRepository {
  constructor() {
    super(Warehouse);
  }

  /**
   * Find warehouse by code
   */
  async findByCode(code, companyId) {
    return await this.model.findOne({ code: code.toUpperCase(), companyId });
  }

  /**
   * Find main warehouse
   */
  async findMainWarehouse(companyId) {
    return await this.model.findOne({ companyId, isMain: true, isActive: true });
  }

  /**
   * Get all active warehouses
   */
  async findActiveWarehouses(companyId, options = {}) {
    const query = {
      companyId,
      isActive: true,
    };

    return await this.findAll(query, {
      sort: { isMain: -1, name: 1 },
      ...options,
    });
  }
}

module.exports = new WarehouseRepository();

