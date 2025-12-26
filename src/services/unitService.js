const BaseService = require('./baseService');
const unitRepository = require('../repositories/unitRepository');
const NotFoundError = require('../exceptions/NotFoundError');
const AppError = require('../exceptions/AppError');

class UnitService extends BaseService {
  constructor() {
    super(unitRepository);
  }

  /**
   * Create unit
   */
  async create(unitData, userId, companyId) {
    // Check if name already exists
    const existing = await unitRepository.findOne({
      name: unitData.name,
      companyId,
    });

    if (existing) {
      throw new AppError('Unit name already exists', 400);
    }

    // Check if shortName already exists
    const existingShort = await unitRepository.findOne({
      shortName: unitData.shortName.toUpperCase(),
      companyId,
    });

    if (existingShort) {
      throw new AppError('Unit short name already exists', 400);
    }

    unitData.shortName = unitData.shortName.toUpperCase();
    unitData.companyId = companyId;
    unitData.createdBy = userId;

    return await unitRepository.create(unitData);
  }

  /**
   * Get unit by ID
   */
  async getById(id, companyId) {
    const unit = await unitRepository.findById(id);

    if (!unit) {
      throw new NotFoundError('Unit');
    }

    if (unit.companyId.toString() !== companyId.toString()) {
      throw new AppError('Not authorized to access this unit', 403);
    }

    return unit;
  }

  /**
   * Update unit
   */
  async update(id, unitData, userId, companyId) {
    const unit = await unitRepository.findById(id);
    
    if (!unit) {
      throw new NotFoundError('Unit');
    }

    if (unit.companyId.toString() !== companyId.toString()) {
      throw new AppError('Not authorized to update this unit', 403);
    }

    // Check name uniqueness if being updated
    if (unitData.name && unitData.name !== unit.name) {
      const existing = await unitRepository.findOne({
        name: unitData.name,
        companyId,
        _id: { $ne: id },
      });

      if (existing) {
        throw new AppError('Unit name already exists', 400);
      }
    }

    // Check shortName uniqueness if being updated
    if (unitData.shortName) {
      unitData.shortName = unitData.shortName.toUpperCase();
      if (unitData.shortName !== unit.shortName) {
        const existing = await unitRepository.findOne({
          shortName: unitData.shortName,
          companyId,
          _id: { $ne: id },
        });

        if (existing) {
          throw new AppError('Unit short name already exists', 400);
        }
      }
    }

    return await unitRepository.updateById(id, unitData);
  }
}

module.exports = new UnitService();

