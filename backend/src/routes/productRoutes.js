const express = require('express');
const router = express.Router();

const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

const validate = require('../middlewares/validate');
const { createProductSchema, updateProductSchema } = require('../validators/productValidator');

// GET    /api/products          - list all products (with filters & pagination)
// GET    /api/products/:id      - get a single product
// POST   /api/products          - create a product
// PUT    /api/products/:id      - update a product
// DELETE /api/products/:id      - delete a product

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', validate(createProductSchema), createProduct);
router.put('/:id', validate(updateProductSchema), updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;
