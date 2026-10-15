/**
 * Generic Joi validation middleware.
 * Usage: router.post('/', validate(schema), handler)
 */
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });

  if (error) {
    const messages = error.details.map((d) => d.message);
    return res.status(400).json({ success: false, errors: messages });
  }

  req.body = value; // replace with sanitised + defaulted values
  next();
};

module.exports = validate;
