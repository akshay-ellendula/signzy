const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { validate, createVendorSchema, updateVendorSchema } = require('../middleware/validate');
const {
  createVendor,
  getVendors,
  getVendorById,
  updateVendor,
  deleteVendor,
} = require('../controllers/vendorController');

const router = express.Router();

/**
 * @swagger
 * /vendors:
 *   post:
 *     summary: Create a new vendor
 *     tags: [Vendors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, supportedFeatures, priority]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Vendor A
 *               supportedFeatures:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [PAN_VERIFICATION, OCR]
 *               priority:
 *                 type: number
 *                 example: 1
 *               weight:
 *                 type: number
 *                 example: 50
 *               costPerRequest:
 *                 type: number
 *                 example: 0.05
 *               timeoutMs:
 *                 type: number
 *                 example: 1200
 *               rateLimitPerMinute:
 *                 type: number
 *                 example: 600
 *               healthStatus:
 *                 type: string
 *                 enum: [healthy, degraded, down]
 *                 example: healthy
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Vendor created
 *   get:
 *     summary: Get all vendors
 *     tags: [Vendors]
 *     responses:
 *       200:
 *         description: List of all vendors
 */
router.route('/').post(validate(createVendorSchema), asyncHandler(createVendor)).get(asyncHandler(getVendors));

/**
 * @swagger
 * /vendors/{id}:
 *   get:
 *     summary: Get a vendor by ID
 *     tags: [Vendors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vendor object
 *       404:
 *         description: Vendor not found
 *   put:
 *     summary: Update a vendor by ID
 *     tags: [Vendors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               supportedFeatures:
 *                 type: array
 *                 items:
 *                   type: string
 *               priority:
 *                 type: number
 *               weight:
 *                 type: number
 *               costPerRequest:
 *                 type: number
 *               timeoutMs:
 *                 type: number
 *               rateLimitPerMinute:
 *                 type: number
 *               healthStatus:
 *                 type: string
 *                 enum: [healthy, degraded, down]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Vendor updated
 *   delete:
 *     summary: Delete a vendor by ID
 *     tags: [Vendors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vendor deleted
 */
router
  .route('/:id')
  .get(asyncHandler(getVendorById))
  .put(validate(updateVendorSchema), asyncHandler(updateVendor))
  .delete(asyncHandler(deleteVendor));

module.exports = router;
