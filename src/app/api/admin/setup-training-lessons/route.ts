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
      const existingLessons = await client.query('SELECT COUNT(*) FROM training_lessons');
      const lessonCount = parseInt(existingLessons.rows[0].count);
      
      if (lessonCount === 0) {
        // Insert sample lessons
        const lessons = [
          // Uongozi wa Biashara lessons (module 1)
          [1, 'Utangulizi wa Uongozi', `Katika somo hili, tutajifunza misingi ya uongozi wa biashara. Uongozi ni uwezo wa kuongoza na kuhamasisha watu ili kufikia malengo ya pamoja.

**Mambo Muhimu ya Uongozi:**
1. **Maono (Vision)** - Kuwa na maono wazi ya mahali unapotaka kufikia
2. **Uongozaji (Leadership)** - Kuwa mfano mzuri kwa wengine
3. **Mawasiliano** - Kujua jinsi ya kuwasiliana vizuri na timu yako
4. **Uamuzi** - Kuweza kufanya maamuzi magumu wakati wa shida

**Zoezi:**
Fikiria biashara yako. Ni maono gani unayo? Andika malengo matatu makuu unayotaka kufikia katika miezi sita ijayo.`, 1, 20, 'text'],
          
          [1, 'Jinsi ya Kuunda Timu Imara', `Timu imara ni msingi wa biashara yoyote ya mafanikio. Katika somo hili, tutajifunza jinsi ya kuunda na kudumisha timu inayofanya kazi vizuri.

**Hatua za Kuunda Timu Imara:**

1. **Chagua Watu Wazuri**
   - Tafuta watu wenye ujuzi unaohitajika
   - Hakikisha wana maadili mazuri
   - Wachague wale wanaoweza kufanya kazi na wengine

2. **Wape Mafunzo**
   - Waeleze vizuri kazi zao
   - Wape mafunzo ya kutosha
   - Waongeze ujuzi wao mara kwa mara

3. **Wahamasie**
   - Wape malengo wazi
   - Washukuru kwa kazi nzuri
   - Waongeze mishahara na zawadi

**Zoezi Vitendo:**
Orodhesha majukumu matano muhimu katika biashara yako na fikiri ni aina gani ya mtu unahitaji kwa kila jukumu.`, 2, 25, 'text'],
          
          [1, 'Udhibiti wa Gharama na Mapato', `Biashara yoyote ya mafanikio lazima ijue jinsi ya kudhibiti gharama na kuongeza mapato. Hii ni mojawapo ya kazi muhimu za kiongozi.

**Udhibiti wa Gharama:**

1. **Orodhesha Gharama Zote**
   - Kodi za nyumba/duka
   - Mishahara ya wafanyakazi
   - Malighafi za umeme, maji, simu
   - Gharama za malighafi

2. **Punguza Gharama Zisizohitajika**
   - Kagua gharama kila mwezi
   - Linganisha bei za wauzaji mbalimbali
   - Tumia teknolojia kupunguza gharama

**Zoezi:**
Tengeneza bajeti rahisi ya biashara yako kwa mwezi mmoja. Orodhesha gharama zote na mapato unayotarajia.`, 3, 30, 'text'],
          
          // Utunzaji wa Fedha lessons (module 2)
          [2, 'Misingi ya Utunzaji wa Fedha', `Utunzaji wa fedha ni mojawapo ya ujuzi muhimu zaidi katika biashara. Bila utunzaji mzuri wa fedha, hata biashara kubwa inaweza kuanguka.

**Kanuni za Msingi za Utunzaji wa Fedha:**

1. **Tenganisha Fedha za Biashara na za Binafsi**
   - Fungua akaunti ya benki ya biashara
   - Usitumie fedha za biashara kwa mahitaji ya nyumbani
   - Weka rekodi za kila malipo

2. **Weka Akiba**
   - Weka angalau 10% ya mapato kwa akiba
   - Weka fedha za dharura (angalau mshahara wa miezi 3)
   - Weka fedha za kuongeza biashara

**Zoezi:**
Hesabu mapato yako ya wiki iliyopita na ugawanye kwa makundi: akiba, gharama, na faida.`, 1, 25, 'text'],
          
          [2, 'Jinsi ya Kuweka Rekodi za Fedha', `Kuweka rekodi sahihi za fedha ni muhimu sana kwa mafanikio ya biashara. Rekodi hizi zinakusaidia kujua hali ya biashara yako na kufanya maamuzi sahihi.

**Aina za Rekodi Muhimu:**

1. **Daftari la Mapato (Sales Book)**
   - Tarehe ya muuzaji
   - Jina la mteja (ikiwa inajulikana)
   - Bidhaa au huduma iliyouzwa
   - Kiasi cha fedha

**Zoezi:**
Weka rekodi za biashara yako kwa siku tatu za hivi karibuni.`, 2, 20, 'text'],
          
          // Masoko na Uuzaji lessons (module 3)
          [3, 'Kuelewa Wateja Wako', `Ili kufanikiwa katika biashara, lazima ujue vizuri wateja wako. Kila bidhaa au huduma ina wateja maalum ambao wanahitaji kitu fulani.

**Jinsi ya Kuelewa Wateja:**

1. **Chunguza Mahitaji Yao**
   - Ni nini wanahitaji?
   - Ni wakati gani wanahitaji?
   - Ni kiasi gani wanaweza kulipa?
   - Ni wapi wanaishi au wanafanya kazi?

**Zoezi:**
Eleza wateja wako wakuu. Ni nani? Wanahitaji nini? Wanapatikana wapi?`, 1, 30, 'text'],
          
          [3, 'Mbinu za Kuuza Kwa Ufanisi', `Kuuza si tu kuweka bidhaa na kusubiri wateja. Kuna mbinu maalum za kuhamasisha wateja kununua na kurudi tena.

**Mbinu za Kuuza:**

1. **Onyesha Faida za Bidhaa**
   - Eleza jinsi bidhaa itakavyomsaidia mteja
   - Tumia mifano ya maisha ya kila siku
   - Onyesha tofauti na bidhaa zingine

**Zoezi:**
Fikiria bidhaa moja unayouza. Andika mazungumzo ya kuuza yakionyesha faida za bidhaa.`, 2, 25, 'text'],
          
          [3, 'Kutumia Mitandao ya Kijamii Kwa Biashara', `Mitandao ya kijamii ni njia bora na ya bei nafuu ya kutangaza biashara yako na kupata wateja wapya.

**Mitandao Muhimu:**

1. **WhatsApp Business**
   - Tengeneza akaunti ya biashara
   - Weka picha za bidhaa zako
   - Tumia "Status" kutangaza

**Zoezi:**
Tengeneza chapisho la kutangaza bidhaa yako katika mitandao ya kijamii.`, 3, 35, 'text']
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
