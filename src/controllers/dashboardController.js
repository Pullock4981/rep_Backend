const asyncHandler = require('express-async-handler');
const dashboardService = require('../services/dashboardService');

class DashboardController {
  /**
   * Get dashboard overview
   */
  getOverview = asyncHandler(async (req, res, next) => {
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    const overview = await dashboardService.getDashboardOverview(req.user.companyId, {
      startDate,
      endDate,
    });

    res.status(200).json({
      success: true,
      data: overview,
    });
  });

  /**
   * Get sales statistics
   */
  getSalesStats = asyncHandler(async (req, res, next) => {
    const startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : new Date(new Date().setDate(1));
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

    const stats = await dashboardService.getSalesStatistics(
      req.user.companyId,
      startDate,
      endDate
    );

    res.status(200).json({
      success: true,
      data: stats,
    });
  });

  /**
   * Get purchase statistics
   */
  getPurchaseStats = asyncHandler(async (req, res, next) => {
    const startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : new Date(new Date().setDate(1));
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

    const stats = await dashboardService.getPurchaseStatistics(
      req.user.companyId,
      startDate,
      endDate
    );

    res.status(200).json({
      success: true,
      data: stats,
    });
  });

  /**
   * Get sales chart data
   */
  getSalesChart = asyncHandler(async (req, res, next) => {
    const startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : new Date(new Date().setDate(1));
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    const groupBy = req.query.groupBy || 'day'; // day, week, month

    const chartData = await dashboardService.getSalesChartData(
      req.user.companyId,
      startDate,
      endDate,
      groupBy
    );

    res.status(200).json({
      success: true,
      data: chartData,
    });
  });

  /**
   * Get top selling products
   */
  getTopProducts = asyncHandler(async (req, res, next) => {
    const startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : new Date(new Date().setDate(1));
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    const limit = parseInt(req.query.limit) || 10;

    const products = await dashboardService.getTopSellingProducts(
      req.user.companyId,
      startDate,
      endDate,
      limit
    );

    res.status(200).json({
      success: true,
      data: products,
    });
  });

  /**
   * Get top customers
   */
  getTopCustomers = asyncHandler(async (req, res, next) => {
    const startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : new Date(new Date().setDate(1));
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    const limit = parseInt(req.query.limit) || 10;

    const customers = await dashboardService.getTopCustomers(
      req.user.companyId,
      startDate,
      endDate,
      limit
    );

    res.status(200).json({
      success: true,
      data: customers,
    });
  });
}

module.exports = new DashboardController();

