const ApiError = require('../utils/ApiError');
const { generateRoutingConfigFromAI } = require('../services/agentService');
const { generateRoutingConfig } = require('../utils/aiRuleGenerator');
const { config } = require('../config/constants');

// POST /ai-rule-generator
const generateRule = async (req, res) => {
  const { text } = req.body;

  if (!text || !text.trim()) {
    throw new ApiError(400, '"text" is required');
  }

  let routingConfig;
  let usedAi = false;

  if (config.STRICT_AI_MODE) {
    if (!config.GEMINI_API_KEY) {
      throw new ApiError(500, 'Agentic AI is disabled in Strict Mode. Please provide a GEMINI_API_KEY or disable Strict AI Mode in Settings.');
    }
    try {
      routingConfig = await generateRoutingConfigFromAI(text);
      usedAi = true;
    } catch (error) {
      console.error('Gemini API failed:', error.message);
      throw new ApiError(502, `AI Provider Error: ${error.message}`);
    }
  } else {
    try {
      if (config.GEMINI_API_KEY) {
        routingConfig = await generateRoutingConfigFromAI(text);
        usedAi = true;
      } else {
        routingConfig = generateRoutingConfig(text);
      }
    } catch (error) {
      console.error('Gemini API failed, falling back to Regex generator:', error.message);
      routingConfig = generateRoutingConfig(text);
    }
  }

  res.status(200).json({ success: true, usedAi, data: routingConfig });
};

module.exports = { generateRule };
