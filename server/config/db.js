const { Pool } = require('pg');
require('dotenv').config();

console.log('🔍 Debug - .env loaded from:', process.cwd());

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sniper_think',
  port: process.env.DB_PORT || 5432,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Create connection pool
const pool = new Pool(dbConfig);

// Test connection
const testConnection = async () => {
  try {
    console.log('🔍 Debug - Environment Variables:');
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_USER:', process.env.DB_USER);
    console.log('DB_NAME:', process.env.DB_NAME);
    console.log('DB_PORT:', process.env.DB_PORT);
    console.log('🔍 Debug - DB Config:', dbConfig);
    
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    client.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

// Initialize database tables
const initializeDatabase = async () => {
  try {
    const client = await pool.connect();
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create files table
    await client.query(`
      CREATE TABLE IF NOT EXISTS files (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        file_path VARCHAR(500) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        file_size INTEGER NOT NULL,
        file_type VARCHAR(50) NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create jobs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id SERIAL PRIMARY KEY,
        file_id INTEGER REFERENCES files(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
        progress INTEGER DEFAULT 0,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create results table
    await client.query(`
      CREATE TABLE IF NOT EXISTS results (
        id SERIAL PRIMARY KEY,
        job_id INTEGER UNIQUE REFERENCES jobs(id) ON DELETE CASCADE,
        word_count INTEGER DEFAULT 0,
        paragraph_count INTEGER DEFAULT 0,
        keywords JSONB,
        processing_time INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database tables initialized successfully');
    client.release();
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  }
};

module.exports = {
  pool,
  testConnection,
  initializeDatabase
};
