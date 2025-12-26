const BaseRepository = require('./baseRepository');
const Category = require('../models/Category');

class CategoryRepository extends BaseRepository {
  constructor() {
    super(Category);
  }

  /**
   * Find categories with subcategories
   */
  async findAllWithSubcategories(query = {}, options = {}) {
    const {
      populate = ['subcategories'],
      select = '',
      sort = { name: 1 },
      skip = 0,
      limit = 100,
    } = options;

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
   * Find parent categories only
   */
  async findParentCategories(companyId, options = {}) {
    const query = {
      companyId,
      parentCategory: null,
      isActive: true,
    };

    return await this.findAll(query, options);
  }
}

module.exports = new CategoryRepository();

