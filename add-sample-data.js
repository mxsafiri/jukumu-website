const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function addSampleData() {
  const client = await pool.connect();
  
  try {
    console.log('Adding sample training modules...');
    
    // Add training modules
    const trainingModules = [
      ['Msingi wa Biashara', 'Mafunzo ya kimsingi kuhusu jinsi ya kuanza na kuendesha biashara yako.', 2.5, 'Biashara', 'beginner', 'active'],
      ['Uongozi wa Kikundi', 'Jinsi ya kuongoza kundi la wanawake kwa ufanisi na kufikia malengo.', 3.0, 'Uongozi', 'intermediate', 'active'],
      ['Usimamizi wa Fedha', 'Mafunzo ya jinsi ya kusimamia fedha za kibinafsi na za biashara.', 2.0, 'Fedha', 'beginner', 'active'],
      ['Masoko ya Dijiti', 'Jinsi ya kutumia mitandao ya kijamii na teknolojia kuuza bidhaa zako.', 1.5, 'Teknolojia', 'intermediate', 'active'],
      ['Ubunifu wa Bidhaa', 'Jinsi ya kubuni bidhaa mpya na kuongeza thamani kwa wateja wako.', 2.5, 'Biashara', 'advanced', 'active']
    ];
    
    for (const module of trainingModules) {
      try {
        await client.query(`
          INSERT INTO training_modules (title, description, duration_hours, category, level, status) 
          VALUES ($1, $2, $3, $4, $5, $6)
        `, module);
      } catch (error) {
        if (error.code !== '23505') { // Ignore duplicate key errors
          throw error;
        }
      }
    }

    console.log('Adding sample groups...');
    
    // Add sample groups
    const sampleGroups = [
      ['Kundi la Kilimo Mwanza', '2024-01-15', 2500000, 50000, 'active'],
      ['Kundi la Ufugaji Arusha', '2024-02-20', 1800000, 40000, 'active'],
      ['Kundi la Biashara DSM', '2024-03-10', 3200000, 60000, 'active']
    ];
    
    for (const group of sampleGroups) {
      try {
        await client.query(`
          INSERT INTO groups (name, founded_date, total_investment, monthly_contribution, status) 
          VALUES ($1, $2, $3, $4, $5)
        `, group);
      } catch (error) {
        if (error.code !== '23505') { // Ignore duplicate key errors
          throw error;
        }
      }
    }

    console.log('Adding sample investments...');
    
    // Get group IDs for investments
    const groupsResult = await client.query('SELECT id, name FROM groups LIMIT 3');
    const groups = groupsResult.rows;

    if (groups.length > 0) {
      for (const group of groups) {
        try {
          await client.query(`
            INSERT INTO investments (group_id, amount, equity_percentage, investment_date, status, expected_return, actual_return) VALUES
            ($1, $2, 30.00, CURRENT_DATE - INTERVAL '30 days', 'active', $3, $4)
          `, [
            group.id,
            group.name.includes('Kilimo') ? 250000 : group.name.includes('Ufugaji') ? 180000 : 320000,
            group.name.includes('Kilimo') ? 37500 : group.name.includes('Ufugaji') ? 27000 : 48000,
            group.name.includes('Kilimo') ? 15000 : group.name.includes('Ufugaji') ? 8000 : 25000
          ]);
        } catch (error) {
          if (error.code !== '23505') { // Ignore duplicate key errors
            throw error;
          }
        }
      }
    }

    console.log('Sample data added successfully!');
    
  } catch (error) {
    console.error('Error adding sample data:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

addSampleData();
