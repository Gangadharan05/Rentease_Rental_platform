// Catches anything thrown/passed to next() in controllers and returns a
// consistent JSON error shape instead of leaking stack traces to clients.
const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Sequelize validation / unique constraint errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const message = err.errors.map((e) => e.message).join(', ');
    return res.status(400).json({ message });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Server error',
  });
};

const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

module.exports = { errorHandler, notFound };
