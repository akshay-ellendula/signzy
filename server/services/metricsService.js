const Vendor = require('../models/Vendor');
const { config } = require('../config/constants');

// Updates a vendor's rolling metrics after a real attempt (skipped vendors
// during filtering do not go through here; availabilityPercentage is tracked
// separately in utils/availabilityTracker.js). The request-count fields are
// bumped with an atomic $inc so concurrent attempts against the same vendor
// can't lose an increment; the derived rates are then recomputed from the
// fresh counts.
const recordAttempt = async (vendor, { success, latency }) => {
  const increments = success
    ? { 'metrics.totalRequests': 1, 'metrics.successfulRequests': 1 }
    : { 'metrics.totalRequests': 1, 'metrics.failedRequests': 1 };

  const updated = await Vendor.findByIdAndUpdate(vendor._id, { $inc: increments }, { returnDocument: 'after' });
  if (!updated) return;

  const m = updated.metrics;
  // m.averageLatency here is still the pre-update average - the $inc above
  // never touched it - so this reproduces the standard running-average formula.
  m.averageLatency = Math.round((m.averageLatency * (m.totalRequests - 1) + latency) / m.totalRequests);
  m.successRate = Number(((m.successfulRequests / m.totalRequests) * 100).toFixed(2));
  m.errorRate = Number(((m.failedRequests / m.totalRequests) * 100).toFixed(2));
  m.lastUsedTime = new Date();

  updated.currentLatency = latency;

  // ── Circuit breaker: OPEN (trip) ──────────────────────────────────────
  // A sustained high error rate flips the vendor unhealthy.
  if (
    updated.healthStatus === 'healthy' &&
    m.totalRequests >= config.MIN_SAMPLE_SIZE_FOR_HEALTH_CHECK &&
    m.errorRate > config.HIGH_ERROR_RATE_THRESHOLD
  ) {
    updated.healthStatus = 'unhealthy';
    updated.unhealthySince = new Date();
  }

  // ── Circuit breaker: HALF-OPEN → CLOSED (recovery) ───────────────────
  // If the vendor is unhealthy but was allowed through as a probe (see
  // filterVendors.js half-open logic) and it succeeded, mark it healthy
  // again - the cooldown has elapsed and the vendor proved it can serve.
  if (updated.healthStatus === 'unhealthy' && success) {
    updated.healthStatus = 'healthy';
    updated.unhealthySince = null;
  }

  await updated.save();

  // Reflect the fresh values onto the in-memory vendor object the caller
  // (routingEngine) is already holding for the rest of this request.
  vendor.metrics = updated.metrics;
  vendor.currentLatency = updated.currentLatency;
  vendor.healthStatus = updated.healthStatus;
};

module.exports = { recordAttempt };

