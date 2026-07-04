const mongoose = require('mongoose');

const weightEntrySchema = new mongoose.Schema(
  { vendor: { type: String, required: true }, percentage: { type: Number, required: true } },
  { _id: false }
);

const conditionSchema = new mongoose.Schema(
  {
    metric: { type: String, enum: ['latency', 'cost', 'errorRate'], required: true },
    operator: { type: String, default: '>' },
    value: { type: Number, required: true },
    unit: { type: String, default: 'ms' },
    action: { type: String, default: 'switchTo' },
    vendor: { type: String, required: true },
  },
  { _id: false }
);

// A saved, applyable result of the AI Rule Generator: the strategy/weights it
// derived plus the conditional-failover rules, so a Route Tester request can
// reference it by id instead of re-parsing the sentence every time.
const routingConfigSchema = new mongoose.Schema(
  {
    sourceText: { type: String, required: true },
    strategy: { type: String, required: true },
    vendorOrder: { type: [String], default: [] },
    weights: { type: [weightEntrySchema], default: null },
    conditions: { type: [conditionSchema], default: [] },
    appliedToVendors: { type: [String], default: [] },

    // When true, this config's conditions are automatically injected into
    // /route requests that match its capability (or all requests if
    // capability is null). Only one config per capability should be active.
    isActive: { type: Boolean, default: false },
    capability: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RoutingConfig', routingConfigSchema);

