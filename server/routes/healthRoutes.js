const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { getHealth } = require('../controllers/healthController');

const router = express.Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Check API health status
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy
 */
router.get('/', asyncHandler(getHealth));

module.exports = router;
