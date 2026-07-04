const { GoogleGenAI, Type } = require('@google/genai');
const { config } = require('../config/constants');
const RoutingLog = require('../models/RoutingLog');
const ApiError = require('../utils/ApiError');

// Initialize Gemini client if API key is provided
let ai = null;
if (config.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });
}

// Defines the structured schema we want Gemini to return when parsing rules
const routingConfigSchema = {
  type: Type.OBJECT,
  properties: {
    strategy: {
      type: Type.STRING,
      enum: ['priority', 'weighted', 'roundRobin', 'lowestLatency', 'lowestCost', 'healthBased', 'failover', 'featureBased'],
      description: 'The routing strategy to use based on the input text.',
    },
    vendorOrder: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'An ordered list of vendor names to try in sequence if applicable.',
    },
    weights: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          vendor: { type: Type.STRING },
          percentage: { type: Type.NUMBER },
        },
        required: ['vendor', 'percentage'],
      },
      description: 'Vendor weights if a weighted strategy is requested. Otherwise null/empty.',
    },
    conditions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          metric: { type: Type.STRING, enum: ['latency', 'cost', 'errorRate'] },
          operator: { type: Type.STRING, enum: ['>', '<', '>=', '<=', '=='] },
          value: { type: Type.NUMBER },
          unit: { type: Type.STRING },
          action: { type: Type.STRING, enum: ['switchTo'] },
          vendor: { type: Type.STRING },
        },
        required: ['metric', 'operator', 'value', 'action', 'vendor'],
      },
      description: 'Conditions under which routing should switch to a specific vendor.',
    },
  },
  required: ['strategy', 'vendorOrder', 'weights', 'conditions'],
};

/**
 * Uses Gemini LLM to parse a natural language rule into a structured RoutingConfig.
 */
const generateRoutingConfigFromAI = async (text) => {
  if (!ai) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const prompt = `Convert the following natural language routing rule into a structured configuration.
Rule: "${text}"

Extract the intended strategy (priority, weighted, lowestCost, etc). 
If it mentions percentages, it is a 'weighted' strategy.
Extract any mentioned vendors and their priorities/weights.
Extract any conditional failover rules (e.g. "if latency > 2s switch to Vendor C").
Standardize units (use 'ms' for latency).`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: routingConfigSchema,
      temperature: 0.1, // Low temperature for deterministic extraction
    },
  });

  const config = JSON.parse(response.text);
  
  // Attach the original source text
  config.sourceText = text;
  
  return config;
};

/**
 * Uses Gemini LLM to explain a routing decision in plain English.
 */
const explainRoutingDecision = async (requestId) => {
  if (!ai) {
    throw new ApiError(503, 'Agentic AI is currently unavailable (missing API key).');
  }

  const log = await RoutingLog.findOne({ requestId }).lean();
  if (!log) {
    throw new ApiError(404, 'Routing log not found for this requestId');
  }

  const prompt = `You are a DevOps assistant explaining why a routing decision was made by an Intelligent Vendor Routing Platform.
Here is the JSON audit log of a single request that was routed through the system:
${JSON.stringify(log, null, 2)}

Please write a brief (2-3 sentences), plain English explanation of what happened to this request.
Mention the strategy used, which vendors were tried, and why the final vendor succeeded or failed.
Do not output Markdown, just plain text.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      temperature: 0.4,
    },
  });

  return {
    requestId: log.requestId,
    explanation: response.text.trim(),
  };
};

module.exports = {
  generateRoutingConfigFromAI,
  explainRoutingDecision,
};
