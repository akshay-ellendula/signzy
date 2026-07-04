const { config } = require('../config/constants');
const Vendor = require('../models/Vendor');

// Every /route call used to run Vendor.find() unconditionally, even though
// vendor data barely changes between requests - a read-heavy hot path for no
// reason. This is a short-TTL cache (no Redis needed for a handful of
// vendors): a cache hit returns a fresh deep clone of the last fetched list
// so concurrent requests never share - and accidentally mutate - the same
// objects, while all actual persistence still goes through atomic,
// _id-keyed updates elsewhere (rateLimiter, metricsService,
// availabilityTracker), so serving a slightly-stale read here never risks
// a lost write.
let cache = { data: null, expiresAt: 0 };

const getCachedVendors = async (fetchFn) => {
  if (cache.data && Date.now() < cache.expiresAt) {
    return structuredClone(cache.data);
  }

  const data = await fetchFn();
  cache = { data, expiresAt: Date.now() + config.VENDOR_CACHE_TTL_MS };
  return structuredClone(data);
};

// Called after any vendor create/update/delete so a manual edit (e.g.
// marking a vendor down) is reflected on the very next /route call instead
// of waiting out the TTL.
const invalidateVendorCache = () => {
  cache = { data: null, expiresAt: 0 };
};

module.exports = { getCachedVendors, invalidateVendorCache };
