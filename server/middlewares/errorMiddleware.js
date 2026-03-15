// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error occurred:', err);

  // Default error response
  let error = {
    success: false,
    message: 'Internal server error',
    statusCode: 500,
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    error = {
      success: false,
      message: 'Validation error',
      statusCode: 400,
      details: err.message
    };
  } else if (err.name === 'CastError') {
    error = {
      success: false,
      message: 'Invalid data format',
      statusCode: 400,
      details: err.message
    };
  } else if (err.code === 'ER_DUP_ENTRY') {
    error = {
      success: false,
      message: 'Duplicate entry',
      statusCode: 409,
      details: 'Resource already exists'
    };
  } else if (err.code === 'ENOENT') {
    error = {
      success: false,
      message: 'File not found',
      statusCode: 404,
      details: 'The requested file does not exist'
    };
  } else if (err.code === 'EACCES') {
    error = {
      success: false,
      message: 'Permission denied',
      statusCode: 403,
      details: 'Insufficient permissions to access resource'
    };
  } else if (err.message && err.message.includes('not found')) {
    error = {
      success: false,
      message: 'Resource not found',
      statusCode: 404,
      details: err.message
    };
  } else if (err.message && err.message.includes('Unauthorized')) {
    error = {
      success: false,
      message: 'Unauthorized access',
      statusCode: 401,
      details: err.message
    };
  }

  // Log error details
  console.error('Error Details:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(error.statusCode).json(error);
};

// 404 handler
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    details: `Cannot ${req.method} ${req.url}`
  });
};

// Async error wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Rate limiting error handler
const rateLimitHandler = (req, res) => {
  res.status(429).json({
    success: false,
    message: 'Too many requests',
    details: 'Rate limit exceeded. Please try again later.'
  });
};

// Request timeout handler
const timeoutHandler = (req, res) => {
  res.status(408).json({
    success: false,
    message: 'Request timeout',
    details: 'The request took too long to process'
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  rateLimitHandler,
  timeoutHandler
};
