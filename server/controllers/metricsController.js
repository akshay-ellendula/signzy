const Vendor = require('../models/Vendor');
const { serializeVendors } = require('../utils/serializeVendor');

// GET /vendor-metrics
const getVendorMetrics = async (req, res) => {
  const vendors = await Vendor.find().select('name healthStatus isActive currentLatency costPerRequest metrics');

  const summary = vendors.reduce(
    (acc, vendor) => {
      acc.totalVendors += 1;
      if (vendor.healthStatus === 'healthy' && vendor.isActive) acc.healthyVendors += 1;
      acc.totalRequests += vendor.metrics.totalRequests;
      acc.totalSuccessful += vendor.metrics.successfulRequests;
      acc.latencySum += vendor.metrics.averageLatency * vendor.metrics.totalRequests;
      acc.totalCost += (vendor.metrics.totalRequests || 0) * (vendor.costPerRequest || 0);
      return acc;
    },
    { totalVendors: 0, healthyVendors: 0, totalRequests: 0, totalSuccessful: 0, latencySum: 0, totalCost: 0 }
  );

  const overallSuccessRate =
    summary.totalRequests > 0 ? Number(((summary.totalSuccessful / summary.totalRequests) * 100).toFixed(2)) : 0;
  const overallAverageLatency =
    summary.totalRequests > 0 ? Math.round(summary.latencySum / summary.totalRequests) : 0;

  res.status(200).json({
    success: true,
    summary: {
      totalVendors: summary.totalVendors,
      healthyVendors: summary.healthyVendors,
      totalRequests: summary.totalRequests,
      successRate: overallSuccessRate,
      averageLatency: overallAverageLatency,
      totalCost: Number(summary.totalCost.toFixed(2)),
    },
    vendors: serializeVendors(vendors),
  });
};

module.exports = { getVendorMetrics };
