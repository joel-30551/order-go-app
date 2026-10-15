const { Pool } = require('@neondatabase/serverless');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function testInsert() {
  try {
    console.log('Inserting test product...');
    const res = await pool.query(
      "INSERT INTO products (prod_name, prod_quantity, prod_cat, prod_price, user_id) VALUES ($1, $2, $3::product_category, $4, $5) RETURNING *",
      ['Test Product', 10, 'electronics', 99.99, 'test-user-id']
    );
    console.log('Inserted:', res.rows[0]);

    console.log('Fetching test product...');
    const fetchRes = await pool.query("SELECT * FROM products WHERE prod_id = $1", [res.rows[0].prod_id]);
    console.log('Fetched:', fetchRes.rows[0]);

    console.log('Cleaning up...');
    await pool.query("DELETE FROM products WHERE prod_id = $1", [res.rows[0].prod_id]);
    console.log('Cleanup successful');

  } catch (e) {
    console.error('Test failed:', e);
  } finally {
    await pool.end();
  }
}

testInsert();
