const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const { errorHandler, notFound } = require('./middleware/errorHandler');

const vendorRoutes = require('./routes/vendorRoutes');
const routingRoutes = require('./routes/routingRoutes');
const metricsRoutes = require('./routes/metricsRoutes');
const logRoutes = require('./routes/logRoutes');
const healthRoutes = require('./routes/healthRoutes');
const aiRuleRoutes = require('./routes/aiRuleRoutes');
const routingConfigRoutes = require('./routes/routingConfigRoutes');
const adviceRoutes = require('./routes/adviceRoutes');
const agentRoutes = require('./routes/agentRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const app = express();

// In development, reflect any localhost origin so Vite's dev server can run on
// whatever port is free (5173, 5174, ...) without breaking CORS. In production,
// restrict to the configured CLIENT_URL(s) (comma-separated).
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: '*', // Allow all origins for easier deployment
  })
);
app.use(express.json());
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

app.use('/vendors', vendorRoutes);
app.use('/route', routingRoutes);
app.use('/vendor-metrics', metricsRoutes);
app.use('/routing-logs', logRoutes);
app.use('/health', healthRoutes);
app.use('/ai-rule-generator', aiRuleRoutes);
app.use('/routing-configs', routingConfigRoutes);
app.use('/agent', agentRoutes);
app.use('/settings', settingsRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/', adviceRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
