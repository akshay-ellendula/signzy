const { routeRequest } = require('../services/routingEngine');

// POST /route
// `strategy` is optional - routeRequest defaults it from requirements.preferLowCost
// (or plain priority) when omitted, matching a client that only sends
// { capability, payload, requirements }.
const route = async (req, res) => {
  const { capability, payload, strategy, requirements, conditions } = req.body;

  const result = await routeRequest({ capability, payload, strategy, requirements, conditions });
  res.status(200).json({ success: true, ...result });
};

module.exports = { route };
