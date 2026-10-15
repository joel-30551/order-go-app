/**
 * migrate.js – Run SQL migrations against your Neon Postgres database.
 * Usage:  node migrate.js
 *
 * Requires DATABASE_URL in backend/.env
 */

const { Pool } = require('@neondatabase/serverless');
const fs   = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

if (!process.env.DATABASE_URL) {
  console.error(' DATABASE_URL is not set. Add it to backend/.env');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const MIGRATIONS_DIR = path.join(__dirname, 'src', 'database', 'migrations');

async function runMigrations() {
  const client = await pool.connect();
  console.log(' Connected to Neon Postgres');

  try {
    // Track which migrations have already been applied
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id       SERIAL PRIMARY KEY,
        filename TEXT    NOT NULL UNIQUE,
        run_at   TIMESTAMP DEFAULT NOW()
      )
    `);

    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      console.log('No migration files found in', MIGRATIONS_DIR);
      return;
    }

    for (const file of files) {
      const { rows } = await client.query(
        'SELECT id FROM _migrations WHERE filename = $1',
        [file],
      );

      if (rows.length > 0) {
        console.log(`Already applied, skipping: ${file}`);
        continue;
      }

      const sqlText = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');
      console.log(`Running: ${file}`);

      await client.query('BEGIN');
      try {
        await client.query(sqlText);
        await client.query('INSERT INTO _migrations (filename) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`Applied: ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`Migration failed: ${file}`);
        console.error('   ', err.message);
        process.exit(1);
      }
    }

    console.log('\n All migrations complete!');
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
