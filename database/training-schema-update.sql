-- Training lessons table
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
);

-- Lesson progress tracking
CREATE TABLE IF NOT EXISTS lesson_progress (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    lesson_id INTEGER REFERENCES training_lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(member_id, lesson_id)
);

-- Insert sample lessons for existing training modules
INSERT INTO training_lessons (training_module_id, title, content, lesson_order, duration_minutes, lesson_type) VALUES
-- Uongozi wa Biashara lessons
(1, 'Utangulizi wa Uongozi', 'Katika somo hili, tutajifunza misingi ya uongozi wa biashara. Uongozi ni uwezo wa kuongoza na kuhamasisha watu ili kufikia malengo ya pamoja.

**Mambo Muhimu ya Uongozi:**
1. **Maono (Vision)** - Kuwa na maono wazi ya mahali unapotaka kufikia
2. **Uongozaji (Leadership)** - Kuwa mfano mzuri kwa wengine
3. **Mawasiliano** - Kujua jinsi ya kuwasiliana vizuri na timu yako
4. **Uamuzi** - Kuweza kufanya maamuzi magumu wakati wa shida

**Zoezi:**
Fikiria biashara yako. Ni maono gani unayo? Andika malengo matatu makuu unayotaka kufikia katika miezi sita ijayo.', 1, 20, 'text'),

(1, 'Jinsi ya Kuunda Timu Imara', 'Timu imara ni msingi wa biashara yoyote ya mafanikio. Katika somo hili, tutajifunza jinsi ya kuunda na kudumisha timu inayofanya kazi vizuri.

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
Orodhesha majukumu matano muhimu katika biashara yako na fikiri ni aina gani ya mtu unahitaji kwa kila jukumu.', 2, 25, 'text'),

(1, 'Udhibiti wa Gharama na Mapato', 'Biashara yoyote ya mafanikio lazima ijue jinsi ya kudhibiti gharama na kuongeza mapato. Hii ni mojawapo ya kazi muhimu za kiongozi.

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

3. **Panga Bajeti**
   - Tengeneza bajeti ya kila mwezi
   - Fuata bajeti kwa makini
   - Kagua na urekebishe bajeti mara kwa mara

**Kuongeza Mapato:**
- Ongeza bei kwa busara
- Tafuta wateja wapya
- Uze bidhaa au huduma mpya
- Boresha ubora wa huduma

**Zoezi:**
Tengeneza bajeti rahisi ya biashara yako kwa mwezi mmoja. Orodhesha gharama zote na mapato unayotarajia.', 3, 30, 'text'),

-- Utunzaji wa Fedha lessons  
(2, 'Misingi ya Utunzaji wa Fedha', 'Utunzaji wa fedha ni mojawapo ya ujuzi muhimu zaidi katika biashara. Bila utunzaji mzuri wa fedha, hata biashara kubwa inaweza kuanguka.

**Kanuni za Msingi za Utunzaji wa Fedha:**

1. **Tenganisha Fedha za Biashara na za Binafsi**
   - Fungua akaunti ya benki ya biashara
   - Usitumie fedha za biashara kwa mahitaji ya nyumbani
   - Weka rekodi za kila malipo

2. **Weka Akiba**
   - Weka angalau 10% ya mapato kwa akiba
   - Weka fedha za dharura (angalau mshahara wa miezi 3)
   - Weka fedha za kuongeza biashara

3. **Fuatilia Mapato na Matumizi**
   - Andika kila shilingi unayopokea
   - Rekodi kila gharama unayolipa
   - Tengeneza ripoti ya kila wiki

**Mfano wa Utunzaji wa Fedha:**
Ikiwa unapata Tsh 500,000 kwa mwezi:
- Akiba: Tsh 50,000 (10%)
- Gharama za biashara: Tsh 300,000 (60%)
- Faida: Tsh 150,000 (30%)

**Zoezi:**
Hesabu mapato yako ya wiki iliyopita na ugawanye kwa makundi: akiba, gharama, na faida.', 1, 25, 'text'),

(2, 'Jinsi ya Kuweka Rekodi za Fedha', 'Kuweka rekodi sahihi za fedha ni muhimu sana kwa mafanikio ya biashara. Rekodi hizi zinakusaidia kujua hali ya biashara yako na kufanya maamuzi sahihi.

**Aina za Rekodi Muhimu:**

1. **Daftari la Mapato (Sales Book)**
   - Tarehe ya muuzaji
   - Jina la mteja (ikiwa inajulikana)
   - Bidhaa au huduma iliyouzwa
   - Kiasi cha fedha
   - Njia ya malipo (taslimu, M-Pesa, benki)

2. **Daftari la Matumizi (Expense Book)**
   - Tarehe ya gharama
   - Aina ya gharama
   - Kiasi kilicholipwa
   - Stakabadhi au risiti
   - Sababu ya gharama

3. **Daftari la Mizigo (Inventory Book)**
   - Bidhaa zilizopo
   - Idadi ya kila bidhaa
   - Bei ya ununuzi
   - Bei ya mauzo
   - Tarehe ya kuingia na kutoka

**Mfano wa Rekodi ya Siku Moja:**

**MAPATO - Tarehe: 15/09/2025**
- Unga wa mahindi (2kg) - Tsh 3,000
- Mchele (5kg) - Tsh 8,000
- Sukari (1kg) - Tsh 2,500
- **Jumla: Tsh 13,500**

**MATUMIZI - Tarehe: 15/09/2025**
- Nauli ya kwenda sokoni - Tsh 1,000
- Kodi ya duka - Tsh 5,000
- **Jumla: Tsh 6,000**

**FAIDA YA SIKU: Tsh 7,500**

**Zoezi:**
Weka rekodi za biashara yako kwa siku tatu za hivi karibuni. Tumia mfano hapo juu.', 2, 20, 'text'),

-- Masoko na Uuzaji lessons
(3, 'Kuelewa Wateja Wako', 'Ili kufanikiwa katika biashara, lazima ujue vizuri wateja wako. Kila bidhaa au huduma ina wateja maalum ambao wanahitaji kitu fulani.

**Jinsi ya Kuelewa Wateja:**

1. **Chunguza Mahitaji Yao**
   - Ni nini wanahitaji?
   - Ni wakati gani wanahitaji?
   - Ni kiasi gani wanaweza kulipa?
   - Ni wapi wanaishi au wanafanya kazi?

2. **Aina za Wateja**
   - **Wateja wa Kila Siku** - Wananunua mara kwa mara
   - **Wateja wa Msimu** - Wananunua wakati fulani tu
   - **Wateja wa Gharama Kubwa** - Wananunua vitu vya bei kubwa
   - **Wateja wa Bei Nafuu** - Wanatafuta bei rahisi

3. **Jinsi ya Kuwafikia**
   - Matangazo katika mitandao ya kijamii
   - Kuzungumza na marafiki na jamaa
   - Kuweka alama za biashara mahali panapofikika
   - Kushiriki katika hafla za kijamii

**Mfano:**
Ikiwa unauza nguo za watoto:
- **Wateja Wakuu:** Mama wenye watoto wa umri wa miaka 0-12
- **Mahitaji:** Nguo za ubora mzuri, bei nafuu, za kuvaa kila siku
- **Wakati:** Mwanzoni mwa mwaka (shule), sikukuu, misimu ya baridi
- **Mahali:** Sokoni, nyumbani, dukani

**Zoezi:**
Eleza wateja wako wakuu. Ni nani? Wanahitaji nini? Wanapatikana wapi? Unawezaje kuwafikia?', 1, 30, 'text'),

(3, 'Mbinu za Kuuza Kwa Ufanisi', 'Kuuza si tu kuweka bidhaa na kusubiri wateja. Kuna mbinu maalum za kuhamasisha wateja kununua na kurudi tena.

**Mbinu za Kuuza:**

1. **Onyesha Faida za Bidhaa**
   - Eleza jinsi bidhaa itakavyomsaidia mteja
   - Tumia mifano ya maisha ya kila siku
   - Onyesha tofauti na bidhaa zingine

2. **Weka Bei Zinazovutia**
   - Bei za jumla kwa wanunuzi wakubwa
   - Punguzo kwa wateja wa zamani
   - Ofa maalum kwa msimu fulani

3. **Huduma Bora**
   - Karibisha wateja kwa upole
   - Jibu maswali yao kwa uvumilivu
   - Hakikisha wameridhika kabla ya kuondoka

4. **Uuzaji wa Ziada (Upselling)**
   - Pendekeza bidhaa za ziada
   - Onyesha vitu vinavyoendana
   - Toa ofa za pamoja

**Mifano ya Mazungumzo ya Kuuza:**

**Mteja:** "Bei ya sukari ni ngapi?"
**Wewe:** "Sukari ya kilogram ni Tsh 2,500. Ni ya ubora wa juu na tamu sana. Ikiwa utanunua kilo 5, nitakupa bei ya Tsh 12,000 badala ya 12,500. Pia nina chai nzuri ambayo inaendana vizuri na sukari hii."

**Zoezi:**
Fikiria bidhaa moja unayouza. Andika mazungumzo ya kuuza yakionyesha faida za bidhaa na jinsi ya kuhamasisha mteja kununua.', 2, 25, 'text'),

(3, 'Kutumia Mitandao ya Kijamii Kwa Biashara', 'Mitandao ya kijamii ni njia bora na ya bei nafuu ya kutangaza biashara yako na kupata wateja wapya.

**Mitandao Muhimu:**

1. **WhatsApp Business**
   - Tengeneza akaunti ya biashara
   - Weka picha za bidhaa zako
   - Tumia "Status" kutangaza
   - Tengeneza vikundi vya wateja

2. **Facebook na Instagram**
   - Tengeneza ukurasa wa biashara
   - Pakia picha za ubora wa juu
   - Andika maelezo mazuri ya bidhaa
   - Jibu ujumbe haraka

3. **TikTok**
   - Tengeneza video fupi za kuvutia
   - Onyesha jinsi ya kutumia bidhaa
   - Tumia muziki na hashtags maarufu

**Kanuni za Kutangaza:**

1. **Picha Nzuri**
   - Tumia mwanga wa kutosha
   - Onyesha bidhaa wazi
   - Tumia mazingira safi

2. **Maandishi Mazuri**
   - Andika kwa lugha rahisi
   - Orodhesha faida za bidhaa
   - Weka bei na mawasiliano

3. **Kujibu Haraka**
   - Jibu ujumbe ndani ya dakika chache
   - Kuwa mpole na wa kirafiki
   - Toa taarifa kamili

**Mfano wa Chapisho:**
"🍚 MCHELE WA UBORA WA JUU! 🍚

✅ Mchele safi wa Mbeya
✅ Hauna vumbi wala mawe  
✅ Unapikika haraka
✅ Ladha tamu

💰 Bei: Tsh 1,800 kwa kilo
📞 Piga: 0700123456
📍 Mahali: Kariakoo, Dar es Salaam

#McheleWaUbora #BiasharaYetu #Kariakoo"

**Zoezi:**
Tengeneza chapisho la kutangaza bidhaa yako katika mitandao ya kijamii. Tumia mfano hapo juu.', 3, 35, 'text');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_training_lessons_module ON training_lessons(training_module_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_member ON lesson_progress(member_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson ON lesson_progress(lesson_id);
