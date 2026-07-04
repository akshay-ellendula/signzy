const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { validate, routeRequestSchema } = require('../middleware/validate');
const { route } = require('../controllers/routingController');

const router = express.Router();

/**
 * @swagger
 * /route:
 *   post:
 *     summary: Route a vendor request
 *     description: Intelligent router that selects the best available vendor dynamically based on configurable AI rules, live performance metrics, and failover strategies.
 *     tags: [Routing]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [capability, payload]
 *             properties:
 *               capability:
 *                 type: string
 *                 example: PAN_VERIFICATION
 *               payload:
 *                 type: object
 *                 example: { panNumber: "ABCDE1234F", name: "Rahul Sharma" }
 *               strategy:
 *                 type: string
 *                 enum: [priority, weighted, lowestLatency, lowestCost, failover, roundRobin, featureBased, healthBased]
 *                 description: Optional strategy override to force a specific routing decision model.
 *                 example: lowestLatency
 *               requirements:
 *                 type: object
 *                 properties:
 *                   maxLatencyMs:
 *                     type: number
 *                     example: 1000
 *                   maxCost:
 *                     type: number
 *                     example: 0.10
 *     responses:
 *       200:
 *         description: Routed request successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 requestId:
 *                   type: string
 *                   format: uuid
 *                   example: c82f9d1a-4b6e-4f1a-8c9d-1a2b3c4d5e6f
 *                 capability:
 *                   type: string
 *                   example: PAN_VERIFICATION
 *                 strategy:
 *                   type: string
 *                   example: lowestLatency
 *                 selectedVendor:
 *                   type: string
 *                   example: Vendor B
 *                 routingReason:
 *                   type: string
 *                   example: Lowest current latency (185ms) among eligible vendors
 *                 latencyMs:
 *                   type: number
 *                   example: 185
 *                 status:
 *                   type: string
 *                   example: SUCCESS
 *                 data:
 *                   type: object
 *                 failoverHistory:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Validation error
 *       503:
 *         description: No vendors available or all vendors failed after failover attempts
 */
router.post('/', validate(routeRequestSchema), asyncHandler(route));

module.exports = router;
