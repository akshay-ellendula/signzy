require('dotenv').config();
require('dns').setServers(['8.8.8.8', '8.8.4.4']); // Fix for ECONNREFUSED on SRV queries
const connectDB = require('./config/db');
const app = require('./app');
const { initWebSocket } = require('./services/socketService');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  const server = app.listen(PORT, () => {
    console.log(`Vendor Routing Platform API listening on port ${PORT}`);
  });
  initWebSocket(server);
};

startServer();
// Server initialized with Unidirectional WebSocket push telemetry
