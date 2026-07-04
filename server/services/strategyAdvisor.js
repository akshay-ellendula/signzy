const Vendor = require('../models/Vendor');
const { config } = require('../config/constants');

// How spread out a set of values is, relative to the largest value.
// 0 = all equal, closer to 1 = wildly different.
const relativeSpread = (values) => {
  if (values.length < 2) return 0;
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === 0) return 0;
  return (max - min) / max;
};

// Pure decision logic, kept separate from the DB fetch so it's trivially unit
// testable: given the current pool of active/healthy vendors, which routing
// strategy would currently make the most sense, and why.
const computeRecommendation = (usableVendors) => {
  if (usableVendors.length === 0) {
    return {
      recommendedStrategy: null,
      reason: 'No active, healthy vendors are available to analyze.',
      signals: { vendorsAnalyzed: 0 },
    };
  }

  const totalRequests = usableVendors.reduce((sum, v) => sum + v.metrics.totalRequests, 0);
  const latencySpread = relativeSpread(usableVendors.map((v) => v.currentLatency).filter((l) => l > 0));
  const costSpread = relativeSpread(usableVendors.map((v) => v.costPerRequest));
  const healthSpread = relativeSpread(usableVendors.map((v) => v.metrics.successRate));
  const anyHighErrorRate = usableVendors.some((v) => v.metrics.errorRate > 20);

  const signals = {
    vendorsAnalyzed: usableVendors.length,
    totalRequests,
    latencySpreadPct: Number((latencySpread * 100).toFixed(1)),
    costSpreadPct: Number((costSpread * 100).toFixed(1)),
    healthSpreadPct: Number((healthSpread * 100).toFixed(1)),
    anyVendorErrorRateAbove20Pct: anyHighErrorRate,
  };

  // Not enough completed traffic yet to trust latency/health signals -
  // fall back to structural signals (configured weights) instead.
  if (totalRequests < config.MIN_SAMPLE_SIZE_FOR_HEALTH_CHECK) {
    const weightSpread = relativeSpread(usableVendors.map((v) => v.weight));
    if (weightSpread > 0.2) {
      return {
        recommendedStrategy: 'weighted',
        reason: `Vendors have meaningfully different configured weights (${signals.vendorsAnalyzed} vendors, spread ${Math.round(weightSpread * 100)}%) but not enough completed requests yet to judge real performance - weighted routing respects that configuration in the meantime.`,
        signals,
      };
    }
    return {
      recommendedStrategy: 'roundRobin',
      reason: `Only ${totalRequests} completed request(s) so far - not enough to judge latency, cost, or health differences. Round robin distributes load evenly while data accumulates.`,
      signals,
    };
  }

  if (anyHighErrorRate || healthSpread > 0.3) {
    return {
      recommendedStrategy: 'healthBased',
      reason: `Vendor reliability varies significantly (health spread ${signals.healthSpreadPct}%${anyHighErrorRate ? ', and at least one vendor has an error rate above 20%' : ''}). Health-based routing steers traffic away from the less reliable vendors automatically.`,
      signals,
    };
  }

  if (latencySpread > 0.4) {
    return {
      recommendedStrategy: 'lowestLatency',
      reason: `Latency varies significantly across vendors (spread ${signals.latencySpreadPct}%). Lowest-latency routing would meaningfully improve response times.`,
      signals,
    };
  }

  if (costSpread > 0.4) {
    return {
      recommendedStrategy: 'lowestCost',
      reason: `Cost per request varies significantly across vendors (spread ${signals.costSpreadPct}%). Lowest-cost routing would reduce spend with no reliability trade-off, since latency and health are comparable.`,
      signals,
    };
  }

  return {
    recommendedStrategy: 'roundRobin',
    reason: 'Vendors are performing comparably across latency, cost, and reliability - round robin keeps load evenly distributed, since no single vendor currently stands out.',
    signals,
  };
};

const recommendStrategy = async () => {
  const vendors = await Vendor.find();
  const usable = vendors.filter((v) => v.isActive && v.healthStatus === 'healthy');
  return computeRecommendation(usable);
};

module.exports = { recommendStrategy, computeRecommendation };
