const express = require('express');
const { getSettings, updateSettings } = require('../controllers/settingsController');

const router = express.Router();

/**
 * @swagger
 * /settings:
 *   get:
 *     summary: Retrieve global system settings
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: Current settings object
 */
router.get('/', getSettings);

/**
 * @swagger
 * /settings:
 *   put:
 *     summary: Update global system settings
 *     tags: [Settings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties:
 *               type: number
 *     responses:
 *       200:
 *         description: Settings updated successfully
 */
router.put('/', updateSettings);

module.exports = router;
