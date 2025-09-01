const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkMembers() {
  try {
    console.log('🔗 Connecting to Neon PostgreSQL database...');
    
    const client = await pool.connect();
    console.log('✅ Successfully connected to database');
    
    // Check recent members
    const result = await client.query(`
      SELECT id, full_name, email, phone, created_at, status 
      FROM members 
      ORDER BY created_at DESC 
      LIMIT 10;
    `);
    
    console.log('📊 Recent members in database:');
    if (result.rows.length === 0) {
      console.log('❌ No members found in database');
    } else {
      result.rows.forEach((member, index) => {
        console.log(`${index + 1}. ${member.full_name} (${member.email}) - ${member.status} - ${member.created_at}`);
      });
    }
    
    // Check total count
    const countResult = await client.query('SELECT COUNT(*) FROM members;');
    console.log(`\n📈 Total members: ${countResult.rows[0].count}`);
    
    client.release();
    
  } catch (error) {
    console.error('❌ Database check failed:', error);
  } finally {
    await pool.end();
  }
}

checkMembers();
