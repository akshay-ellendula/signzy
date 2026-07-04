// Centralized error handler. Any error passed to next(err) (or thrown inside
// an asyncHandler-wrapped route) ends up here with a consistent JSON shape.
// Mongoose doesn't set `err.statusCode`, so its error types are normalized to
// a proper 400 here instead of falling through as a raw 500 with internal
// Mongo message text.
const normalize = (err) => {
  if (err.statusCode) return { statusCode: err.statusCode, message: err.message };

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join('; ');
    return { statusCode: 400, message };
  }

  if (err.name === 'CastError') {
    return { statusCode: 400, message: `Invalid value "${err.value}" for field "${err.path}"` };
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    return { statusCode: 400, message: `A record with ${field} "${value}" already exists` };
  }

  return { statusCode: 500, message: err.message || 'Internal Server Error' };
};

const errorHandler = (err, req, res, next) => {
  const { statusCode, message } = normalize(err);

  if (process.env.NODE_ENV !== 'test' && statusCode >= 500) {
    console.error(err.stack || err.message);
  }

  res.status(statusCode).json({ success: false, message });
};

const notFound = (req, res, next) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
};

module.exports = { errorHandler, notFound };
