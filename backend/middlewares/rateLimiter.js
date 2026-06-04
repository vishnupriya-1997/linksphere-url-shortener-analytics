const rateLimit = require('express-rate-limit');

// 1. Redirection route rate limit (300 requests per minute)
const redirectLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Redirection lookup limit exceeded. Please try again after 60 seconds.',
      details: []
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

// 2. Authentication route rate limit (10 requests per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many authentication attempts. Please try again after 15 minutes.',
      details: []
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

// 3. Main API route rate limit (120 requests per minute)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'API rate limit exceeded. Please limit request frequency.',
      details: []
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  redirectLimiter,
  authLimiter,
  apiLimiter
};
