const Vendor = require('../models/Vendor');
const ApiError = require('../utils/ApiError');
const { serializeVendor, serializeVendors } = require('../utils/serializeVendor');
const { invalidateVendorCache } = require('../utils/vendorCache');
const { broadcast } = require('../services/socketService');

// POST /vendors
const createVendor = async (req, res) => {
  const {
    name,
    priority,
    weight,
    costPerRequest,
    timeoutMs,
    rateLimitPerMinute,
    supportedFeatures,
    healthStatus,
    isActive,
  } = req.body;

  if (!name || !name.trim()) {
    throw new ApiError(400, 'Vendor name is required');
  }

  const existing = await Vendor.findOne({ name: name.trim() });
  if (existing) {
    throw new ApiError(400, `A vendor named "${name}" already exists`);
  }

  const vendor = await Vendor.create({
    name: name.trim(),
    priority,
    weight,
    costPerRequest,
    timeoutMs,
    rateLimitPerMinute,
    supportedFeatures,
    healthStatus,
    isActive,
  });

  invalidateVendorCache();
  broadcast('VENDORS_UPDATE', { timestamp: new Date().toISOString() });
  res.status(201).json({ success: true, data: serializeVendor(vendor) });
};

// GET /vendors
const getVendors = async (req, res) => {
  const vendors = await Vendor.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: vendors.length, data: serializeVendors(vendors) });
};

// GET /vendors/:id
const getVendorById = async (req, res) => {
  const vendor = await Vendor.findById(req.params.id);
  if (!vendor) {
    throw new ApiError(404, 'Vendor not found');
  }
  res.status(200).json({ success: true, data: serializeVendor(vendor) });
};

// PUT /vendors/:id
const updateVendor = async (req, res) => {
  const vendor = await Vendor.findById(req.params.id);
  if (!vendor) {
    throw new ApiError(404, 'Vendor not found');
  }

  const updatableFields = [
    'name',
    'priority',
    'weight',
    'costPerRequest',
    'timeoutMs',
    'rateLimitPerMinute',
    'supportedFeatures',
    'healthStatus',
    'isActive',
    'currentLatency',
  ];

  updatableFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      vendor[field] = req.body[field];
    }
  });

  await vendor.save();
  invalidateVendorCache();
  broadcast('VENDORS_UPDATE', { timestamp: new Date().toISOString() });
  res.status(200).json({ success: true, data: serializeVendor(vendor) });
};

// DELETE /vendors/:id
const deleteVendor = async (req, res) => {
  const vendor = await Vendor.findById(req.params.id);
  if (!vendor) {
    throw new ApiError(404, 'Vendor not found');
  }

  await vendor.deleteOne();
  invalidateVendorCache();
  broadcast('VENDORS_UPDATE', { timestamp: new Date().toISOString() });
  res.status(200).json({ success: true, message: 'Vendor deleted', data: { id: req.params.id } });
};

module.exports = { createVendor, getVendors, getVendorById, updateVendor, deleteVendor };
