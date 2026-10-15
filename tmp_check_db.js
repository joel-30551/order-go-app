const { Pool } = require('@neondatabase/serverless');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
  try {
    console.log('Connecting to database...');
    // Check tables
    const tablesRes = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Tables:', tablesRes.rows.map(r => r.table_name));

    // Check user_id in key tables
    const columnsRes = await pool.query("SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = 'public' AND column_name = 'user_id'");
    console.log('Tables with user_id:', columnsRes.rows.map(r => r.table_name));

    // Check types
    const typesRes = await pool.query("SELECT typname FROM pg_type WHERE typname = 'product_category'");
    console.log('Custom types found:', typesRes.rows.map(r => r.typname));

  } catch (e) {
    console.error('Error during check:', e);
  } finally {
    await pool.end();
  }
}

check();
