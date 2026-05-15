const isProd = process.env.NODE_ENV === 'production';

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Multer file size limit
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      status: 'error',
      message: 'File size must not exceed 5MB',
    });
  }

  // Known operational errors (AppError instances)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // Unexpected errors — log full details server-side, never expose to client
  if (isProd) {
    console.error('[ERROR]', new Date().toISOString(), err);
  } else {
    console.error('Unexpected error:', err);
  }

  return res.status(500).json({
    status: 'error',
    message: 'An unexpected error occurred',
    // Stack trace only in development — never in production
    ...(isProd ? {} : { stack: err.stack }),
  });
};

module.exports = errorHandler;
