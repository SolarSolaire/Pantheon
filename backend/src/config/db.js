// backend/src/config/db.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { Pool } = require('pg');

// If connection string has ?sslmode=require attached, strip it so it doesn't override rejectUnauthorized
const connectionString = (process.env.DATABASE_URL || '').split('?')[0];

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('connect', () => {
  console.log('⚡ Connected to Aiven PostgreSQL Database');
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};