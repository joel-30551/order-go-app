const db = require('../config/db');

/**
 * Fetch all customers with optional filtering & pagination — scoped to req.userId.
 */
const getAllCustomers = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { userId } = req;

    let filters = [`user_id = $1`];
    let params = [userId];

    if (search) {
      params.push(`%${search}%`);
      filters.push(`(customer_name ILIKE $${params.length} OR customer_phone ILIKE $${params.length})`);
    }

    const where = `WHERE ${filters.join(' AND ')}`;

    params.push(parseInt(limit), offset);
    const limitClause = `LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const query = `
      SELECT * FROM customers
      ${where}
      ORDER BY created_at DESC
      ${limitClause}
    `;

    const result = await db.query(query, params);
    const customers = result.rows;

    const countQuery = `SELECT COUNT(*) FROM customers ${where}`;
    const countResult = await db.query(countQuery, params.slice(0, params.length - 2));
    const total = parseInt(countResult.rows[0].count);

    return res.status(200).json({
      success: true,
      data: customers,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('getAllCustomers error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * Fetch a single customer by customer_id — scoped to req.userId.
 */
const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT * FROM customers WHERE customer_id = $1 AND user_id = $2',
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('getCustomerById error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * Create a new customer for req.userId.
 */
const createCustomer = async (req, res) => {
  try {
    const { customer_name, customer_phone, customer_address } = req.body;

    const query = `
      INSERT INTO customers (customer_name, customer_phone, customer_address, user_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const params = [customer_name, customer_phone, customer_address, req.userId];

    const result = await db.query(query, params);

    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ success: false, message: 'Phone number already exists.' });
    }
    console.error('createCustomer error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * Update a customer — scoped to req.userId.
 */
const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await db.query(
      'SELECT customer_id FROM customers WHERE customer_id = $1 AND user_id = $2',
      [id, req.userId]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    const { customer_name, customer_phone, customer_address } = req.body;

    const fields = [];
    const values = [];

    if (customer_name !== undefined) { fields.push('customer_name'); values.push(customer_name); }
    if (customer_phone !== undefined) { fields.push('customer_phone'); values.push(customer_phone); }
    if (customer_address !== undefined) { fields.push('customer_address'); values.push(customer_address); }

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');

    values.push(id, req.userId);
    const query = `UPDATE customers SET ${setClause} WHERE customer_id = $${values.length - 1} AND user_id = $${values.length} RETURNING *`;

    const result = await db.query(query, values);
    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ success: false, message: 'Phone number already exists.' });
    }
    console.error('updateCustomer error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * Delete a customer — scoped to req.userId.
 */
const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'DELETE FROM customers WHERE customer_id = $1 AND user_id = $2 RETURNING customer_id',
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    return res.status(200).json({ success: true, message: 'Customer deleted successfully.' });
  } catch (error) {
    console.error('deleteCustomer error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

module.exports = { getAllCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer };
