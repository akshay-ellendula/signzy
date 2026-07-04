const WebSocket = require('ws');

let wss = null;

const initWebSocket = (server) => {
  wss = new WebSocket.Server({ server, path: '/ws' });

  wss.on('connection', (ws) => {
    // Send initial handshake / welcome message
    ws.send(JSON.stringify({ type: 'CONNECTED', message: 'Unidirectional live telemetry active' }));

    ws.on('close', () => {
      // Do nothing on close
    });

    ws.on('error', (err) => {
      console.error('[WebSocket] Error:', err.message);
    });
  });

  console.log('[WebSocket] Unidirectional server initialized on path /ws');
};

const broadcast = (type, data) => {
  if (!wss) return;
  const message = JSON.stringify({ type, data, timestamp: new Date().toISOString() });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

const broadcastHealthUpdate = (healthData) => broadcast('HEALTH_UPDATE', healthData);
const broadcastMetricsUpdate = (metricsData) => broadcast('METRICS_UPDATE', metricsData);
const broadcastVendorsUpdate = (vendorsData) => broadcast('VENDORS_UPDATE', vendorsData);
const broadcastLogUpdate = (logData) => broadcast('LOG_UPDATE', logData);

module.exports = {
  initWebSocket,
  broadcast,
  broadcastHealthUpdate,
  broadcastMetricsUpdate,
  broadcastVendorsUpdate,
  broadcastLogUpdate,
};
