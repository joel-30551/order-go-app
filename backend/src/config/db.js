const { Pool } = require('@neondatabase/serverless');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set.');
}

// Using Pool instead of neon tagged template for standard pg-compatible query support (query, params)
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool, // Exporting pool in case it's needed for other operations
};
