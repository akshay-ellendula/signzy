const { recommendStrategy } = require('../services/strategyAdvisor');
const { suggestFallbackRules } = require('../services/fallbackAdvisor');

// GET /strategy-recommendation
const getStrategyRecommendation = async (req, res) => {
  const recommendation = await recommendStrategy();
  res.status(200).json({ success: true, data: recommendation });
};

// GET /fallback-suggestions
const getFallbackSuggestions = async (req, res) => {
  const suggestions = await suggestFallbackRules();
  res.status(200).json({ success: true, data: suggestions });
};

module.exports = { getStrategyRecommendation, getFallbackSuggestions };
