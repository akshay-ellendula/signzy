const { computeAvailability } = require('../utils/computeAvailability');

// Ranks already-healthy vendors by how "good" their health actually is,
// rewarding high success rate / availability and penalizing error rate.
const healthScore = (vendor) =>
  vendor.metrics.successRate * 0.5 +
  computeAvailability(vendor) * 0.4 -
  vendor.metrics.errorRate * 0.1;

const rank = (vendors) => {
  return [...vendors].sort((a, b) => healthScore(b) - healthScore(a));
};

module.exports = { rank };
