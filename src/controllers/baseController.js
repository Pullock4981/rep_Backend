const asyncHandler = require('express-async-handler');
const { paginate, formatPaginationResponse } = require('../utils/helpers');

/**
 * Base Controller with common CRUD operations
 */
class BaseController {
  constructor(service) {
    this.service = service;
  }

  /**
   * Get all records
   */
  getAll = asyncHandler(async (req, res, next) => {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    
    const query = this.buildQuery(req.query);
    const options = {
      ...this.buildOptions(req.query),
      skip,
      limit,
    };

    const { data, total } = await this.service.getAll(query, options);
    
    res.status(200).json({
      success: true,
      ...formatPaginationResponse(data, total, page, limit),
    });
  });

  /**
   * Get record by ID
   */
  getById = asyncHandler(async (req, res, next) => {
    const record = await this.service.getById(req.params.id, this.getPopulate());
    
    res.status(200).json({
      success: true,
      data: record,
    });
  });

  /**
   * Create new record
   */
  create = asyncHandler(async (req, res, next) => {
    const data = this.prepareCreateData(req.body, req.user);
    const record = await this.service.create(data);
    
    res.status(201).json({
      success: true,
      data: record,
    });
  });

  /**
   * Update record
   */
  update = asyncHandler(async (req, res, next) => {
    const data = this.prepareUpdateData(req.body, req.user);
    const record = await this.service.updateById(req.params.id, data);
    
    res.status(200).json({
      success: true,
      data: record,
    });
  });

  /**
   * Delete record
   */
  delete = asyncHandler(async (req, res, next) => {
    await this.service.deleteById(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Record deleted successfully',
    });
  });

  // Override these methods in child classes
  buildQuery(query) {
    return {};
  }

  buildOptions(query) {
    return {
      sort: { createdAt: -1 },
    };
  }

  getPopulate() {
    return [];
  }

  prepareCreateData(body, user) {
    return body;
  }

  prepareUpdateData(body, user) {
    return body;
  }
}

module.exports = BaseController;

