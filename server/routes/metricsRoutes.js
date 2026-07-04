const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { getVendorMetrics } = require('../controllers/metricsController');

const router = express.Router();

/**
 * @swagger
 * /vendor-metrics:
 *   get:
 *     summary: Retrieve aggregate performance metrics for all vendors
 *     tags: [Metrics]
 *     responses:
 *       200:
 *         description: Metrics successfully retrieved
 */
router.get('/', asyncHandler(getVendorMetrics));

module.exports = router;
