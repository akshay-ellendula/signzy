const mongoose = require('mongoose');

const failoverEntrySchema = new mongoose.Schema(
  {
    vendor: { type: String, required: true },
    reason: { type: String, required: true },
    latencyMs: { type: Number, default: 0 },
    status: { type: String, enum: ['success', 'failure', 'timeout', 'skipped'], required: true },
  },
  { _id: false }
);

const routingLogSchema = new mongoose.Schema(
  {
    requestId: { type: String, required: true, unique: true },
    timestamp: { type: Date, default: Date.now },
    capability: { type: String, default: null },
    selectedVendor: { type: String, default: null },
    routingStrategy: { type: String, required: true },
    routingReason: { type: String, default: '' },
    payload: { type: mongoose.Schema.Types.Mixed, default: {} },
    failoverHistory: { type: [failoverEntrySchema], default: [] },
    latencyMs: { type: Number, default: 0 },
    cost: { type: Number, default: 0 },
    finalStatus: { type: String, enum: ['SUCCESS', 'FAILURE'], required: true },
  },
  { timestamps: true }
);

routingLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('RoutingLog', routingLogSchema);
