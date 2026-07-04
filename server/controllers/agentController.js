const asyncHandler = require('../utils/asyncHandler');
const { explainRoutingDecision } = require('../services/agentService');
const ApiError = require('../utils/ApiError');

// POST /agent/explain-routing
const explainRouting = async (req, res) => {
  const { requestId } = req.body;

  if (!requestId) {
    throw new ApiError(400, '"requestId" is required');
  }

  const explanation = await explainRoutingDecision(requestId);
  res.status(200).json({ success: true, data: explanation });
};

module.exports = { explainRouting };
