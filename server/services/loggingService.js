const RoutingLog = require('../models/RoutingLog');
const { appendRoutingLog } = require('../utils/fileLogger');
const { broadcastLogUpdate, broadcast } = require('./socketService');

// Persists a routing decision to MongoDB (for the searchable /routing-logs API)
// and to the flat-file audit log under server/logs/.
const createRoutingLog = async (logData) => {
  const log = await RoutingLog.create(logData);
  appendRoutingLog(logData);
  try {
    broadcastLogUpdate(log);
    broadcast('TELEMETRY_REFRESH', { timestamp: new Date().toISOString() });
  } catch (e) {
    // Non-blocking WebSocket broadcast
  }
  return log;
};

module.exports = { createRoutingLog };
