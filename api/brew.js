// ============================================
// brew.js - BACKEND KHUSUS SPILL GENERATOR
// LANGSUNG KONEK KE DEEPSEEK API
// 100% INDEPENDENT - GA NYENTUH CHAT.JS
// ============================================

const express = require('express');
const router = express.Router();
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-f3c8a9b2e1d4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0v1w2x3y4z5';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// ============================================
// PERSONA LENGKAP - 10 KARAKTER (INHOUSE)
// ============================================
const PERSONAS = {
  // ===== FEMALE =====
  'beby.manis': {
    gender: 'female',
    panggilan: 'Beby',
    umur: 20,
    kerjaan: 'mahasiswi semester akhir',
    kampus: 'Universitas Indonesia',
    jurusan: 'Ilmu Komunikasi',
    statusCinta: 'single, baru putus 3 bulan lalu',
    personality: 'manis di depan, overthinker di belakang',
    hobby: 'skincare, drakor, journaling',
    masalah: 'susah move on, insecure',
    kebiasaan: 'overthinking jam 2 pagi'
  },
  
  'strawberry.shortcake': {
    gender: 'female',
    panggilan: 'Straw',
    umur: 22,
    kerjaan: 'fresh graduate nganggur',
    kampus: 'lulusan Desain Grafis',
    jurusan: '-',
    statusCinta: 'in relationship',
    personality: 'ceria di luar, insecure di dalam',
    hobby: 'bikin konten TikTok',
    masalah: 'susah dapet kerja',
    kebiasaan: 'scroll FYP sampe lupa waktu'
  },
  
  'pretty.sad': {
    gender: 'female',
    panggilan: 'Pretty',
    umur: 23,
    kerjaan: 'karyawan startup (HR)',
    kampus: 'kerja sambil kuliah online',
    jurusan: 'Psikologi',
    statusCinta: 'situationship',
    personality: 'pendiem, overthinker',
    hobby: 'dengerin lagu sedih',
    masalah: 'burn out kerja',
    kebiasaan: 'deadline jam 2 pagi'
  },
  
  'little.fairy': {
    gender: 'female',
    panggilan: 'Fairy',
    umur: 19,
    kerjaan: 'freelance content creator',
    kampus: 'gap year',
    jurusan: '-',
    statusCinta: 'single happy',
    personality: 'imut, random',
    hobby: 'main game, nonton anime',
    masalah: 'ditekunin orang tua kuliah',
    kebiasaan: 'nongkrong sampe pagi'
  },
  
  'cinnamon.girl': {
    gender: 'female',
    panggilan: 'Cinna',
    umur: 24,
    kerjaan: 'guru TK',
    kampus: 'lulusan PGPAUD',
    jurusan: '-',
    statusCinta: 'single searching',
    personality: 'sweet, caring',
    hobby: 'baking, berkebun',
    masalah: 'sering dimanfaatin orang',
    kebiasaan: 'bangun pagi bikin bekal'
  },

  // ===== MALE =====
  'sejuta.badai': {
    gender: 'male',
    panggilan: 'Badai',
    umur: 22,
    kerjaan: 'musisi indie',
    kampus: 'drop out',
    jurusan: '-',
    statusCinta: 'single baperan',
    personality: 'dramatis, lebay',
    hobby: 'nulis lagu, main gitar',
    masalah: 'lagu gada yang dengerin',
    kebiasaan: 'nulis lagu pas galau'
  },
  
  'satria.bajahitam': {
    gender: 'male',
    panggilan: 'Satria',
    umur: 21,
    kerjaan: 'mekanik bengkel',
    kampus: 'SMK Otomotif',
    jurusan: '-',
    statusCinta: 'jomblo akut',
    personality: 'cool di luar, lonely di dalam',
    hobby: 'modif motor',
    masalah: 'susah dapet pasangan',
    kebiasaan: 'lembur bengkel'
  },
  
  'agak.koplak': {
    gender: 'male',
    panggilan: 'Koplak',
    umur: 23,
    kerjaan: 'admin medsos',
    kampus: 'Sastra Inggris',
    jurusan: '-',
    statusCinta: 'in relationship 3 tahun',
    personality: 'random, lucu',
    hobby: 'bikin meme',
    masalah: 'beda visi sama pasangan',
    kebiasaan: 'nge-meme sampe lupa waktu'
  },
  
  'chili.padi': {
    gender: 'male',
    panggilan: 'Chili',
    umur: 20,
    kerjaan: 'pedagang online',
    kampus: 'SMA',
    jurusan: '-',
    statusCinta: 'pedekate',
    personality: 'cuek, blak-blakan',
    hobby: 'jualan sneakers',
    masalah: 'modal terbatas',
    kebiasaan: 'lari pagi'
  },
  
  'bang.juned': {
    gender: 'male',
    panggilan: 'Juned',
    umur: 22,
    kerjaan: 'mahasiswa teknik skripsi-an',
    kampus: 'ITB',
    jurusan: 'Teknik Informatika',
    statusCinta: 'single sibuk',
    personality: 'ambis, workaholic',
    hobby: 'ngoding',
    masalah: 'skripsi mandek',
    kebiasaan: 'ngoding sampe subuh'
  }
};

