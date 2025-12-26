const asyncHandler = require('express-async-handler');
const inventoryService = require('../services/inventoryService');
const stockMovementRepository = require('../repositories/stockMovementRepository');
const { paginate, formatPaginationResponse } = require('../utils/helpers');

class InventoryController {
  /**
   * Get inventory by product
   */
  getByProduct = asyncHandler(async (req, res, next) => {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const productId = req.params.productId;

    const { data, total } = await inventoryService.getByProduct(
      productId,
      req.user.companyId,
      { skip, limit }
    );

    res.status(200).json({
      success: true,
      ...formatPaginationResponse(data, total, page, limit),
    });
  });

  /**
   * Get inventory by warehouse
   */
  getByWarehouse = asyncHandler(async (req, res, next) => {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const warehouseId = req.params.warehouseId;

    const { data, total } = await inventoryService.getByWarehouse(
      warehouseId,
      req.user.companyId,
      { skip, limit }
    );

    res.status(200).json({
      success: true,
      ...formatPaginationResponse(data, total, page, limit),
    });
  });

  /**
   * Get low stock items
   */
  getLowStock = asyncHandler(async (req, res, next) => {
    const warehouseId = req.query.warehouseId || null;

    const { data, total } = await inventoryService.getLowStock(
      req.user.companyId,
      warehouseId
    );

    res.status(200).json({
      success: true,
      data,
      total,
    });
  });

  /**
   * Add stock
   */
  addStock = asyncHandler(async (req, res, next) => {
    const { productId, warehouseId, quantity, cost } = req.body;

    const inventory = await inventoryService.addStock(
      productId,
      warehouseId,
      quantity,
      cost,
      req.user._id,
      req.user.companyId,
      {
        referenceType: req.body.referenceType,
        referenceId: req.body.referenceId,
        notes: req.body.notes,
      }
    );

    res.status(200).json({
      success: true,
      data: inventory,
      message: 'Stock added successfully',
    });
  });

  /**
   * Remove stock
   */
  removeStock = asyncHandler(async (req, res, next) => {
    const { productId, warehouseId, quantity } = req.body;

    const inventory = await inventoryService.removeStock(
      productId,
      warehouseId,
      quantity,
      req.user._id,
      req.user.companyId,
      {
        referenceType: req.body.referenceType,
        referenceId: req.body.referenceId,
        notes: req.body.notes,
      }
    );

    res.status(200).json({
      success: true,
      data: inventory,
      message: 'Stock removed successfully',
    });
  });

  /**
   * Adjust stock
   */
  adjustStock = asyncHandler(async (req, res, next) => {
    const { productId, warehouseId, newQuantity } = req.body;

    const inventory = await inventoryService.adjustStock(
      productId,
      warehouseId,
      newQuantity,
      req.user._id,
      req.user.companyId,
      {
        notes: req.body.notes,
      }
    );

    res.status(200).json({
      success: true,
      data: inventory,
      message: 'Stock adjusted successfully',
    });
  });

  /**
   * Transfer stock
   */
  transferStock = asyncHandler(async (req, res, next) => {
    const { productId, fromWarehouseId, toWarehouseId, quantity } = req.body;

    const result = await inventoryService.transferStock(
      productId,
      fromWarehouseId,
      toWarehouseId,
      quantity,
      req.user._id,
      req.user.companyId,
      {
        notes: req.body.notes,
      }
    );

    res.status(200).json({
      success: true,
      data: result,
      message: 'Stock transferred successfully',
    });
  });

  /**
   * Reserve quantity
   */
  reserveQuantity = asyncHandler(async (req, res, next) => {
    const { productId, warehouseId, quantity } = req.body;

    const inventory = await inventoryService.reserveQuantity(
      productId,
      warehouseId,
      quantity,
      req.user._id,
      req.user.companyId
    );

    res.status(200).json({
      success: true,
      data: inventory,
      message: 'Quantity reserved successfully',
    });
  });

  /**
   * Release reserved quantity
   */
  releaseReservedQuantity = asyncHandler(async (req, res, next) => {
    const { productId, warehouseId, quantity } = req.body;

    const inventory = await inventoryService.releaseReservedQuantity(
      productId,
      warehouseId,
      quantity,
      req.user._id,
      req.user.companyId
    );

    res.status(200).json({
      success: true,
      data: inventory,
      message: 'Reserved quantity released successfully',
    });
  });

  /**
   * Get stock movements
   */
  getMovements = asyncHandler(async (req, res, next) => {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const productId = req.query.productId;
    const warehouseId = req.query.warehouseId;

    let result;

    if (productId) {
      result = await stockMovementRepository.findByProduct(
        productId,
        req.user.companyId,
        { skip, limit }
      );
    } else if (warehouseId) {
      result = await stockMovementRepository.findByWarehouse(
        warehouseId,
        req.user.companyId,
        { skip, limit }
      );
    } else {
      return res.status(400).json({
        success: false,
        error: 'Either productId or warehouseId is required',
      });
    }

    res.status(200).json({
      success: true,
      ...formatPaginationResponse(result.data, result.total, page, limit),
    });
  });
}

module.exports = new InventoryController();

