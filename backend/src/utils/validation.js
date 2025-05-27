const Joi = require('joi');

// Validation schema cho tài sản
const assetSchema = Joi.object({
  code: Joi.string().required(),
  name: Joi.string().required(),
  location: Joi.string().allow('', null),
  system: Joi.string().allow('', null),
  technical_specs: Joi.object().allow(null)
});

// Validation schema cho tác động
const actionSchema = Joi.object({
  asset_id: Joi.number().required(),
  type: Joi.string().required(),
  description: Joi.string().required(),
  performed_by: Joi.string().required(),
  performed_at: Joi.date().iso().required(),
  custom_fields: Joi.object().allow(null)
});

// Validation schema cho hư hỏng
const failureSchema = Joi.object({
  asset_id: Joi.number().required(),
  type: Joi.string().required(),
  description: Joi.string().required(),
  severity: Joi.string().valid('low', 'medium', 'high', 'critical').required(),
  detected_at: Joi.date().iso().required(),
  resolved_at: Joi.date().iso().allow(null),
  resolution_details: Joi.string().allow(null),
  custom_fields: Joi.object().allow(null)
});

// Validation schema cho đăng ký
const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  role: Joi.string().valid('admin', 'technician', 'viewer').default('viewer')
});

// Validation schema cho đăng nhập
const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

// Middleware validation
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    next();
  };
};

module.exports = {
  validateRequest,
  assetSchema,
  actionSchema,
  failureSchema,
  registerSchema,
  loginSchema
};