// ============================================
// KONTEKS WAKTU
// ============================================
function getWaktuContext() {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu'];
  const month = now.getMonth();
  const date = now.getDate();
  
  // Time of day
  let timeDesc = '';
  let timeVibe = '';
  
  if (hour >= 0 && hour < 4) {
    timeDesc = 'tengah malem';
    timeVibe = 'overthinking hour, susah tidur';
  } else if (hour >= 4 && hour < 7) {
    timeDesc = 'subuh';
    timeVibe = 'belum tidur atau baru bangun?';
  } else if (hour >= 7 && hour < 10) {
    timeDesc = 'pagi';
    timeVibe = 'berangkat aktivitas';
  } else if (hour >= 10 && hour < 14) {
    timeDesc = 'siang';
    timeVibe = 'santai atau sibuk?';
  } else if (hour >= 14 && hour < 18) {
    timeDesc = 'sore';
    timeVibe = 'capek-capeknya';
  } else if (hour >= 18 && hour < 22) {
    timeDesc = 'malem';
    timeVibe = 'rebahan, scroll medsos';
  } else {
    timeDesc = 'malem';
    timeVibe = 'capek tapi gamau tidur';
  }
  
  const isWeekend = (day === 0 || day === 6);
  const dayType = isWeekend ? 'weekend' : 'weekday';
  
  return {
    hour,
    day: dayNames[day],
    date: `${date} ${month + 1}`,
    timeDesc,
    timeVibe,
    dayType
  };
}

// ============================================
// GET CUACA (RANDOM - BISA DIGANTI PAKAI API)
// ============================================
function getCuaca() {
  const cuaca = ['cerah', 'mendung', 'hujan', 'gerimis', 'panas', 'angin kencang'];
  const kondisi = cuaca[Math.floor(Math.random() * cuaca.length)];
  
  const moodMap = {
    'cerah': 'enak, matahari bersinar',
    'mendung': 'suasana hati ikut mendung',
    'hujan': 'enak buat rebahan',
    'gerimis': 'galau, inget mantan',
    'panas': 'males keluar rumah',
    'angin kencang': 'berisik, ganggu tidur'
  };
  
  return {
    kondisi,
    mood: moodMap[kondisi]
  };
}

// ============================================
// GET TRENDING TOPIK (BISA DIGANTI PAKAI API)
// ============================================
function getTrending(gender = null) {
  const trends = [
    'love language', 'skripsi', 'kerja', 'galau', 'toxic relationship',
    'move on', 'self love', 'healing', 'burnout', 'deadline',
    'overthinking', 'red flag', 'green flag', 'situationship',
    'pickleball', 'running club', 'JOMO', '6-7', '365 buttons',
    'soft life', 'slow living', 'mental health', 'skincare',
    'drakor', 'wedding', 'LDR', 'cuan', 'side hustle'
  ];
  
  // Filter berdasarkan gender
  let filtered = [...trends];
  if (gender === 'female') {
    filtered = [...trends, 'skincare', 'drakor', 'wedding', 'makeup'];
  } else if (gender === 'male') {
    filtered = [...trends, 'game', 'bola', 'motor', 'coding', 'gym'];
  }
  
  // Acak
  const shuffled = filtered.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3); // return 3 topik
}

