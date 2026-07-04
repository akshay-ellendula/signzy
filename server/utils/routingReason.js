const { computeAvailability } = require('./computeAvailability');

// Builds a human-readable explanation for why a given vendor was chosen by a strategy.
const describeSelection = (strategyName, vendor) => {
  switch (strategyName) {
    case 'priority':
      return `Highest priority (${vendor.priority}) among eligible vendors`;
    case 'weighted':
      return `Selected via weighted random selection (weight=${vendor.weight})`;
    case 'roundRobin':
      return 'Selected via round-robin rotation';
    case 'lowestLatency':
      return `Lowest current latency (${vendor.currentLatency}ms) among eligible vendors`;
    case 'lowestCost':
      return `Lowest cost per request ($${vendor.costPerRequest}) among eligible vendors`;
    case 'healthBased':
      return `Best health score (successRate=${vendor.metrics.successRate}%, availability=${computeAvailability(vendor)}%) among eligible vendors`;
    case 'failover':
      return `Primary in the failover chain (priority ${vendor.priority}) among eligible vendors`;
    case 'featureBased':
      return `Supports the broadest feature set (${vendor.supportedFeatures.length} feature(s)) among eligible vendors`;
    default:
      return `Selected by ${strategyName} strategy`;
  }
};

module.exports = { describeSelection };
