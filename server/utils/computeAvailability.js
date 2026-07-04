// Availability must reflect *current* reachability, not lag behind until enough
// /route calls accumulate. A vendor that is down or unhealthy right now is, by
// definition, not available - regardless of how good its history looks - so
// that always wins. Only when it's currently active+healthy do we fall back to
// the historical "how often was it not down/unhealthy/rate-limited/over-latency
// when evaluated" ratio (timesConsidered/timesUnavailable, tracked in
// utils/availabilityTracker.js). A vendor that's active+healthy but has never
// been evaluated yet defaults to 100% - there's no evidence against it.
const computeAvailability = (vendor) => {
  if (!vendor.isActive || vendor.healthStatus !== 'healthy') return 0;

  const { timesConsidered, timesUnavailable } = vendor.metrics;
  if (!timesConsidered) return 100;

  return Number((((timesConsidered - timesUnavailable) / timesConsidered) * 100).toFixed(2));
};

module.exports = { computeAvailability };