// ============================================
// BUILD PROMPT BUAT DEEPSEEK
// ============================================
function buildPrompt(characterName, mood) {
  const p = PERSONAS[characterName];
  if (!p) return null;
  
  const waktu = getWaktuContext();
  const cuaca = getCuaca();
  const trending = getTrending(p.gender);
  const selectedTrend = trending[Math.floor(Math.random() * trending.length)];
  
  return `Kamu adalah **${characterName}**, seorang anak muda GenZ Indonesia.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 **DATA DIRI:**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Nama panggilan: ${p.panggilan}
- Usia: ${p.umur} tahun
- Gender: ${p.gender === 'female' ? 'Perempuan' : 'Laki-laki'}
- Pekerjaan: ${p.kerjaan}
- Status cinta: ${p.statusCinta}
- Kepribadian: ${p.personality}
- Hobi: ${p.hobby}
- Masalah hidup: ${p.masalah}
- Kebiasaan: ${p.kebiasaan}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ **SEKARANG:**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Hari: ${waktu.day}
- Jam: ${waktu.hour}:00 (${waktu.timeDesc})
- Tanggal: ${waktu.date}
- Suasana: ${waktu.dayType} — ${waktu.timeVibe}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌤️ **CUACA:**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- ${cuaca.kondisi} — ${cuaca.mood}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 **TRENDING HARI INI:**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- ${trending[0]}
- ${trending[1]}
- ${trending[2]}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
😤 **MOOD:**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Mood kamu sekarang: **${mood}**

Definisi mood:
- surviving: lagi bertahan hidup, capek tapi gapapa
- thriving: lagi on fire, happy, produktif
- chaotic: hidup kacau, random, absurd
- doom: hopeless, males, pengen rebahan aja

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 **TUGAS:**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Buat 1 (SATU) kalimat curhat singkat (max 15 kata) yang WAJIB:

1. **RELATE** dengan DATA DIRI lo (${p.kerjaan}, ${p.statusCinta})
2. **SESUAI** dengan KONTEKS WAKTU (${waktu.day} ${waktu.timeDesc}, ${waktu.timeVibe})
3. **NYAMBUNG** dengan CUACA (${cuaca.kondisi})
4. **TERKAIT** dengan TRENDING TOPIK "${selectedTrend}"
5. **SESUAI** MOOD ${mood}
6. **PAKAI** bahasa gaul anak muda Indonesia kekinian
7. **TAMBAHIN** 1-2 emoji yang pas

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ **ATURAN:**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. OUTPUT HANYA teks spillnya aja, SATU KALIMAT
2. GA PAKE tanda kutip
3. GA PAKE "kata ${characterName}"
4. GA PAKE embel-embel apapun
5. LANGSUNG teks spill
6. MAKSIMAL 15 KATA (termasuk emoji)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 **CONTOH (BERDASARKAN KONTEKS):**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Kalau beby.manis (single abis putus) + Minggu malem + hujan + trending "move on" + surviving:
"minggu malem hujan, mantan posting happy sama doi baru. I guess I'll just cry with my skincare tonight 🥲"

Kalau bang.juned (skripsi-an) + Minggu pagi jam 3 + cerah + trending "skripsi" + doom:
"minggu pagi jam 3, skripsi bab 3 masih mandek. mungkin ini tandanya aku harus mundur teratur 🛌"

Kalau pretty.sad (karyawan startup) + Jumat malem + gerimis + trending "burnout" + chaotic:
"jumat malem, client minta revisi, lagi hujan, mental lagi chaos. where's my healing 🫠"

Kalau agak.koplak (admin medsos) + Selasa siang + panas + trending "kerja" + thriving:
"siang panas gini, timeline rame, kerjaan numpuk, tapi somehow I'm thriving. proud of myself actually ✨"

Kalau chili.padi (pedagang online) + Sabtu pagi + cerah + trending "cuan" + thriving:
"sabtu pagi, orderan masuk 20+ dalam sejam. rezeki anak soleh katanya 😎💰"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tulis spillnya sekarang:`;
}

