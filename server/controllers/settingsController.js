const { config, updateConfig } = require('../config/constants');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// GET /settings
const getSettings = (req, res) => {
  res.status(200).json({ success: true, data: config });
};

// PUT /settings
const updateSettings = (req, res) => {
  const newSettings = req.body;
  if (!newSettings || typeof newSettings !== 'object') {
    throw new ApiError(400, 'Invalid settings payload');
  }

  // Restrict to known keys and numbers
  const safeSettings = {};
  for (const key in newSettings) {
    if (Object.prototype.hasOwnProperty.call(config, key) && key !== 'GEMINI_API_KEY') {
      const val = Number(newSettings[key]);
      if (!isNaN(val)) {
        safeSettings[key] = val;
      }
    }
  }

  updateConfig(safeSettings);
  res.status(200).json({ success: true, data: config });
};

module.exports = {
  getSettings: asyncHandler(getSettings),
  updateSettings: asyncHandler(updateSettings),
};
