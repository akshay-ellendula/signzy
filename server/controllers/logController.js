const RoutingLog = require('../models/RoutingLog');

// GET /routing-logs
// Supports pagination (page, limit) and filtering (strategy, status, vendor, capability, search).
const getRoutingLogs = async (req, res) => {
  const { page = 1, limit = 7, strategy, status, vendor, capability, search } = req.query;

  const query = {};
  if (strategy) query.routingStrategy = strategy;
  if (status) query.finalStatus = status.toUpperCase();
  if (vendor) query.selectedVendor = vendor;
  if (capability) query.capability = capability;
  if (search) {
    query.$or = [
      { requestId: { $regex: search, $options: 'i' } },
      { selectedVendor: { $regex: search, $options: 'i' } },
      { routingReason: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.max(Number(limit), 1);

  const [logs, total] = await Promise.all([
    RoutingLog.find(query)
      .sort({ timestamp: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    RoutingLog.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: logs,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
};

// GET /routing-logs/:id
const getRoutingLogById = async (req, res) => {
  const { id } = req.params;
  const log = await RoutingLog.findById(id);

  if (!log) {
    return res.status(404).json({ success: false, message: 'Routing log not found' });
  }

  res.status(200).json({ success: true, data: log });
};

module.exports = { getRoutingLogs, getRoutingLogById };
