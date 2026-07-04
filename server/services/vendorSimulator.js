const { config } = require('../config/constants');
const { buildCapabilityResponse } = require('../utils/capabilityResponses');

const randomLatency = () => Math.floor(Math.random() * (3000 - 100 + 1)) + 100;

// Returns the normalized outcome total based on current config values
const getOutcomeTotal = () => config.SIM_SUCCESS_RATE + config.SIM_FAILURE_RATE + config.SIM_TIMEOUT_RATE;

// Picks success / failure / timeout using the configured probabilities.
const rollOutcome = () => {
  const total = getOutcomeTotal();
  const roll = Math.random() * total;
  if (roll < config.SIM_SUCCESS_RATE) return 'success';
  if (roll < config.SIM_SUCCESS_RATE + config.SIM_FAILURE_RATE) return 'failure';
  return 'timeout';
};

// Simulates calling a vendor. No real vendor APIs are ever contacted -
// outcome and latency are randomized to exercise the routing/failover logic.
// The response shape on success is capability-specific (see
// utils/capabilityResponses.js) - a PAN_VERIFICATION call gets back
// { panStatus, nameMatch }, an SMS call gets back a delivery receipt, etc.
const callVendor = (vendor, payload, capability) =>
  new Promise((resolve) => {
    const latency = randomLatency();
    const outcome = rollOutcome();
    const effectiveTimeout = vendor.timeoutMs || config.DEFAULT_TIMEOUT_MS;
    const willTimeout = outcome === 'timeout' || latency > effectiveTimeout;
    const settleAfter = Math.min(latency, effectiveTimeout);

    setTimeout(() => {
      if (willTimeout) {
        resolve({
          success: false,
          status: 'timeout',
          latency: effectiveTimeout,
          reason: `Vendor timed out after ${effectiveTimeout}ms`,
        });
        return;
      }

      if (outcome === 'failure') {
        resolve({
          success: false,
          status: 'failure',
          latency,
          reason: 'Vendor returned a failure response',
        });
        return;
      }

      resolve({
        success: true,
        status: 'success',
        latency,
        reason: 'Vendor processed the request successfully',
        response: buildCapabilityResponse(capability, vendor.name, payload),
      });
    }, settleAfter);
  });

module.exports = { callVendor };
