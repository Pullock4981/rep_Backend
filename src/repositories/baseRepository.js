/**
 * Base Repository with common CRUD operations
 */
class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  /**
   * Create a new document
   */
  async create(data) {
    return await this.model.create(data);
  }

  /**
   * Find document by ID
   */
  async findById(id, populate = []) {
    let query = this.model.findById(id);
    
    if (populate.length > 0) {
      populate.forEach((pop) => {
        query = query.populate(pop);
      });
    }
    
    return await query;
  }

  /**
   * Find one document by query
   */
  async findOne(query, populate = []) {
    let dbQuery = this.model.findOne(query);
    
    if (populate.length > 0) {
      populate.forEach((pop) => {
        dbQuery = dbQuery.populate(pop);
      });
    }
    
    return await dbQuery;
  }

  /**
   * Find all documents
   */
  async findAll(query = {}, options = {}) {
    const {
      populate = [],
      select = '',
      sort = { createdAt: -1 },
      skip = 0,
      limit = 10,
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
   * Update document by ID
   */
  async updateById(id, data, options = { new: true, runValidators: true }) {
    return await this.model.findByIdAndUpdate(id, data, options);
  }

  /**
   * Update one document by query
   */
  async updateOne(query, data, options = { new: true, runValidators: true }) {
    return await this.model.findOneAndUpdate(query, data, options);
  }

  /**
   * Delete document by ID
   */
  async deleteById(id) {
    return await this.model.findByIdAndDelete(id);
  }

  /**
   * Delete one document by query
   */
  async deleteOne(query) {
    return await this.model.findOneAndDelete(query);
  }

  /**
   * Count documents
   */
  async count(query = {}) {
    return await this.model.countDocuments(query);
  }

  /**
   * Check if document exists
   */
  async exists(query) {
    return await this.model.exists(query);
  }
}

module.exports = BaseRepository;

