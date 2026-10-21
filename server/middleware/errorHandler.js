// 404 handler
exports.notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// General error handler
exports.errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.code === 11000
    ? 409
    : err.name === 'MulterError'
      ? err.code === 'LIMIT_FILE_SIZE' ? 413 : 400
      : err.name === 'CastError'
        ? 400
        : err.status || err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  const message = statusCode >= 500 && process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;
  res.status(statusCode);
  res.json({
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};
