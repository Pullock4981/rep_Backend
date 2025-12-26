const asyncHandler = require('express-async-handler');
const BaseController = require('./baseController');
const brandService = require('../services/brandService');

class BrandController extends BaseController {
  constructor() {
    super(brandService);
  }

  /**
   * Create brand
   */
  create = asyncHandler(async (req, res, next) => {
    const brand = await brandService.create(
      req.body,
      req.user._id,
      req.user.companyId
    );
    
    res.status(201).json({
      success: true,
      data: brand,
    });
  });

  /**
   * Get brand by ID
   */
  getById = asyncHandler(async (req, res, next) => {
    const brand = await brandService.getById(req.params.id, req.user.companyId);
    
    res.status(200).json({
      success: true,
      data: brand,
    });
  });

  /**
   * Update brand
   */
  update = asyncHandler(async (req, res, next) => {
    const brand = await brandService.update(
      req.params.id,
      req.body,
      req.user._id,
      req.user.companyId
    );
    
    res.status(200).json({
      success: true,
      data: brand,
    });
  });
}

module.exports = new BrandController();

