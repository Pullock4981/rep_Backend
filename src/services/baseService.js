/**
 * Base Service with common business logic
 */
class BaseService {
  constructor(repository) {
    this.repository = repository;
  }

  /**
   * Create a new record
   */
  async create(data) {
    return await this.repository.create(data);
  }

  /**
   * Get record by ID
   */
  async getById(id, populate = []) {
    const record = await this.repository.findById(id, populate);
    if (!record) {
      const NotFoundError = require('../exceptions/NotFoundError');
      throw new NotFoundError('Record');
    }
    return record;
  }

  /**
   * Get all records with pagination
   */
  async getAll(query = {}, options = {}) {
    return await this.repository.findAll(query, options);
  }

  /**
   * Update record by ID
   */
  async updateById(id, data) {
    const record = await this.repository.updateById(id, data);
    if (!record) {
      const NotFoundError = require('../exceptions/NotFoundError');
      throw new NotFoundError('Record');
    }
    return record;
  }

  /**
   * Delete record by ID
   */
  async deleteById(id) {
    const record = await this.repository.deleteById(id);
    if (!record) {
      const NotFoundError = require('../exceptions/NotFoundError');
      throw new NotFoundError('Record');
    }
    return record;
  }
}

module.exports = BaseService;

