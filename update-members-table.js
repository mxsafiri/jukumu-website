const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_24NTPgCqLKnY@ep-muddy-salad-a2t00btu-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function updateMembersTable() {
  try {
    console.log('🔗 Connecting to Neon PostgreSQL database...');
    
    const client = await pool.connect();
    console.log('✅ Successfully connected to database');
    
    // Add ID verification columns to members table
    console.log('📋 Adding ID verification columns to members table...');
    
    await client.query(`
      ALTER TABLE members 
      ADD COLUMN IF NOT EXISTS id_type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS id_number VARCHAR(100);
    `);
    
    console.log('✅ Members table updated successfully');
    
    // Verify the table structure
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'members'
      ORDER BY ordinal_position;
    `);
    
    console.log('📊 Members table columns:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    
    client.release();
    console.log('🎉 Database update completed successfully!');
    
  } catch (error) {
    console.error('❌ Database update failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

updateMembersTable();
