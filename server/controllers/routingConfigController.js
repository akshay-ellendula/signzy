const RoutingConfig = require('../models/RoutingConfig');
const Vendor = require('../models/Vendor');
const ApiError = require('../utils/ApiError');
const { invalidateVendorCache } = require('../utils/vendorCache');

// POST /routing-configs
// Persists a generated config and applies it to matching real vendors - this
// is what actually closes the loop between the AI Rule Generator's output
// and real routing behavior. Two cases:
//   - weights present (e.g. "Vendor A for 70%...") -> sets vendor.weight
//   - no weights, but a vendor order was found (e.g. "use A as primary,
//     retry with B, then C") -> sets vendor.priority from that order instead,
//     so a priority/failover strategy actually respects the described order
const applyWeights = async (weights) => {
  const applied = [];
  for (const entry of weights) {
    const vendor = await Vendor.findOne({ name: entry.vendor });
    if (vendor) {
      vendor.weight = entry.percentage;
      await vendor.save();
      applied.push(vendor.name);
    }
  }
  return applied;
};

const applyVendorOrderAsPriority = async (vendorOrder) => {
  const applied = [];
  const total = vendorOrder.length;
  for (let i = 0; i < total; i += 1) {
    const vendor = await Vendor.findOne({ name: vendorOrder[i] });
    if (vendor) {
      vendor.priority = total - i; // first in the described order = highest priority
      await vendor.save();
      applied.push(vendor.name);
    }
  }
  return applied;
};

const createRoutingConfig = async (req, res) => {
  const { sourceText, strategy, vendorOrder, weights, conditions, capability, isActive } = req.body;

  if (!sourceText || !strategy) {
    throw new ApiError(400, '"sourceText" and "strategy" are required');
  }

  let appliedToVendors = [];
  let appliedAs = null;

  if (Array.isArray(weights) && weights.length > 0) {
    appliedToVendors = await applyWeights(weights);
    appliedAs = 'weight';
  } else if (Array.isArray(vendorOrder) && vendorOrder.length > 0) {
    appliedToVendors = await applyVendorOrderAsPriority(vendorOrder);
    appliedAs = 'priority';
  }

  // If this config is being saved as active, deactivate any other active
  // configs for the same capability to enforce the one-active-per-capability
  // invariant.
  if (isActive) {
    const deactivateQuery = capability ? { capability, isActive: true } : { capability: null, isActive: true };
    await RoutingConfig.updateMany(deactivateQuery, { isActive: false });
  }

  if (appliedToVendors.length > 0) invalidateVendorCache();

  const config = await RoutingConfig.create({
    sourceText,
    strategy,
    vendorOrder: vendorOrder || [],
    weights: weights || null,
    conditions: conditions || [],
    appliedToVendors,
    capability: capability || null,
    isActive: isActive || false,
  });

  res.status(201).json({ success: true, data: { ...config.toObject(), appliedAs } });
};

// GET /routing-configs
const getRoutingConfigs = async (req, res) => {
  const configs = await RoutingConfig.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: configs });
};

module.exports = { createRoutingConfig, getRoutingConfigs };

