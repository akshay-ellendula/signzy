// Applies AI Rule Generator-style conditions ({ metric, operator, value, vendor })
// as ranking overrides: if the current top-ranked vendor breaches a condition's
// threshold, the named fallback vendor is promoted to the front instead -
// modeling "switch to Vendor C if latency exceeds 2 seconds" using the
// vendor's live metrics rather than needing to wait for a real-time result.
// Only the ">" operator is supported (the only one the generator produces).
const METRIC_ACCESSORS = {
  latency: (vendor) => vendor.currentLatency,
  cost: (vendor) => vendor.costPerRequest,
  errorRate: (vendor) => vendor.metrics.errorRate,
};

const applyConditions = (rankedVendors, conditions = []) => {
  if (!conditions.length || rankedVendors.length === 0) return rankedVendors;

  let result = [...rankedVendors];

  for (const condition of conditions) {
    const accessor = METRIC_ACCESSORS[condition.metric];
    if (!accessor || condition.operator !== '>') continue;

    const top = result[0];
    if (accessor(top) > condition.value) {
      const fallbackIndex = result.findIndex((v) => v.name === condition.vendor);
      if (fallbackIndex > 0) {
        const [fallback] = result.splice(fallbackIndex, 1);
        result = [fallback, ...result];
      }
    }
  }

  return result;
};

module.exports = { applyConditions };
