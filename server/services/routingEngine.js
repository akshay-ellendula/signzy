const { randomUUID } = require('crypto');
const Vendor = require('../models/Vendor');
const RoutingConfig = require('../models/RoutingConfig');
const { getStrategy } = require('../strategies');
const { getEligibleVendors } = require('../utils/filterVendors');
const { tryRegisterRequest } = require('../utils/rateLimiter');
const { callVendor } = require('./vendorSimulator');
const { recordAttempt } = require('./metricsService');
const { createRoutingLog } = require('./loggingService');
const { describeSelection } = require('../utils/routingReason');
const { applyConditions } = require('../utils/applyConditions');
const { getCachedVendors } = require('../utils/vendorCache');

// Looks up the most recently updated active RoutingConfig that matches the
// requested capability (or any-capability configs with capability=null).
// Returns its conditions array and strategy, or defaults if none found.
const getActiveConfig = async (capability) => {
  const query = { isActive: true };
  if (capability) {
    query.$or = [{ capability }, { capability: null }];
  }
  const config = await RoutingConfig.findOne(query).sort({ updatedAt: -1 });
  return {
    conditions: config?.conditions || [],
    strategy: config?.strategy || null,
  };
};

// Fetched as plain objects (not Mongoose documents) so the cache can safely
// hand out fresh clones per request - every mutation path (registerRequest,
// recordAttempt, recordAvailabilityCheck) only ever needs `vendor._id` to
// issue its own atomic, freshly-fetched update, so a plain-object read here
// never risks a stale write.
const fetchVendorsPlain = async () => {
  const vendors = await Vendor.find().lean();
  return vendors.map((v) => ({ ...v, _id: v._id.toString() }));
};

// Orchestrates one /route call: filter -> rank -> attempt with automatic
// failover -> record metrics -> persist a routing log -> return a
// vendor-agnostic standard response.
//
// `strategy` is optional - if omitted, it auto-adopts the strategy from the
// active database policy, then `requirements.preferLowCost` picks lowestCost,
// otherwise it defaults to priority. `requirements.maxLatencyMs` overrides the
// global latency threshold for just this request.
//
// `conditions` can be explicitly passed, or auto-injected from the most
// recently active RoutingConfig matching this capability.
const routeRequest = async ({ capability, payload, strategy, requirements = {}, conditions = [] }) => {
  const requestId = randomUUID();
  const activePolicy = (conditions.length === 0 || !strategy) ? await getActiveConfig(capability) : { conditions: [], strategy: null };
  const effectiveConditions = conditions.length > 0 ? conditions : activePolicy.conditions;
  const resolvedStrategy = strategy || activePolicy.strategy || (requirements.preferLowCost ? 'lowestCost' : 'priority');
  const strategyImpl = getStrategy(resolvedStrategy); // throws ApiError(400) if unknown

  const allVendors = await getCachedVendors(fetchVendorsPlain);
  const { eligible, skipped } = await getEligibleVendors(allVendors, capability, requirements.maxLatencyMs);

  const failoverHistory = [...skipped];

  if (eligible.length === 0) {
    const logData = {
      requestId,
      capability: capability || null,
      selectedVendor: null,
      routingStrategy: resolvedStrategy,
      routingReason: 'No eligible vendors available after applying filters',
      payload: payload || {},
      failoverHistory,
      latencyMs: 0,
      cost: 0,
      finalStatus: 'FAILURE',
    };
    await createRoutingLog(logData);

    return {
      status: 'FAILURE',
      vendorUsed: null,
      routingReason: logData.routingReason,
      latencyMs: 0,
      cost: 0,
      response: { error: 'No eligible vendors available' },
      requestId,
      failoverHistory,
    };
  }

  const rankedVendors = strategyImpl.rank(eligible, { capability });
  const finalOrder = applyConditions(rankedVendors, effectiveConditions);
  const conditionOverrideVendor = finalOrder[0] !== rankedVendors[0] ? finalOrder[0].name : null;

  for (const vendor of finalOrder) {
    // Authoritative, race-free gate - independent of whatever (possibly
    // cached/stale) snapshot got this vendor ranked here in the first place.
    const admitted = await tryRegisterRequest(vendor);
    if (!admitted) {
      failoverHistory.push({
        vendor: vendor.name,
        reason: 'Vendor rate limit exceeded',
        latencyMs: 0,
        status: 'skipped',
      });
      continue;
    }

    const result = await callVendor(vendor, payload, capability);
    await recordAttempt(vendor, { success: result.success, latency: result.latency });

    failoverHistory.push({
      vendor: vendor.name,
      reason: result.reason,
      latencyMs: result.latency,
      status: result.status,
    });

    if (result.success) {
      let routingReason = describeSelection(resolvedStrategy, vendor);
      if (conditionOverrideVendor && vendor.name === conditionOverrideVendor) {
        routingReason += ' (promoted ahead of the top-ranked vendor by a configured condition)';
      }

      await createRoutingLog({
        requestId,
        capability: capability || null,
        selectedVendor: vendor.name,
        routingStrategy: resolvedStrategy,
        routingReason,
        payload: payload || {},
        failoverHistory,
        latencyMs: result.latency,
        cost: vendor.costPerRequest,
        finalStatus: 'SUCCESS',
      });

      return {
        status: 'SUCCESS',
        vendorUsed: vendor.name,
        routingReason,
        latencyMs: result.latency,
        cost: vendor.costPerRequest,
        response: result.response,
        requestId,
        failoverHistory,
      };
    }
  }

  // Every eligible vendor was attempted and failed.
  const totalLatency = failoverHistory.reduce((sum, entry) => sum + (entry.latencyMs || 0), 0);

  await createRoutingLog({
    requestId,
    capability: capability || null,
    selectedVendor: null,
    routingStrategy: resolvedStrategy,
    routingReason: 'All eligible vendors failed after failover',
    payload: payload || {},
    failoverHistory,
    latencyMs: totalLatency,
    cost: 0,
    finalStatus: 'FAILURE',
  });

  return {
    status: 'FAILURE',
    vendorUsed: null,
    routingReason: 'All eligible vendors failed after failover',
    latencyMs: totalLatency,
    cost: 0,
    response: { error: 'All vendors failed to process the request' },
    requestId,
    failoverHistory,
  };
};

module.exports = { routeRequest };
