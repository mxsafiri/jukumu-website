const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function updateMembersSchema() {
  const client = await pool.connect();
  
  try {
    console.log('Adding id_type and id_number columns to members table...');
    
    // Add id_type column if it doesn't exist
    await client.query(`
      ALTER TABLE members 
      ADD COLUMN IF NOT EXISTS id_type VARCHAR(50);
    `);
    
    // Add id_number column if it doesn't exist
    await client.query(`
      ALTER TABLE members 
      ADD COLUMN IF NOT EXISTS id_number VARCHAR(100);
    `);
    
    console.log('✅ Successfully added missing columns to members table');
    
    // Verify the columns were added
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'members' 
      AND column_name IN ('id_type', 'id_number')
      ORDER BY column_name;
    `);
    
    console.log('📋 Current columns:', result.rows);
    
  } catch (error) {
    console.error('❌ Error updating schema:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

updateMembersSchema()
  .then(() => {
    console.log('🎉 Schema update completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Schema update failed:', error);
    process.exit(1);
  });
