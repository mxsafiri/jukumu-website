const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function applyJoinRequestsSchema() {
  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    
    // Read the schema file
    const schemaPath = path.join(__dirname, 'database', 'join-requests-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Applying join requests schema...');
    await client.query(schema);
    
    console.log('✅ Join requests schema applied successfully!');
    
    // Test if table was created
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'join_requests'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ join_requests table confirmed to exist');
    } else {
      console.log('❌ join_requests table not found');
    }
    
    client.release();
    
  } catch (error) {
    console.error('❌ Error applying schema:', error);
  } finally {
    await pool.end();
  }
}

applyJoinRequestsSchema();
