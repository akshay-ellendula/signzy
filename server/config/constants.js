// Centralized runtime configuration derived from environment variables.
const config = {
  LATENCY_THRESHOLD_MS: Number(process.env.LATENCY_THRESHOLD_MS) || 2000,
  DEFAULT_TIMEOUT_MS: Number(process.env.DEFAULT_TIMEOUT_MS) || 3000,
  SIM_SUCCESS_RATE: Number(process.env.SIM_SUCCESS_RATE) || 70,
  SIM_FAILURE_RATE: Number(process.env.SIM_FAILURE_RATE) || 20,
  SIM_TIMEOUT_RATE: Number(process.env.SIM_TIMEOUT_RATE) || 10,
  RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60 * 1000,
  STRICT_AI_MODE: process.env.STRICT_AI_MODE === 'true' || false,

  // A vendor is auto-flagged unhealthy once its rolling error rate exceeds
  // this percentage, but only after MIN_SAMPLE_SIZE_FOR_HEALTH_CHECK requests
  // so a single unlucky attempt can't trip it.
  HIGH_ERROR_RATE_THRESHOLD: Number(process.env.HIGH_ERROR_RATE_THRESHOLD) || 50,
  MIN_SAMPLE_SIZE_FOR_HEALTH_CHECK: Number(process.env.MIN_SAMPLE_SIZE_FOR_HEALTH_CHECK) || 5,

  // Circuit breaker half-open recovery: after this cooldown (ms), an unhealthy
  // vendor is allowed one probe request. If it succeeds, the vendor is
  // automatically marked healthy again; if it fails, the cooldown restarts.
  CIRCUIT_BREAKER_COOLDOWN_MS: Number(process.env.CIRCUIT_BREAKER_COOLDOWN_MS) || 60 * 1000,

  // How long the vendor list served to /route is cached before re-querying
  // MongoDB. Kept short so a manual vendor edit is invalidated explicitly
  // (see utils/vendorCache.js) rather than relying on this TTL alone.
  VENDOR_CACHE_TTL_MS: Number(process.env.VENDOR_CACHE_TTL_MS) || 3000,

  // Optional: Gemini API Key for Agentic AI features (Phase 7)
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
};

const updateConfig = (newSettings) => {
  for (const key in newSettings) {
    if (Object.prototype.hasOwnProperty.call(config, key)) {
      config[key] = newSettings[key];
    }
  }
};

module.exports = { config, updateConfig };

