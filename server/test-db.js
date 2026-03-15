const { Pool } = require('pg');
require('dotenv').config();

const testConfig = {
  host: 'dpg-d6rahh450q8c73bv32g0-a.oregon-postgres.render.com',
  user: 'sniperthink_db_l6ot_user',
  password: 'DRQI5K1c3vpydRaKKyCeVr4gcgFsg6NJ',
  database: 'sniperthink_db_l6ot',
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  }
};

const pool = new Pool(testConfig);

const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    client.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
};

testConnection();
