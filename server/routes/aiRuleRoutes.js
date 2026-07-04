const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { validate, aiRuleSchema } = require('../middleware/validate');
const { generateRule } = require('../controllers/aiRuleController');

const router = express.Router();

/**
 * @swagger
 * /ai-rule-generator:
 *   post:
 *     summary: Generate routing rules via AI
 *     description: Converts natural language prompts into structured JSON routing rules supporting all 8 routing strategies.
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text]
 *             properties:
 *               text:
 *                 type: string
 *                 example: Route all PAN verification requests with amount > 5000 using lowestLatency strategy
 *     responses:
 *       200:
 *         description: AI generated structured routing rule
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     ruleName:
 *                       type: string
 *                     capability:
 *                       type: string
 *                     strategy:
 *                       type: string
 *                       enum: [priority, weighted, lowestLatency, lowestCost, failover, roundRobin, featureBased, healthBased]
 *                       example: lowestLatency
 *                     conditions:
 *                       type: array
 *                       items:
 *                         type: object
 */
router.post('/', validate(aiRuleSchema), asyncHandler(generateRule));

module.exports = router;
