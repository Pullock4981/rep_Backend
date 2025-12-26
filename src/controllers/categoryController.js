const asyncHandler = require('express-async-handler');
const BaseController = require('./baseController');
const categoryService = require('../services/categoryService');
const { paginate, formatPaginationResponse } = require('../utils/helpers');

class CategoryController extends BaseController {
  constructor() {
    super(categoryService);
  }

  /**
   * Get all categories
   */
  getAll = asyncHandler(async (req, res, next) => {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    
    const { data, total } = await categoryService.getAllWithSubcategories(
      req.user.companyId,
      { ...req.query, skip, limit }
    );

    res.status(200).json({
      success: true,
      ...formatPaginationResponse(data, total, page, limit),
    });
  });

  /**
   * Get category by ID
   */
  getById = asyncHandler(async (req, res, next) => {
    const category = await categoryService.getById(req.params.id, req.user.companyId);
    
    res.status(200).json({
      success: true,
      data: category,
    });
  });

  /**
   * Get parent categories only
   */
  getParentCategories = asyncHandler(async (req, res, next) => {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    
    const { data, total } = await categoryService.getParentCategories(
      req.user.companyId,
      { skip, limit }
    );

    res.status(200).json({
      success: true,
      ...formatPaginationResponse(data, total, page, limit),
    });
  });

  /**
   * Create category
   */
  create = asyncHandler(async (req, res, next) => {
    const category = await categoryService.create(
      req.body,
      req.user._id,
      req.user.companyId
    );
    
    res.status(201).json({
      success: true,
      data: category,
    });
  });

  /**
   * Update category
   */
  update = asyncHandler(async (req, res, next) => {
    const category = await categoryService.update(
      req.params.id,
      req.body,
      req.user._id,
      req.user.companyId
    );
    
    res.status(200).json({
      success: true,
      data: category,
    });
  });

  /**
   * Delete category
   */
  delete = asyncHandler(async (req, res, next) => {
    await categoryService.deleteById(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  });
}

module.exports = new CategoryController();

