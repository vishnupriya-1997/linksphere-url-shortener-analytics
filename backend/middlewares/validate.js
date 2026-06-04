const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const details = error.details.map((detail) => ({
      field: detail.path.join('.'),
      issue: detail.message
    }));

    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_FAILED',
        message: 'One or more inputs failed validation rules.',
        details
      }
    });
  }
  next();
};

module.exports = validate;
