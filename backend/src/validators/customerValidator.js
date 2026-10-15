const Joi = require('joi');

const createCustomerSchema = Joi.object({
  customer_name: Joi.string().trim().min(2).max(255).required(),
  customer_phone: Joi.string().trim().max(20).allow(null, ''),
  customer_address: Joi.string().trim().max(500).allow(null, ''),
});

const updateCustomerSchema = Joi.object({
  customer_name: Joi.string().trim().min(2).max(255),
  customer_phone: Joi.string().trim().max(20).allow(null, ''),
  customer_address: Joi.string().trim().max(500).allow(null, ''),
}).min(1);

module.exports = { createCustomerSchema, updateCustomerSchema };
