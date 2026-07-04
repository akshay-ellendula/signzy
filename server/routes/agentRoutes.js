const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { explainRouting } = require('../controllers/agentController');

const router = express.Router();

/**
 * @swagger
 * /agent/explain-routing:
 *   post:
 *     summary: Generate a plain-English explanation of a routing log
 *     tags: [Agent]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [logId]
 *             properties:
 *               logId:
 *                 type: string
 *     responses:
 *       200:
 *         description: AI-generated explanation
 *       404:
 *         description: Log not found
 */
router.post('/explain-routing', asyncHandler(explainRouting));

module.exports = router;
