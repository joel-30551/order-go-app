const db = require('../config/db');

/**
 * Fetch all products with optional filtering & pagination.
 * Query params: category, minPrice, maxPrice, page, limit
 */
const getAllProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { userId } = req;

    let filters = [`user_id = $1`];
    let params = [userId];

    if (category) {
      params.push(category);
      filters.push(`prod_cat = $${params.length}::product_category`);
    }
    if (minPrice) {
      params.push(parseFloat(minPrice));
      filters.push(`prod_price >= $${params.length}`);
    }
    if (maxPrice) {
      params.push(parseFloat(maxPrice));
      filters.push(`prod_price <= $${params.length}`);
    }

    const where = `WHERE ${filters.join(' AND ')}`;

    params.push(parseInt(limit), offset);
    const limitClause = `LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const query = `
      SELECT * FROM products
      ${where}
      ORDER BY created_at DESC
      ${limitClause}
    `;

    const result = await db.query(query, params);
    const products = result.rows;

    // Total count for pagination
    const countQuery = `SELECT COUNT(*) FROM products ${where}`;
    const countResult = await db.query(countQuery, params.slice(0, params.length - 2));
    const total = parseInt(countResult.rows[0].count);

    return res.status(200).json({
      success: true,
      data: products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('getAllProducts error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * Fetch a single product by prod_id (UUID) — scoped to req.userId.
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT * FROM products WHERE prod_id = $1 AND user_id = $2',
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('getProductById error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * Create a new product for req.userId.
 */
const createProduct = async (req, res) => {
  try {
    const { prod_name, prod_quantity = 0, prod_cat = 'other', prod_price } = req.body;

    const query = `
      INSERT INTO products (prod_name, prod_quantity, prod_cat, prod_price, user_id)
      VALUES ($1, $2, $3::product_category, $4, $5)
      RETURNING *
    `;
    const params = [prod_name, prod_quantity, prod_cat, prod_price, req.userId];

    console.log('Creating Product with params:', params);
    const result = await db.query(query, params);
    console.log('Product created successfully:', result.rows[0].prod_id);

    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('createProduct error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * Update a product (partial update) — scoped to req.userId.
 */
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await db.query(
      'SELECT prod_id FROM products WHERE prod_id = $1 AND user_id = $2',
      [id, req.userId]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const { prod_name, prod_quantity, prod_cat, prod_price } = req.body;

    const fields = [];
    const values = [];

    if (prod_name !== undefined) { fields.push('prod_name'); values.push(prod_name); }
    if (prod_quantity !== undefined) { fields.push('prod_quantity'); values.push(prod_quantity); }
    if (prod_cat !== undefined) { fields.push('prod_cat'); values.push(prod_cat); }
    if (prod_price !== undefined) { fields.push('prod_price'); values.push(prod_price); }

    const setClause = fields
      .map((f, i) => f === 'prod_cat' ? `${f} = $${i + 1}::product_category` : `${f} = $${i + 1}`)
      .join(', ');

    values.push(id, req.userId);
    const query = `UPDATE products SET ${setClause} WHERE prod_id = $${values.length - 1} AND user_id = $${values.length} RETURNING *`;

    const result = await db.query(query, values);
    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('updateProduct error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * Delete a product by prod_id — scoped to req.userId.
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'DELETE FROM products WHERE prod_id = $1 AND user_id = $2 RETURNING prod_id',
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    return res.status(200).json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('deleteProduct error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };
