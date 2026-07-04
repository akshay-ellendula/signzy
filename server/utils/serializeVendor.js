const { computeAvailability } = require('./computeAvailability');

// Converts a Vendor document to a plain object with metrics.availabilityPercentage
// injected live (see computeAvailability.js) - it's intentionally never stored,
// so every response has to attach it fresh.
const serializeVendor = (vendorDoc) => {
  const obj = typeof vendorDoc.toObject === 'function' ? vendorDoc.toObject() : { ...vendorDoc };
  const totalCostSpent = Number(((obj.metrics?.totalRequests || 0) * (obj.costPerRequest || 0)).toFixed(2));
  obj.metrics = { ...obj.metrics, availabilityPercentage: computeAvailability(obj), totalCostSpent };
  return obj;
};

const serializeVendors = (vendorDocs) => vendorDocs.map(serializeVendor);

module.exports = { serializeVendor, serializeVendors };
