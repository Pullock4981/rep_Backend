const asyncHandler = require('express-async-handler');
const BaseController = require('./baseController');
const productService = require('../services/productService');
const { paginate, formatPaginationResponse } = require('../utils/helpers');

class ProductController extends BaseController {
  constructor() {
    super(productService);
  }

  /**
   * Get all products
   */
  getAll = asyncHandler(async (req, res, next) => {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    
    const { data, total } = await productService.getAll(
      req.query,
      req.user.companyId,
      {
        skip,
        limit,
      }
    );

    res.status(200).json({
      success: true,
      ...formatPaginationResponse(data, total, page, limit),
    });
  });

  /**
   * Get product by ID
   */
  getById = asyncHandler(async (req, res, next) => {
    const product = await productService.getById(req.params.id, req.user.companyId);
    
    res.status(200).json({
      success: true,
      data: product,
    });
  });

  /**
   * Create product
   */
  create = asyncHandler(async (req, res, next) => {
    const product = await productService.create(
      req.body,
      req.user._id,
      req.user.companyId
    );
    
    res.status(201).json({
      success: true,
      data: product,
    });
  });

  /**
   * Update product
   */
  update = asyncHandler(async (req, res, next) => {
    const product = await productService.update(
      req.params.id,
      req.body,
      req.user._id,
      req.user.companyId
    );
    
    res.status(200).json({
      success: true,
      data: product,
    });
  });

  /**
   * Delete product
   */
  delete = asyncHandler(async (req, res, next) => {
    await productService.delete(
      req.params.id,
      req.user._id,
      req.user.companyId
    );
    
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  });

  /**
   * Search products
   */
  search = asyncHandler(async (req, res, next) => {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const searchTerm = req.query.q || req.query.search;

    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        error: 'Search term is required',
      });
    }

    const { data, total } = await productService.search(
      searchTerm,
      req.user.companyId,
      { skip, limit }
    );

    res.status(200).json({
      success: true,
      ...formatPaginationResponse(data, total, page, limit),
    });
  });

  /**
   * Get products by category
   */
  getByCategory = asyncHandler(async (req, res, next) => {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const categoryId = req.params.categoryId;

    const { data, total } = await productService.getByCategory(
      categoryId,
      req.user.companyId,
      { skip, limit }
    );

    res.status(200).json({
      success: true,
      ...formatPaginationResponse(data, total, page, limit),
    });
  });

  /**
   * Get low stock products
   */
  getLowStock = asyncHandler(async (req, res, next) => {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);

    const { data, total } = await productService.getLowStock(
      req.user.companyId,
      { skip, limit }
    );

    res.status(200).json({
      success: true,
      ...formatPaginationResponse(data, total, page, limit),
    });
  });
}

module.exports = new ProductController();

