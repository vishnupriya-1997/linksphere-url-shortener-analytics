const authService = require('../services/authService');

const register = async (req, res, next) => {
  const { name, email, password } = req.body;
  try {
    const result = await authService.registerUser(name, email, password);
    res.status(201).json({
      success: true,
      message: 'User account created successfully.',
      user: result
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const result = await authService.loginUser(email, password);
    res.status(200).json({
      success: true,
      token: result.token,
      user: result.user
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    // req.user has already been resolved in authMiddleware
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        apiKey: req.user.apiKey,
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

const regenerateApiKey = async (req, res, next) => {
  try {
    const newKey = await authService.regenerateApiKey(req.user._id);
    res.status(200).json({
      success: true,
      message: 'Developer API access token regenerated successfully.',
      apiKey: newKey
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  regenerateApiKey
};
