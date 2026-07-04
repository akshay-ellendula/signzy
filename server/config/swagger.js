const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Intelligent Vendor Routing Platform API',
      version: '1.0.0',
      description: 'API documentation for the Intelligent Vendor Routing Platform. Supports 8 intelligent routing strategies (priority, weighted, lowestLatency, lowestCost, failover, roundRobin, featureBased, healthBased), automated multi-tier failover, live health tracking, and UUID-based request auditing.',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
  },
  // Path to the API docs
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
