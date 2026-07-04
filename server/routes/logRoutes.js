const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { getRoutingLogs, getRoutingLogById } = require('../controllers/logController');

const router = express.Router();

/**
 * @swagger
 * /routing-logs:
 *   get:
 *     summary: Get recent routing decision logs with filtering and pagination
 *     tags: [Logs]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of logs to retrieve per page
 *       - in: query
 *         name: strategy
 *         schema:
 *           type: string
 *           enum: [priority, weighted, lowestLatency, lowestCost, failover, roundRobin, featureBased, healthBased]
 *         description: Filter logs by routing strategy used
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [SUCCESS, FAILURE]
 *         description: Filter logs by final request status
 *       - in: query
 *         name: vendor
 *         schema:
 *           type: string
 *         description: Filter logs by selected vendor name
 *       - in: query
 *         name: capability
 *         schema:
 *           type: string
 *         description: Filter logs by capability (e.g. PAN_VERIFICATION, OCR, SMS)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by Request ID (UUID), vendor name, or routing reason
 *     responses:
 *       200:
 *         description: Paginated list of routing logs
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
 *                     properties:
 *                       requestId:
 *                         type: string
 *                         format: uuid
 *                         example: c82f9d1a-4b6e-4f1a-8c9d-1a2b3c4d5e6f
 *                       capability:
 *                         type: string
 *                         example: PAN_VERIFICATION
 *                       selectedVendor:
 *                         type: string
 *                         example: Vendor A
 *                       routingStrategy:
 *                         type: string
 *                         example: priority
 *                       finalStatus:
 *                         type: string
 *                         example: SUCCESS
 *                       latencyMs:
 *                         type: number
 *                         example: 118
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */
router.get('/', asyncHandler(getRoutingLogs));

/**
 * @swagger
 * /routing-logs/{id}:
 *   get:
 *     summary: Get a specific routing log by ID
 *     tags: [Logs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Routing log details including full failover history and payload
 *       404:
 *         description: Log not found
 */
router.get('/:id', asyncHandler(getRoutingLogById));

module.exports = router;
