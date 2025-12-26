const BaseRepository = require('./baseRepository');
const Product = require('../models/Product');

class ProductRepository extends BaseRepository {
  constructor() {
    super(Product);
  }

  /**
   * Find product by SKU
   */
  async findBySku(sku, companyId) {
    return await this.model.findOne({ sku, companyId });
  }

  /**
   * Find product by barcode
   */
  async findByBarcode(barcode, companyId) {
    return await this.model.findOne({ barcode, companyId });
  }

  /**
   * Search products by text
   */
  async search(searchTerm, companyId, options = {}) {
    const {
      populate = [],
      select = '',
      sort = { createdAt: -1 },
      skip = 0,
      limit = 10,
    } = options;

    const query = {
      companyId,
      $text: { $search: searchTerm },
    };

    let dbQuery = this.model.find(query);

    if (populate.length > 0) {
      populate.forEach((pop) => {
        dbQuery = dbQuery.populate(pop);
      });
    }

    if (select) {
      dbQuery = dbQuery.select(select);
    }

    dbQuery = dbQuery.sort(sort).skip(skip).limit(limit);

    const [data, total] = await Promise.all([
      dbQuery,
      this.model.countDocuments(query),
    ]);

    return { data, total };
  }

  /**
   * Find products by category
   */
  async findByCategory(categoryId, companyId, options = {}) {
    const {
      populate = [],
      select = '',
      sort = { createdAt: -1 },
      skip = 0,
      limit = 10,
    } = options;

    const query = {
      categoryId,
      companyId,
      isActive: true,
    };

    let dbQuery = this.model.find(query);

    if (populate.length > 0) {
      populate.forEach((pop) => {
        dbQuery = dbQuery.populate(pop);
      });
    }

    if (select) {
      dbQuery = dbQuery.select(select);
    }

    dbQuery = dbQuery.sort(sort).skip(skip).limit(limit);

    const [data, total] = await Promise.all([
      dbQuery,
      this.model.countDocuments(query),
    ]);

    return { data, total };
  }

  /**
   * Find low stock products
   */
  async findLowStock(companyId, options = {}) {
    const {
      populate = [],
      select = '',
      sort = { reorderLevel: 1 },
      skip = 0,
      limit = 10,
    } = options;

    // This will need to join with Inventory model later
    // For now, return products with reorderLevel > 0
    const query = {
      companyId,
      isActive: true,
      reorderLevel: { $gt: 0 },
    };

    let dbQuery = this.model.find(query);

    if (populate.length > 0) {
      populate.forEach((pop) => {
        dbQuery = dbQuery.populate(pop);
      });
    }

    if (select) {
      dbQuery = dbQuery.select(select);
    }

    dbQuery = dbQuery.sort(sort).skip(skip).limit(limit);

    const [data, total] = await Promise.all([
      dbQuery,
      this.model.countDocuments(query),
    ]);

    return { data, total };
  }
}

module.exports = new ProductRepository();

