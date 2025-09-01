const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_24NTPgCqLKnY@ep-muddy-salad-a2t00btu-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function clearDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🧹 Clearing all data from database...');
    
    // Clear all tables in correct order (respecting foreign key constraints)
    await client.query('DELETE FROM content_progress');
    await client.query('DELETE FROM business_reports');
    await client.query('DELETE FROM announcements');
    await client.query('DELETE FROM monthly_contributions');
    await client.query('DELETE FROM member_training');
    await client.query('DELETE FROM training_modules');
    await client.query('DELETE FROM investments');
    await client.query('DELETE FROM group_members');
    await client.query('DELETE FROM groups');
    await client.query('DELETE FROM members');
    await client.query('DELETE FROM educational_content');
    await client.query('DELETE FROM users WHERE email != \'admin@jukumu.co.tz\''); // Keep admin user
    await client.query('DELETE FROM system_settings');
    
    console.log('✅ All sample data cleared');
    
    // Reset sequences to start from 1
    await client.query('ALTER SEQUENCE users_id_seq RESTART WITH 2'); // Start from 2 since admin is ID 1
    await client.query('ALTER SEQUENCE members_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE groups_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE group_members_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE investments_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE training_modules_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE member_training_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE monthly_contributions_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE announcements_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE business_reports_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE educational_content_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE content_progress_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE system_settings_id_seq RESTART WITH 1');
    
    console.log('✅ Database sequences reset');
    
    // Insert essential system settings only
    await client.query(`
      INSERT INTO system_settings (setting_key, setting_value, description) VALUES
      ('default_equity_percentage', '30.00', 'Default equity percentage for investments'),
      ('minimum_monthly_contribution', '50000', 'Minimum monthly contribution in TSH'),
      ('minimum_group_size', '5', 'Minimum number of members required to form a group'),
      ('maximum_group_size', '20', 'Maximum number of members allowed in a group')
    `);
    
    console.log('✅ Essential system settings restored');
    console.log('🎉 Database is now clean and ready for production use!');
    
  } catch (error) {
    console.error('❌ Error clearing database:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

clearDatabase();
