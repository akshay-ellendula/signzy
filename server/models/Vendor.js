const mongoose = require('mongoose');

const metricsSchema = new mongoose.Schema(
  {
    totalRequests: { type: Number, default: 0 },
    successfulRequests: { type: Number, default: 0 },
    failedRequests: { type: Number, default: 0 },
    averageLatency: { type: Number, default: 0 },
    errorRate: { type: Number, default: 0 },
    successRate: { type: Number, default: 100 },

    // Raw counters behind the (always-computed, never-stored) availability
    // percentage - see utils/computeAvailability.js. Incremented in
    // utils/availabilityTracker.js every time a vendor is evaluated during
    // routing, whether or not it was ultimately attempted.
    timesConsidered: { type: Number, default: 0 },
    timesUnavailable: { type: Number, default: 0 },

    lastUsedTime: { type: Date, default: null },
  },
  { _id: false }
);

const vendorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    priority: { type: Number, required: true, default: 1, min: [0, 'Priority cannot be negative'] }, // higher = tried first
    weight: { type: Number, required: true, default: 1, min: [0, 'Weight cannot be negative'] }, // used by weighted routing
    costPerRequest: { type: Number, required: true, default: 0, min: [0, 'Cost per request cannot be negative'] },
    timeoutMs: { type: Number, required: true, default: 3000, min: [1, 'Timeout must be at least 1ms'] },
    rateLimitPerMinute: { type: Number, required: true, default: 100, min: [1, 'Rate limit must be at least 1'] },
    supportedFeatures: { type: [String], default: [] },

    // Admin-controlled availability switch (simulates a vendor being taken down)
    isActive: { type: Boolean, default: true },

    healthStatus: {
      type: String,
      enum: ['healthy', 'unhealthy'],
      default: 'healthy',
    },
    // Timestamp when the vendor was auto-flagged unhealthy by the circuit
    // breaker. Used to compute cooldown for the half-open recovery probe.
    unhealthySince: { type: Date, default: null },
    currentLatency: { type: Number, default: 0 },

    // True sliding-window rate limiting: a rolling log of recent request
    // timestamps, pruned to the last RATE_LIMIT_WINDOW_MS on every write (see
    // utils/rateLimiter.js). Avoids the fixed-window flaw where up to 2x the
    // configured rate can slip through right at a calendar-aligned boundary.
    requestTimestamps: { type: [Date], default: [] },

    metrics: { type: metricsSchema, default: () => ({}) },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vendor', vendorSchema);
