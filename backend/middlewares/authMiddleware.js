const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // 1. Check for API Key (Developer Token) in Headers
  const apiKey = req.headers['x-api-key'];
  if (apiKey) {
    try {
      const user = await User.findOne({ apiKey });
      if (user) {
        req.user = user;
        return next();
      }
    } catch (error) {
      // Fail silently and try JWT instead
    }
  }

  // 2. Check for Standard JWT Bearer token in Headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verify token signatures
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_2026_change_me');

      // Bind user to request
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User belonging to this token no longer exists.',
            details: []
          }
        });
      }
      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Not authorized, token signature verification failed.',
          details: []
        }
      });
    }
  }

  if (!token && !req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Access denied. No active session token found.',
        details: []
      }
    });
  }
};

module.exports = { protect };
