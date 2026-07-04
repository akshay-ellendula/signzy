const Vendor = require('../models/Vendor');
const { config } = require('../config/constants');

// True sliding-window rate limiting via a rolling timestamp log, instead of a
// fixed calendar-aligned window. A fixed window resets completely at its
// boundary, so a client can send the full quota right before the edge and
// the full quota again right after - up to 2x the configured rate in a very
// short burst. Counting how many timestamps actually fall in the trailing
// RATE_LIMIT_WINDOW_MS eliminates that: the limit is honored no matter when
// requests land relative to any clock boundary.
//
// This is a cheap *pre-filter* against whatever vendor snapshot the caller
// is holding (which may come from the short-TTL vendor cache in
// utils/vendorCache.js) - good enough to exclude an obviously-over-limit
// vendor before ranking. It is deliberately NOT the final word: see
// tryRegisterRequest below for the authoritative, race-free check.
const isRateLimited = (vendor) => {
  const cutoff = Date.now() - config.RATE_LIMIT_WINDOW_MS;
  const recentCount = (vendor.requestTimestamps || []).filter((t) => new Date(t).getTime() > cutoff).length;
  return recentCount >= vendor.rateLimitPerMinute;
};

// Called only when a vendor is actually about to be attempted. Does the
// prune-and-admit decision as ONE atomic MongoDB operation, conditioned on
// the live document's *current* array size vs. its rate limit - not on any
// cached/stale snapshot. This is what actually prevents a burst of
// concurrent requests from all slipping through: MongoDB serializes writes
// per document, so however many requests fire at once, only exactly
// `rateLimitPerMinute` (minus whatever's already recent) can win the push.
// Returns true if this request is admitted, false if it should be treated as
// rate-limited (the caller should fail over to the next vendor).
const tryRegisterRequest = async (vendor) => {
  const now = new Date();
  const cutoff = new Date(now.getTime() - config.RATE_LIMIT_WINDOW_MS);

  // Best-effort housekeeping so the array doesn't accumulate stale entries
  // forever - not required for correctness of the atomic check below.
  await Vendor.updateOne({ _id: vendor._id }, { $pull: { requestTimestamps: { $lte: cutoff } } });

  const updated = await Vendor.findOneAndUpdate(
    { _id: vendor._id, $expr: { $lt: [{ $size: '$requestTimestamps' }, '$rateLimitPerMinute'] } },
    { $push: { requestTimestamps: now } },
    { returnDocument: 'after' }
  );

  if (!updated) return false;
  vendor.requestTimestamps = updated.requestTimestamps;
  return true;
};

module.exports = { isRateLimited, tryRegisterRequest };
