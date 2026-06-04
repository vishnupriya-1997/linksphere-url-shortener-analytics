const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let code = err.errorCode || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'An unexpected error occurred on our servers.';
  let details = err.details || [];

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_FAILED';
    message = 'Data validation failed on the server.';
    details = Object.values(err.errors).map((val) => ({
      field: val.path,
      issue: val.message
    }));
  }

  // Duplicate key errors (e.g. email, alias already taken)
  if (err.code === 11000) {
    statusCode = 409;
    code = 'CONFLICT';
    const field = Object.keys(err.keyValue)[0];
    message = `This ${field} is already in use. Please select another.`;
    details = [{
      field,
      issue: `Duplicate value error on database field: '${field}'`
    }];
  }

  // Cast errors (e.g. invalid MongoDB ObjectId format)
  if (err.name === 'CastError') {
    statusCode = 400;
    code = 'BAD_REQUEST';
    message = `Invalid format provided for field: ${err.path}`;
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details
    }
  });
};

module.exports = errorHandler;
