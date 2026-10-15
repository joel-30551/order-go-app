const express = require('express');
const router = express.Router();

const {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require('../controllers/customerController');

const validate = require('../middlewares/validate');
const { createCustomerSchema, updateCustomerSchema } = require('../validators/customerValidator');

router.get('/', getAllCustomers);
router.get('/:id', getCustomerById);
router.post('/', validate(createCustomerSchema), createCustomer);
router.put('/:id', validate(updateCustomerSchema), updateCustomer);
router.delete('/:id', deleteCustomer);

module.exports = router;
