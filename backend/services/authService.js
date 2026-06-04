const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Sign JWT session signatures.
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_super_secret_jwt_key_2026_change_me', {
    expiresIn: '24h'
  });
};

/**
 * Generate cryptographically secure API keys.
 */
const generateApiKey = () => {
  return 'ls_live_' + crypto.randomBytes(24).toString('hex');
};

const registerUser = async (name, email, password) => {
  const emailExists = await User.findOne({ email });
  if (emailExists) {
    const error = new Error('This email address is already registered.');
    error.statusCode = 409;
    error.errorCode = 'EMAIL_ALREADY_EXISTS';
    throw error;
  }

  const apiKey = generateApiKey();
  const user = await User.create({
    name,
    email,
    password,
    apiKey
  });

  return {
    id: user._id,
    name: user.name,
    email: user.email
  };
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    const error = new Error('Invalid email address or password provided.');
    error.statusCode = 401;
    error.errorCode = 'INVALID_CREDENTIALS';
    throw error;
  }

  return {
    token: generateToken(user._id),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      apiKey: user.apiKey
    }
  };
};

const regenerateApiKey = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    error.errorCode = 'USER_NOT_FOUND';
    throw error;
  }

  user.apiKey = generateApiKey();
  await user.save();
  return user.apiKey;
};

module.exports = {
  registerUser,
  loginUser,
  regenerateApiKey
};
