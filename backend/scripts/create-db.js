/**
 * Creates the PostgreSQL database if it doesn't exist.
 * Connect to the default "postgres" DB then CREATE DATABASE.
 * Loads .env from backend root when run via npm script.
 */
const path = require('path');
const fs = require('fs');

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
  }
}

loadEnv();

const {
  DB_HOST = 'localhost',
  DB_PORT = '5432',
  DB_USERNAME = 'postgres',
  DB_PASSWORD = 'postgres',
  DB_DATABASE = 'myappdb',
} = process.env;

const { Client } = require('pg');

async function main() {
  const client = new Client({
    host: DB_HOST,
    port: parseInt(DB_PORT, 10),
    user: DB_USERNAME,
    password: DB_PASSWORD,
    database: 'postgres',
  });
  await client.connect();
  const res = await client.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [DB_DATABASE]
  );
  if (res.rows.length === 0) {
    await client.query(`CREATE DATABASE "${DB_DATABASE}"`);
    console.log(`Created database "${DB_DATABASE}".`);
  } else {
    console.log(`Database "${DB_DATABASE}" already exists.`);
  }
  await client.end();
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
