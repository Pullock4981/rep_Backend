const BaseService = require('./baseService');
const brandRepository = require('../repositories/brandRepository');
const NotFoundError = require('../exceptions/NotFoundError');
const AppError = require('../exceptions/AppError');

class BrandService extends BaseService {
  constructor() {
    super(brandRepository);
  }

  /**
   * Create brand
   */
  async create(brandData, userId, companyId) {
    // Check if name already exists
    const existing = await brandRepository.findOne({
      name: brandData.name,
      companyId,
    });

    if (existing) {
      throw new AppError('Brand name already exists', 400);
    }

    brandData.companyId = companyId;
    brandData.createdBy = userId;

    return await brandRepository.create(brandData);
  }

  /**
   * Get brand by ID
   */
  async getById(id, companyId) {
    const brand = await brandRepository.findById(id);

    if (!brand) {
      throw new NotFoundError('Brand');
    }

    if (brand.companyId.toString() !== companyId.toString()) {
      throw new AppError('Not authorized to access this brand', 403);
    }

    return brand;
  }

  /**
   * Update brand
   */
  async update(id, brandData, userId, companyId) {
    const brand = await brandRepository.findById(id);
    
    if (!brand) {
      throw new NotFoundError('Brand');
    }

    if (brand.companyId.toString() !== companyId.toString()) {
      throw new AppError('Not authorized to update this brand', 403);
    }

    // Check name uniqueness if being updated
    if (brandData.name && brandData.name !== brand.name) {
      const existing = await brandRepository.findOne({
        name: brandData.name,
        companyId,
        _id: { $ne: id },
      });

      if (existing) {
        throw new AppError('Brand name already exists', 400);
      }
    }

    return await brandRepository.updateById(id, brandData);
  }
}

module.exports = new BrandService();

