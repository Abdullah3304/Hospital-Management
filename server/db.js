require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Pool } = require('pg');

// Prefer DATABASE_PUBLIC_URL for tools run on your laptop (Railway TCP proxy URL).
// DATABASE_URL from Railway often uses postgres.railway.internal — that host does not resolve locally.
const connectionString =
  (process.env.DATABASE_PUBLIC_URL && process.env.DATABASE_PUBLIC_URL.trim()) ||
  process.env.DATABASE_URL;

const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false }
    })
  : new Pool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME
    });

module.exports = pool;
