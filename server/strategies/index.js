const priorityStrategy = require('./priorityStrategy');
const weightedStrategy = require('./weightedStrategy');
const roundRobinStrategy = require('./roundRobinStrategy');
const lowestLatencyStrategy = require('./lowestLatencyStrategy');
const lowestCostStrategy = require('./lowestCostStrategy');
const healthBasedStrategy = require('./healthBasedStrategy');
const failoverStrategy = require('./failoverStrategy');
const featureBasedStrategy = require('./featureBasedStrategy');
const ApiError = require('../utils/ApiError');

// Strategy Design Pattern registry: each entry exposes a `rank(vendors, context)`
// function that returns eligible vendors ordered best-first.
const strategies = {
  priority: priorityStrategy,
  weighted: weightedStrategy,
  roundRobin: roundRobinStrategy,
  lowestLatency: lowestLatencyStrategy,
  lowestCost: lowestCostStrategy,
  healthBased: healthBasedStrategy,
  failover: failoverStrategy,
  featureBased: featureBasedStrategy,
};

const getStrategy = (name) => {
  const strategy = strategies[name];
  if (!strategy) {
    throw new ApiError(400, `Unknown routing strategy "${name}". Valid options: ${Object.keys(strategies).join(', ')}`);
  }
  return strategy;
};

module.exports = { strategies, getStrategy };
