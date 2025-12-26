const asyncHandler = require('express-async-handler');
const BaseController = require('./baseController');
const unitService = require('../services/unitService');

class UnitController extends BaseController {
  constructor() {
    super(unitService);
  }

  /**
   * Create unit
   */
  create = asyncHandler(async (req, res, next) => {
    const unit = await unitService.create(
      req.body,
      req.user._id,
      req.user.companyId
    );
    
    res.status(201).json({
      success: true,
      data: unit,
    });
  });

  /**
   * Get unit by ID
   */
  getById = asyncHandler(async (req, res, next) => {
    const unit = await unitService.getById(req.params.id, req.user.companyId);
    
    res.status(200).json({
      success: true,
      data: unit,
    });
  });

  /**
   * Update unit
   */
  update = asyncHandler(async (req, res, next) => {
    const unit = await unitService.update(
      req.params.id,
      req.body,
      req.user._id,
      req.user.companyId
    );
    
    res.status(200).json({
      success: true,
      data: unit,
    });
  });
}

module.exports = new UnitController();

