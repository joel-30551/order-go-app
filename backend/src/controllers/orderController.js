const { pool, query } = require('../config/db');

exports.createOrder = async (req, res) => {
  const { cust_id, items } = req.body;
  const { userId } = req;

  if (!cust_id || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Invalid data.' });
  }

  console.log(`Creating order for customer ${cust_id} with ${items.length} items`);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verify the customer belongs to this user
    const custCheck = await client.query(
      'SELECT customer_id FROM customers WHERE customer_id = $1 AND user_id = $2',
      [cust_id, userId]
    );
    if (custCheck.rows.length === 0) {
      throw new Error('Customer not found.');
    }

    let order_total = 0;
    const validatedItems = [];

    for (const item of items) {
      const prodRes = await client.query(
        'SELECT prod_price, prod_quantity, prod_name FROM products WHERE prod_id = $1 AND user_id = $2',
        [item.prod_id, userId]
      );
      if (prodRes.rows.length === 0) throw new Error(`Product not found.`);
      const product = prodRes.rows[0];

      if (product.prod_quantity < item.quantity) {
        throw new Error(`Insufficient stock for "${product.prod_name}". Only ${product.prod_quantity} left.`);
      }

      const price_at_purchase = product.prod_price;
      order_total += Number(price_at_purchase) * item.quantity;

      validatedItems.push({ ...item, price_at_purchase });
    }

    const orderRes = await client.query(
      `INSERT INTO orders (cust_id, order_total, user_id) VALUES ($1, $2, $3) RETURNING *`,
      [cust_id, order_total, userId]
    );
    const order = orderRes.rows[0];

    for (const item of validatedItems) {
      await client.query(
        `INSERT INTO order_items (order_id, prod_id, quantity, price_at_purchase) VALUES ($1, $2, $3, $4)`,
        [order.order_id, item.prod_id, item.quantity, item.price_at_purchase]
      );
      await client.query(
        `UPDATE products SET prod_quantity = prod_quantity - $1 WHERE prod_id = $2`,
        [item.quantity, item.prod_id]
      );
    }

    await client.query('COMMIT');
    console.log('Order created successfully:', order.order_id);
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('createOrder error:', err.message);
    res.status(400).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
};

exports.getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const { userId } = req;
    const offset = (page - 1) * limit;

    const baseQuery = `
      SELECT o.*, c.customer_name 
      FROM orders o 
      LEFT JOIN customers c ON o.cust_id = c.customer_id
    `;
    const countQuery = `
      SELECT COUNT(*) as exact_count
      FROM orders o
      LEFT JOIN customers c ON o.cust_id = c.customer_id
    `;

    const values = [userId];
    let whereClause = `WHERE o.user_id = $1`;

    if (search) {
      values.push(`%${search}%`);
      whereClause += ` AND c.customer_name ILIKE $${values.length}`;
    }

    const finalQuery = `${baseQuery} ${whereClause} ORDER BY o.created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    const finalCount = `${countQuery} ${whereClause}`;

    const [rowsRes, countRes] = await Promise.all([
      query(finalQuery, [...values, limit, offset]),
      query(finalCount, values)
    ]);

    const total = parseInt(countRes.rows[0].exact_count, 10);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: rowsRes.rows,
      pagination: { total, page: Number(page), totalPages, limit: Number(limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;

    const orderRes = await query(`
      SELECT o.*, c.customer_name, c.customer_phone, c.customer_address
      FROM orders o
      LEFT JOIN customers c ON o.cust_id = c.customer_id
      WHERE o.order_id = $1 AND o.user_id = $2
    `, [id, userId]);

    if (orderRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orderRes.rows[0];

    const itemsRes = await query(`
      SELECT oi.*, p.prod_name, p.prod_cat
      FROM order_items oi
      LEFT JOIN products p ON oi.prod_id = p.prod_id
      WHERE oi.order_id = $1
    `, [id]);

    order.items = itemsRes.rows;

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteOrder = async (req, res) => {
  const { id } = req.params;
  const { userId } = req;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const orderRes = await client.query(
      'SELECT * FROM orders WHERE order_id = $1 AND user_id = $2',
      [id, userId]
    );
    if (orderRes.rows.length === 0) throw new Error('Order not found.');

    const itemsRes = await client.query(
      'SELECT prod_id, quantity FROM order_items WHERE order_id = $1',
      [id]
    );

    for (const item of itemsRes.rows) {
      await client.query(
        `UPDATE products SET prod_quantity = prod_quantity + $1 WHERE prod_id = $2`,
        [item.quantity, item.prod_id]
      );
    }

    await client.query('DELETE FROM orders WHERE order_id = $1', [id]);

    await client.query('COMMIT');
    res.json({ success: true, message: 'Order deleted successfully and stock reverted.' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
};
