/**
 * Setup PostgreSQL database and user.
 * Executes SQL commands to create user and database.
 */
const { Client } = require('pg');
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

// Try to connect as postgres superuser
const adminUsers = ['postgres'];
const adminPasswords = [process.env.POSTGRES_PASSWORD, 'postgres', ''];

async function main() {
  console.log('Setting up PostgreSQL database...\n');

  let connected = false;
  let client = null;

  // Try to connect with different admin credentials
  for (const adminUser of adminUsers) {
    for (const adminPassword of adminPasswords) {
      try {
        client = new Client({
          host: 'localhost',
          port: 5432,
          user: adminUser,
          password: adminPassword,
          database: 'postgres',
        });
        await client.connect();
        console.log(`✅ Connected to PostgreSQL as "${adminUser}"\n`);
        connected = true;
        break;
      } catch (error) {
        if (client) {
          try {
            await client.end();
          } catch {}
        }
      }
    }
    if (connected) break;
  }

  if (!connected) {
    console.error('❌ Could not connect to PostgreSQL.');
    console.error('Please ensure PostgreSQL is running and accessible.');
    console.error('\nYou may need to:');
    console.error('1. Start PostgreSQL service');
    console.error('2. Set POSTGRES_PASSWORD environment variable');
    console.error('3. Or run these commands manually in psql:');
    console.error('\n  CREATE USER miniflow WITH PASSWORD \'miniflowpass\' CREATEDB;');
    console.error('  CREATE DATABASE miniflowdb OWNER miniflow;');
    console.error('  GRANT ALL PRIVILEGES ON DATABASE miniflowdb TO miniflow;');
    process.exit(1);
  }

  try {
    // Create user
    console.log('Creating user "miniflow"...');
    try {
      const userCheck = await client.query(
        "SELECT 1 FROM pg_roles WHERE rolname = $1",
        ['miniflow']
      );
      if (userCheck.rows.length === 0) {
        await client.query(`CREATE USER miniflow WITH PASSWORD 'miniflowpass' CREATEDB`);
        console.log('✅ User "miniflow" created successfully.\n');
      } else {
        console.log('ℹ️  User "miniflow" already exists.\n');
      }
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  User "miniflow" already exists.\n');
      } else {
        throw error;
      }
    }

    // Create database
    console.log('Creating database "miniflowdb"...');
    try {
      const dbCheck = await client.query(
        "SELECT 1 FROM pg_database WHERE datname = $1",
        ['miniflowdb']
      );
      if (dbCheck.rows.length === 0) {
        await client.query(`CREATE DATABASE miniflowdb OWNER miniflow`);
        console.log('✅ Database "miniflowdb" created successfully.\n');
      } else {
        console.log('ℹ️  Database "miniflowdb" already exists.\n');
      }
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  Database "miniflowdb" already exists.\n');
      } else {
        throw error;
      }
    }

    // Grant privileges
    console.log('Granting privileges...');
    await client.query(`GRANT ALL PRIVILEGES ON DATABASE miniflowdb TO miniflow`);
    console.log('✅ Privileges granted successfully.\n');

    await client.end();
    console.log('✅ Database setup complete!');
    console.log('\nNext steps:');
    console.log('1. Run: npm run prisma:migrate');
    console.log('2. Run: npm run start:dev');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (client) {
      await client.end();
    }
    process.exit(1);
  }
}

main().catch((e) => {
  console.error('Fatal error:', e.message || e);
  process.exit(1);
});
