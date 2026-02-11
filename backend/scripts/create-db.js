/**
 * Creates the PostgreSQL database and user if they don't exist.
 * Connect to the default "postgres" DB then CREATE USER and DATABASE.
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

// Parse DATABASE_URL if available, otherwise use individual env vars
let DB_HOST = 'localhost';
let DB_PORT = '5432';
let DB_USERNAME = 'miniflow';
let DB_PASSWORD = 'miniflowpass';
let DB_DATABASE = 'miniflowdb';

if (process.env.DATABASE_URL) {
  // Parse postgresql://user:password@host:port/database
  const url = process.env.DATABASE_URL.replace(/^["']|["']$/g, '');
  const match = url.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
  if (match) {
    DB_USERNAME = match[1];
    DB_PASSWORD = match[2];
    DB_HOST = match[3];
    DB_PORT = match[4];
    DB_DATABASE = match[5];
  }
} else {
  // Fallback to individual env vars
  DB_HOST = process.env.DB_HOST || DB_HOST;
  DB_PORT = process.env.DB_PORT || DB_PORT;
  DB_USERNAME = process.env.DB_USERNAME || DB_USERNAME;
  DB_PASSWORD = process.env.DB_PASSWORD || DB_PASSWORD;
  DB_DATABASE = process.env.DB_DATABASE || DB_DATABASE;
}

const { Client } = require('pg');

async function main() {
  console.log(`Attempting to create database "${DB_DATABASE}" and user "${DB_USERNAME}"...`);
  
  // Try to connect as postgres superuser first (common default)
  const adminUsers = ['postgres', 'admin'];
  let connected = false;
  let adminClient = null;

  for (const adminUser of adminUsers) {
    try {
      adminClient = new Client({
        host: DB_HOST,
        port: parseInt(DB_PORT, 10),
        user: adminUser,
        password: process.env.POSTGRES_PASSWORD || adminUser, // Try common defaults
        database: 'postgres',
      });
      await adminClient.connect();
      console.log(`Connected to PostgreSQL as "${adminUser}".`);
      connected = true;
      break;
    } catch (error) {
      // Try next admin user
      if (adminClient) {
        try {
          await adminClient.end();
        } catch {}
      }
    }
  }

  if (!connected) {
    // Last attempt: try with the specified username (might already have permissions)
    try {
      adminClient = new Client({
        host: DB_HOST,
        port: parseInt(DB_PORT, 10),
        user: DB_USERNAME,
        password: DB_PASSWORD,
        database: 'postgres',
      });
      await adminClient.connect();
      console.log(`Connected to PostgreSQL as "${DB_USERNAME}".`);
      connected = true;
    } catch (error) {
      console.error('\n❌ Could not connect to PostgreSQL.');
      console.error('Please ensure PostgreSQL is running and you have admin access.');
      console.error('\nYou can manually create the database and user by running:');
      console.error(`\n  psql -U postgres -c "CREATE USER ${DB_USERNAME} WITH PASSWORD '${DB_PASSWORD}';"`);
      console.error(`  psql -U postgres -c "CREATE DATABASE ${DB_DATABASE} OWNER ${DB_USERNAME};"`);
      console.error(`  psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_DATABASE} TO ${DB_USERNAME};"`);
      process.exit(1);
    }
  }

  try {
    // Check if user exists, create if not
    const userCheck = await adminClient.query(
      "SELECT 1 FROM pg_roles WHERE rolname = $1",
      [DB_USERNAME]
    );
    if (userCheck.rows.length === 0) {
      await adminClient.query(
        `CREATE USER "${DB_USERNAME}" WITH PASSWORD '${DB_PASSWORD}' CREATEDB`
      );
      console.log(`✅ Created user "${DB_USERNAME}".`);
    } else {
      console.log(`ℹ️  User "${DB_USERNAME}" already exists.`);
    }

    // Check if database exists, create if not
    const dbCheck = await adminClient.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [DB_DATABASE]
    );
    if (dbCheck.rows.length === 0) {
      await adminClient.query(`CREATE DATABASE "${DB_DATABASE}" OWNER "${DB_USERNAME}"`);
      console.log(`✅ Created database "${DB_DATABASE}".`);
    } else {
      console.log(`ℹ️  Database "${DB_DATABASE}" already exists.`);
    }

    // Grant privileges
    await adminClient.query(
      `GRANT ALL PRIVILEGES ON DATABASE "${DB_DATABASE}" TO "${DB_USERNAME}"`
    );
    console.log(`✅ Granted privileges to "${DB_USERNAME}" on "${DB_DATABASE}".`);

    await adminClient.end();
    console.log('\n✅ Database setup complete! You can now run: npm run prisma:migrate');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await adminClient.end();
    process.exit(1);
  }
}

main().catch((e) => {
  console.error('Fatal error:', e.message || e);
  process.exit(1);
});
