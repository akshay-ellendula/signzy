const Vendor = require('../models/Vendor');

// Tracks "how often was this vendor usable at all" as raw counters,
// independent of successRate. Every time a vendor is evaluated during
// routing - whether it's skipped or goes on to be attempted - timesConsidered
// increments, and timesUnavailable increments too if it was skipped for an
// availability-related reason (down, unhealthy, rate-limited, or over the
// latency threshold). A missing-feature skip does NOT count against
// availability - that's a capability mismatch, not a vendor health issue.
//
// The percentage itself is never stored - see utils/computeAvailability.js.
// It's derived on every read from these counters plus the vendor's *current*
// isActive/healthStatus, so a vendor that's down or unhealthy right now shows
// 0% immediately instead of lagging behind until enough /route calls happen.
const recordAvailabilityCheck = async (vendor, { unavailable }) => {
  const increments = { 'metrics.timesConsidered': 1 };
  if (unavailable) increments['metrics.timesUnavailable'] = 1;

  const updated = await Vendor.findByIdAndUpdate(vendor._id, { $inc: increments }, { returnDocument: 'after' });
  if (!updated) return;

  vendor.metrics.timesConsidered = updated.metrics.timesConsidered;
  vendor.metrics.timesUnavailable = updated.metrics.timesUnavailable;
};

module.exports = { recordAvailabilityCheck };
