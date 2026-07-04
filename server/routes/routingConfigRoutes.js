const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { validate, routingConfigSchema } = require('../middleware/validate');
const { createRoutingConfig, getRoutingConfigs } = require('../controllers/routingConfigController');

const router = express.Router();

/**
 * @swagger
 * /routing-configs:
 *   post:
 *     summary: Save a routing config rule (AI generated or custom)
 *     tags: [Routing Config]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ruleName, capability, strategy]
 *             properties:
 *               ruleName:
 *                 type: string
 *                 example: High Priority PAN Verification
 *               capability:
 *                 type: string
 *                 example: PAN_VERIFICATION
 *               conditions:
 *                 type: array
 *                 items:
 *                   type: object
 *                 example: [{ field: "payload.amount", operator: ">", value: 1000 }]
 *               strategy:
 *                 type: string
 *                 enum: [priority, weighted, lowestLatency, lowestCost, failover, roundRobin, featureBased, healthBased]
 *                 example: lowestLatency
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Routing config saved successfully
 *   get:
 *     summary: Get all saved routing config rules
 *     tags: [Routing Config]
 *     responses:
 *       200:
 *         description: List of routing config rules
 */
router.route('/').post(validate(routingConfigSchema), asyncHandler(createRoutingConfig)).get(asyncHandler(getRoutingConfigs));

module.exports = router;
