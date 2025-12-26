const BaseService = require('./baseService');
const warehouseRepository = require('../repositories/warehouseRepository');
const NotFoundError = require('../exceptions/NotFoundError');
const AppError = require('../exceptions/AppError');

class WarehouseService extends BaseService {
  constructor() {
    super(warehouseRepository);
  }

  /**
   * Create warehouse
   */
  async create(warehouseData, userId, companyId) {
    // Check if name already exists
    const existing = await warehouseRepository.findOne({
      name: warehouseData.name,
      companyId,
    });

    if (existing) {
      throw new AppError('Warehouse name already exists', 400);
    }

    // Check if code already exists (if provided)
    if (warehouseData.code) {
      const existingCode = await warehouseRepository.findByCode(
        warehouseData.code,
        companyId
      );
      if (existingCode) {
        throw new AppError('Warehouse code already exists', 400);
      }
      warehouseData.code = warehouseData.code.toUpperCase();
    }

    // If this is set as main warehouse, unset other main warehouses
    if (warehouseData.isMain) {
      await warehouseRepository.model.updateMany(
        { companyId, isMain: true },
        { isMain: false }
      );
    }

    warehouseData.companyId = companyId;
    warehouseData.createdBy = userId;

    return await warehouseRepository.create(warehouseData);
  }

  /**
   * Update warehouse
   */
  async update(id, warehouseData, userId, companyId) {
    const warehouse = await warehouseRepository.findById(id);

    if (!warehouse) {
      throw new NotFoundError('Warehouse');
    }

    if (warehouse.companyId.toString() !== companyId.toString()) {
      throw new AppError('Not authorized to update this warehouse', 403);
    }

    // Check name uniqueness if being updated
    if (warehouseData.name && warehouseData.name !== warehouse.name) {
      const existing = await warehouseRepository.findOne({
        name: warehouseData.name,
        companyId,
        _id: { $ne: id },
      });

      if (existing) {
        throw new AppError('Warehouse name already exists', 400);
      }
    }

    // Check code uniqueness if being updated
    if (warehouseData.code && warehouseData.code !== warehouse.code) {
      const existing = await warehouseRepository.findByCode(
        warehouseData.code,
        companyId
      );
      if (existing) {
        throw new AppError('Warehouse code already exists', 400);
      }
      warehouseData.code = warehouseData.code.toUpperCase();
    }

    // If setting as main warehouse, unset others
    if (warehouseData.isMain && !warehouse.isMain) {
      await warehouseRepository.model.updateMany(
        { companyId, isMain: true, _id: { $ne: id } },
        { isMain: false }
      );
    }

    return await warehouseRepository.updateById(id, warehouseData);
  }

  /**
   * Get warehouse by ID
   */
  async getById(id, companyId) {
    const warehouse = await warehouseRepository.findById(id);

    if (!warehouse) {
      throw new NotFoundError('Warehouse');
    }

    if (warehouse.companyId.toString() !== companyId.toString()) {
      throw new AppError('Not authorized to access this warehouse', 403);
    }

    return warehouse;
  }

  /**
   * Get main warehouse
   */
  async getMainWarehouse(companyId) {
    const warehouse = await warehouseRepository.findMainWarehouse(companyId);
    if (!warehouse) {
      throw new NotFoundError('Main warehouse');
    }
    return warehouse;
  }

  /**
   * Get all active warehouses
   */
  async getActiveWarehouses(companyId, options = {}) {
    return await warehouseRepository.findActiveWarehouses(companyId, options);
  }
}

module.exports = new WarehouseService();