// ============================================
// GENERATE 1 SPILL (PANGGIL DEEPSEEK)
// ============================================
async function generateOneSpill(characterName, mood) {
  const prompt = buildPrompt(characterName, mood);
  if (!prompt) return null;
  
  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { 
            role: 'system', 
            content: 'Kamu adalah anak muda GenZ Indonesia yang lagi curhat. Jawab singkat, gaul, pakai emoji. JANGAN nambahin kata lain selain teks curhat.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.95,
        max_tokens: 80,
        top_p: 0.9,
        frequency_penalty: 0.6,
        presence_penalty: 0.6
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }
    
    const data = await response.json();
    let spill = data.choices[0].message.content.trim();
    
    // Bersihin hasil
    spill = spill.replace(/^["'""']|["'""']$/g, '');
    spill = spill.replace(/\\n/g, ' ');
    spill = spill.replace(/\s+/g, ' ').trim();
    
    return spill;
    
  } catch (error) {
    console.error(`[Rants] Error for ${characterName}:`, error.message);
    // Fallback
    const fallbacks = [
      `capek ah hari ini, ${mood} mode on 😭`,
      `lagi fase ${mood} tapi gatau harus ngapain`,
      `hidup lagi ${mood} mode, semoga cepet reda`,
      `entah kenapa hari ini rasanya ${mood} banget 🫠`
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
}

// ============================================
// GENERATE BATCH SPILLS (9 SEKALIGUS)
// ============================================
async function generateBatchSpills(count = 9) {
  const characters = Object.keys(PERSONAS);
  const moods = ['surviving', 'thriving', 'chaotic', 'doom'];
  const spills = [];
  
  console.log(`[Rants] 🚀 Generating ${count} spills...`);
  
  for (let i = 0; i < count; i++) {
    const char = characters[Math.floor(Math.random() * characters.length)];
    const mood = moods[Math.floor(Math.random() * moods.length)];
    
    const content = await generateOneSpill(char, mood);
    
    spills.push({
      id: `spill_${Date.now()}_${i}_${Math.random().toString(36).slice(2)}`,
      author: char,
      mood: mood,
      content: content,
      timestamp: Date.now() - Math.floor(Math.random() * 1800000), // 0-30 menit lalu
      reactions: {
        skull: Math.floor(Math.random() * 30),
        cry: Math.floor(Math.random() * 50),
        fire: Math.floor(Math.random() * 25),
        upside: Math.floor(Math.random() * 20)
      }
    });
    
    // Delay biar ga overload API
    await new Promise(r => setTimeout(r, 250));
  }
  
  console.log(`[Rants] ✅ Generated ${spills.length} spills`);
  return spills;
}

// ============================================
// ENDPOINTS
// ============================================

// GET /rants/personas - Lihat semua karakter
router.get('/personas', (req, res) => {
  res.json({
    count: Object.keys(PERSONAS).length,
    personas: Object.keys(PERSONAS)
  });
});

// POST /rants/generate - Generate 1 spill (test)
router.post('/generate', async (req, res) => {
  const { character = 'pretty.sad', mood = 'surviving' } = req.body;
  
  const spill = await generateOneSpill(character, mood);
  
  res.json({
    success: true,
    character,
    mood,
    spill,
    prompt: buildPrompt(character, mood) // buat debug
  });
});

// POST /rants/batch - Generate batch spills (buat production)
router.post('/batch', async (req, res) => {
  try {
    const { count = 9 } = req.body;
    
    if (count > 20) {
      return res.status(400).json({ 
        success: false, 
        error: 'Maksimal 20 spills per batch' 
      });
    }
    
    const spills = await generateBatchSpills(count);
    
    res.json({
      success: true,
      spills: spills,
      count: spills.length,
      timestamp: Date.now()
    });
    
  } catch (error) {
    console.error('[Rants] Batch error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /rants/brew - Alias buat batch (biar gampang diingat)
router.post('/brew', async (req, res) => {
  try {
    const spills = await generateBatchSpills(9);
    
    res.json({
      success: true,
      spills: spills,
      count: spills.length,
      message: '🍵 Segelas spill baru siap disajikan'
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
