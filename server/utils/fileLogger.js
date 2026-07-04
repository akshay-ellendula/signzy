const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '..', 'logs', 'routing.log');

// Appends a single JSON line per routing decision as a plain-text audit trail,
// independent of the queryable copy kept in MongoDB (RoutingLog collection).
const appendRoutingLog = (logEntry) => {
  const line = `${JSON.stringify({ ...logEntry, timestamp: new Date().toISOString() })}\n`;
  fs.appendFile(LOG_FILE, line, (err) => {
    if (err) console.error('Failed to write routing log file:', err.message);
  });
};

module.exports = { appendRoutingLog };
