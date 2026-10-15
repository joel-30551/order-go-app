const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

async function runMigrations() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

  console.log(`Found ${files.length} migration files.`);

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');

    console.log(`Running migration: ${file}...`);
    try {
      await pool.query(sql);
      console.log(`Successfully ran ${file}`);
    } catch (err) {
      console.error(`Error running ${file}:`, err.message);
      // We don't exit here so we can try others, but usually migrations should stop on error
    }
  }

  console.log('Migrations complete.');
  process.exit(0);
}

runMigrations().catch(err => {
  console.error('Migration runner failed:', err);
  process.exit(1);
});
