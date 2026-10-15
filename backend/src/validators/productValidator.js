const Joi = require('joi');

const CATEGORIES = ['electronics', 'fashion', 'groceries', 'accessories', 'office', 'other'];

const createProductSchema = Joi.object({
  prod_name: Joi.string().trim().min(2).max(255).required(),
  prod_quantity: Joi.number().integer().min(0).default(0),
  prod_cat: Joi.string().valid(...CATEGORIES).default('other'),
  prod_price: Joi.number().precision(2).positive().required(),
});

const updateProductSchema = Joi.object({
  prod_name: Joi.string().trim().min(2).max(255),
  prod_quantity: Joi.number().integer().min(0),
  prod_cat: Joi.string().valid(...CATEGORIES),
  prod_price: Joi.number().precision(2).positive(),
}).min(1); // at least one field must be present

module.exports = { createProductSchema, updateProductSchema };
