const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { getStrategyRecommendation, getFallbackSuggestions } = require('../controllers/adviceController');

const router = express.Router();

/**
 * @swagger
 * /strategy-recommendation:
 *   get:
 *     summary: Get automated routing strategy recommendation based on current vendor metrics
 *     tags: [Advice]
 *     responses:
 *       200:
 *         description: Recommendation object with suggested strategy from all 8 supported strategies
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
 *                     recommendedStrategy:
 *                       type: string
 *                       enum: [priority, weighted, lowestLatency, lowestCost, failover, roundRobin, featureBased, healthBased]
 *                       example: lowestLatency
 *                     reason:
 *                       type: string
 *                       example: High latency variance detected; switching to lowestLatency recommended.
 */
router.get('/strategy-recommendation', asyncHandler(getStrategyRecommendation));

/**
 * @swagger
 * /fallback-suggestions:
 *   get:
 *     summary: Get AI/system suggestions for fallback rules when top vendors fail
 *     tags: [Advice]
 *     responses:
 *       200:
 *         description: List of suggested fallback rules
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get('/fallback-suggestions', asyncHandler(getFallbackSuggestions));

module.exports = router;
