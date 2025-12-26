const BaseService = require('./baseService');
const categoryRepository = require('../repositories/categoryRepository');
const NotFoundError = require('../exceptions/NotFoundError');
const AppError = require('../exceptions/AppError');

class CategoryService extends BaseService {
  constructor() {
    super(categoryRepository);
  }

  /**
   * Create category
   */
  async create(categoryData, userId, companyId) {
    // Check if name already exists
    const existing = await categoryRepository.findOne({
      name: categoryData.name,
      companyId,
    });

    if (existing) {
      throw new AppError('Category name already exists', 400);
    }

    categoryData.companyId = companyId;
    categoryData.createdBy = userId;

    return await categoryRepository.create(categoryData);
  }

  /**
   * Update category
   */
  async update(id, categoryData, userId, companyId) {
    const category = await categoryRepository.findById(id);
    
    if (!category) {
      throw new NotFoundError('Category');
    }

    if (category.companyId.toString() !== companyId.toString()) {
      throw new AppError('Not authorized to update this category', 403);
    }

    // Check name uniqueness if being updated
    if (categoryData.name && categoryData.name !== category.name) {
      const existing = await categoryRepository.findOne({
        name: categoryData.name,
        companyId,
        _id: { $ne: id },
      });

      if (existing) {
        throw new AppError('Category name already exists', 400);
      }
    }

    return await categoryRepository.updateById(id, categoryData);
  }

  /**
   * Get category by ID
   */
  async getById(id, companyId) {
    const category = await categoryRepository.findById(id);

    if (!category) {
      throw new NotFoundError('Category');
    }

    if (category.companyId.toString() !== companyId.toString()) {
      throw new AppError('Not authorized to access this category', 403);
    }

    return category;
  }

  /**
   * Get all categories with subcategories
   */
  async getAllWithSubcategories(companyId, options = {}) {
    const query = { companyId };
    
    if (options.isActive !== undefined) {
      query.isActive = options.isActive === 'true';
    }

    return await categoryRepository.findAllWithSubcategories(query, {
      sort: { name: 1 },
      ...options,
    });
  }

  /**
   * Get parent categories only
   */
  async getParentCategories(companyId, options = {}) {
    return await categoryRepository.findParentCategories(companyId, {
      sort: { name: 1 },
      ...options,
    });
  }
}

module.exports = new CategoryService();

