const BaseService = require('./baseService');
const productRepository = require('../repositories/productRepository');
const NotFoundError = require('../exceptions/NotFoundError');
const AppError = require('../exceptions/AppError');
const { generateSKU } = require('../utils/generators');

class ProductService extends BaseService {
  constructor() {
    super(productRepository);
  }

  /**
   * Create product with auto SKU generation
   */
  async create(productData, userId, companyId) {
    // Auto-generate SKU if not provided
    if (!productData.sku) {
      let sku;
      let exists = true;
      let attempts = 0;
      
      // Try to generate unique SKU
      while (exists && attempts < 10) {
        sku = generateSKU('PRD', 8);
        exists = await productRepository.findBySku(sku, companyId);
        attempts++;
      }
      
      if (exists) {
        throw new AppError('Unable to generate unique SKU. Please provide one manually.', 400);
      }
      
      productData.sku = sku;
    } else {
      // Check if SKU already exists
      const existing = await productRepository.findBySku(productData.sku, companyId);
      if (existing) {
        throw new AppError('SKU already exists', 400);
      }
    }

    // Check if barcode exists
    if (productData.barcode) {
      const existing = await productRepository.findByBarcode(productData.barcode, companyId);
      if (existing) {
        throw new AppError('Barcode already exists', 400);
      }
    }

    // Add company and user info
    productData.companyId = companyId;
    productData.createdBy = userId;

    return await productRepository.create(productData);
  }

  /**
   * Update product
   */
  async update(id, productData, userId, companyId) {
    const product = await productRepository.findById(id);
    
    if (!product) {
      throw new NotFoundError('Product');
    }

    // Check company access
    if (product.companyId.toString() !== companyId.toString()) {
      throw new AppError('Not authorized to update this product', 403);
    }

    // Check SKU uniqueness if being updated
    if (productData.sku && productData.sku !== product.sku) {
      const existing = await productRepository.findBySku(productData.sku, companyId);
      if (existing) {
        throw new AppError('SKU already exists', 400);
      }
    }

    // Check barcode uniqueness if being updated
    if (productData.barcode && productData.barcode !== product.barcode) {
      const existing = await productRepository.findByBarcode(productData.barcode, companyId);
      if (existing) {
        throw new AppError('Barcode already exists', 400);
      }
    }

    productData.updatedBy = userId;
    return await productRepository.updateById(id, productData);
  }

  /**
   * Get product by ID with populated fields
   */
  async getById(id, companyId) {
    const product = await productRepository.findById(id, [
      { path: 'categoryId', select: 'name' },
      { path: 'brandId', select: 'name' },
      { path: 'unitId', select: 'name shortName' },
    ]);

    if (!product) {
      throw new NotFoundError('Product');
    }

    // Check company access
    if (product.companyId.toString() !== companyId.toString()) {
      throw new AppError('Not authorized to access this product', 403);
    }

    return product;
  }

  /**
   * Get all products with filters
   */
  async getAll(queryParams, companyId) {
    const query = { companyId };

    // Filter by category
    if (queryParams.categoryId) {
      query.categoryId = queryParams.categoryId;
    }

    // Filter by brand
    if (queryParams.brandId) {
      query.brandId = queryParams.brandId;
    }

    // Filter by status
    if (queryParams.status) {
      query.status = queryParams.status;
    }

    // Filter by active status
    if (queryParams.isActive !== undefined) {
      query.isActive = queryParams.isActive === 'true';
    }

    // Search by name, SKU, or description
    if (queryParams.search) {
      query.$or = [
        { name: { $regex: queryParams.search, $options: 'i' } },
        { sku: { $regex: queryParams.search, $options: 'i' } },
        { description: { $regex: queryParams.search, $options: 'i' } },
      ];
    }

    const options = {
      populate: [
        { path: 'categoryId', select: 'name' },
        { path: 'brandId', select: 'name' },
        { path: 'unitId', select: 'name shortName' },
      ],
      sort: queryParams.sort || { createdAt: -1 },
    };

    return await productRepository.findAll(query, options);
  }

  /**
   * Search products
   */
  async search(searchTerm, companyId, options = {}) {
    return await productRepository.search(searchTerm, companyId, {
      populate: [
        { path: 'categoryId', select: 'name' },
        { path: 'brandId', select: 'name' },
        { path: 'unitId', select: 'name shortName' },
      ],
      ...options,
    });
  }

  /**
   * Get products by category
   */
  async getByCategory(categoryId, companyId, options = {}) {
    return await productRepository.findByCategory(categoryId, companyId, {
      populate: [
        { path: 'categoryId', select: 'name' },
        { path: 'brandId', select: 'name' },
        { path: 'unitId', select: 'name shortName' },
      ],
      ...options,
    });
  }

  /**
   * Get low stock products
   */
  async getLowStock(companyId, options = {}) {
    return await productRepository.findLowStock(companyId, {
      populate: [
        { path: 'categoryId', select: 'name' },
        { path: 'brandId', select: 'name' },
        { path: 'unitId', select: 'name shortName' },
      ],
      ...options,
    });
  }

  /**
   * Delete product (soft delete)
   */
  async delete(id, userId, companyId) {
    const product = await productRepository.findById(id);
    
    if (!product) {
      throw new NotFoundError('Product');
    }

    // Check company access
    if (product.companyId.toString() !== companyId.toString()) {
      throw new AppError('Not authorized to delete this product', 403);
    }

    // Soft delete
    return await productRepository.updateById(id, {
      isActive: false,
      status: 'inactive',
      updatedBy: userId,
    });
  }
}

module.exports = new ProductService();

