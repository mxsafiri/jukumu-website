import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();
    
    try {
      // First check if training_modules table exists and has data
      const modulesCheck = await client.query('SELECT COUNT(*) FROM training_modules');
      const moduleCount = parseInt(modulesCheck.rows[0].count);
      
      if (moduleCount === 0) {
        // Insert basic training modules first
        await client.query(`
          INSERT INTO training_modules (title, description, duration_hours, category, level) VALUES
          ('Uongozi wa Biashara', 'Jifunze jinsi ya kuongoza biashara yako kwa ufanisi', 2.0, 'Leadership', 'beginner'),
          ('Utunzaji wa Fedha', 'Mafunzo ya jinsi ya kutunza na kupanga fedha za biashara', 1.5, 'Finance', 'beginner'),
          ('Masoko na Uuzaji', 'Jinsi ya kupata na kuwashawishi wateja', 3.0, 'Marketing', 'intermediate')
          ON CONFLICT DO NOTHING
        `);
      }
      
      // Create training_lessons table
      await client.query(`
        CREATE TABLE IF NOT EXISTS training_lessons (
          id SERIAL PRIMARY KEY,
          training_module_id INTEGER REFERENCES training_modules(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          lesson_order INTEGER NOT NULL,
          duration_minutes INTEGER DEFAULT 15,
          lesson_type VARCHAR(50) DEFAULT 'text' CHECK (lesson_type IN ('text', 'video', 'quiz', 'interactive')),
          video_url VARCHAR(500),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Create lesson_progress table
      await client.query(`
        CREATE TABLE IF NOT EXISTS lesson_progress (
          id SERIAL PRIMARY KEY,
          member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
          lesson_id INTEGER REFERENCES training_lessons(id) ON DELETE CASCADE,
          completed BOOLEAN DEFAULT false,
          completed_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(member_id, lesson_id)
        )
      `);
      
      // Check if lessons already exist
      let lessonCount = 0;
      try {
        const existingLessons = await client.query('SELECT COUNT(*) FROM training_lessons');
        lessonCount = parseInt(existingLessons.rows[0].count);
      } catch (e) {
        // Table might not exist yet, that's ok
        lessonCount = 0;
      }
      
      if (lessonCount === 0) {
        // Get actual training modules from database
        const modulesResult = await client.query('SELECT id FROM training_modules ORDER BY id LIMIT 3');
        const moduleIds = modulesResult.rows.map(row => row.id);
        
        if (moduleIds.length === 0) {
          client.release();
          return NextResponse.json({
            success: false,
            error: 'No training modules found. Please create training modules first.'
          });
        }
        
        // Insert sample lessons using actual module IDs
        const lessons = [
          // Use first available module ID
          [moduleIds[0], 'Utangulizi wa Uongozi', `Katika somo hili, tutajifunza misingi ya uongozi wa biashara. Uongozi ni uwezo wa kuongoza na kuhamasisha watu ili kufikia malengo ya pamoja.

**Mambo Muhimu ya Uongozi:**
1. **Maono (Vision)** - Kuwa na maono wazi ya mahali unapotaka kufikia
2. **Uongozaji (Leadership)** - Kuwa mfano mzuri kwa wengine
3. **Mawasiliano** - Kujua jinsi ya kuwasiliana vizuri na timu yako
4. **Uamuzi** - Kuweza kufanya maamuzi magumu wakati wa shida

**Zoezi:**
Fikiria biashara yako. Ni maono gani unayo? Andika malengo matatu makuu unayotaka kufikia katika miezi sita ijayo.`, 1, 20, 'text'],
          
          [moduleIds[0], 'Jinsi ya Kuunda Timu Imara', `Timu imara ni msingi wa biashara yoyote ya mafanikio. Katika somo hili, tutajifunza jinsi ya kuunda na kudumisha timu inayofanya kazi vizuri.

**Hatua za Kuunda Timu Imara:**

1. **Chagua Watu Wazuri**
   - Tafuta watu wenye ujuzi unaohitajika
   - Hakikisha wana maadili mazuri

2. **Wape Mafunzo**
   - Waeleze vizuri kazi zao
   - Wape mafunzo ya kutosha

**Zoezi Vitendo:**
Orodhesha majukumu matano muhimu katika biashara yako.`, 2, 25, 'text'],
          
          [moduleIds[0], 'Udhibiti wa Gharama na Mapato', `Biashara yoyote ya mafanikio lazima ijue jinsi ya kudhibiti gharama na kuongeza mapato.

**Udhibiti wa Gharama:**

1. **Orodhesha Gharama Zote**
   - Kodi za nyumba/duka
   - Mishahara ya wafanyakazi

2. **Punguza Gharama Zisizohitajika**
   - Kagua gharama kila mwezi
   - Linganisha bei za wauzaji mbalimbali

**Zoezi:**
Tengeneza bajeti rahisi ya biashara yako kwa mwezi mmoja.`, 3, 30, 'text']
        ];
        
        for (const lesson of lessons) {
          await client.query(`
            INSERT INTO training_lessons (training_module_id, title, content, lesson_order, duration_minutes, lesson_type)
            VALUES ($1, $2, $3, $4, $5, $6)
          `, lesson);
        }
      }
      
      // Create indexes
      await client.query('CREATE INDEX IF NOT EXISTS idx_training_lessons_module ON training_lessons(training_module_id)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_lesson_progress_member ON lesson_progress(member_id)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson ON lesson_progress(lesson_id)');
      
      client.release();
      
      return NextResponse.json({
        success: true,
        message: 'Training lessons setup completed successfully',
        lessonsCreated: lessonCount === 0 ? 8 : 0,
        tablesCreated: ['training_lessons', 'lesson_progress'],
        indexesCreated: 3
      });
      
    } catch (dbError) {
      client.release();
      throw dbError;
    }
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
