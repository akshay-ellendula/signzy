const mongoose = require('mongoose');
const Vendor = require('../models/Vendor');
const { computeAvailability } = require('../utils/computeAvailability');

// GET /health
// Must be able to respond even when MongoDB is unreachable - that's the one
// scenario this endpoint exists to report - so the DB status is checked
// first and the vendor query is only attempted if the connection is actually up.
const getHealth = async (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;

  let vendorHealth = [];
  if (databaseConnected) {
    try {
      const vendors = await Vendor.find().select('name isActive healthStatus currentLatency metrics');
      vendorHealth = vendors.map((vendor) => ({
        name: vendor.name,
        isActive: vendor.isActive,
        healthStatus: vendor.healthStatus,
        currentLatency: vendor.currentLatency,
        successRate: vendor.metrics.successRate,
        availabilityPercentage: computeAvailability(vendor),
      }));
    } catch (err) {
      // Connection reported "up" but the query still failed (e.g. mid-drop) -
      // still respond with what we know rather than 500ing.
      return res.status(200).json({
        success: true,
        server: 'ok',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
        vendors: [],
      });
    }
  }

  res.status(200).json({
    success: true,
    server: 'ok',
    database: databaseConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    vendors: vendorHealth,
  });
};

module.exports = { getHealth };
