// ============================================
// brew.js - FULL VERSION 500+ LINES
// DENGAN SEMUA FITUR YANG LO MINTA
// ============================================

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// ============================================
// SUPABASE CONFIG
// ============================================
const SUPABASE_URL = 'https://fuovfrdicdhnlymnacpz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1b3ZmcmRpY2Robmx5bW5hY3B6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMjYxMzEsImV4cCI6MjA4MjYwMjEzMX0.oX4fVTEIWiRG2NaNJJKOV8dTnSHWhicLVMIFzZUl1o0';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================
// DEEPSEEK CONFIG
// ============================================
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-88746b93303b4e82998d680096d9bbe7';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// ============================================
// PERSONA LENGKAP - 10 KARAKTER
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
        timeVibe = 'overthinking hour, susah tidur, mata melek tapi badan capek';
    } else if (hour >= 4 && hour < 7) {
        timeDesc = 'subuh';
        timeVibe = 'belum tidur atau baru bangun? either way, sunnah nya lumayan';
    } else if (hour >= 7 && hour < 10) {
        timeDesc = 'pagi';
        timeVibe = 'berangkat aktivitas, macet-macetnya, ngantuk di kendaraan umum';
    } else if (hour >= 10 && hour < 14) {
        timeDesc = 'siang';
        timeVibe = 'panas, laper, males gerak tapi kerjaan numpuk';
    } else if (hour >= 14 && hour < 18) {
        timeDesc = 'sore';
        timeVibe = 'capek-capeknya, pengen rebahan tapi jam kantor belum abis';
    } else if (hour >= 18 && hour < 22) {
        timeDesc = 'malem';
        timeVibe = 'waktunya healing, tapi malah scroll medsos liat mantan bahagia';
    } else {
        timeDesc = 'malem';
        timeVibe = 'capek tapi gamau tidur, rasanya hari ini kurang panjang';
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
// GET CUACA (RANDOM)
// ============================================
function getCuaca() {
    const cuaca = ['cerah', 'mendung', 'hujan', 'gerimis', 'panas', 'angin kencang'];
    const kondisi = cuaca[Math.floor(Math.random() * cuaca.length)];

    const moodMap = {
        'cerah': 'enak, matahari bersinar, tapi panas banget kalo keluar',
        'mendung': 'suasana hati ikut mendung, pengennya rebahan sambil dengerin lagu sedih',
        'hujan': 'enak buat rebahan, tapi sedih kalo inget jemuran belum diangkat',
        'gerimis': 'galau, inget mantan, apalagi kalo dengerin hujan sambil sendiri',
        'panas': 'males keluar rumah, keringetan, AC atau kipas jadi penyelamat',
        'angin kencang': 'berisik, ganggu tidur, debu kemana-mana'
    };

    return {
        kondisi,
        mood: moodMap[kondisi]
    };
}

// ============================================
// GET TRENDING TOPIK
// ============================================
function getTrending(gender = null) {
    const trends = [
        'love language', 'skripsi', 'kerja', 'galau', 'toxic relationship',
        'move on', 'self love', 'healing', 'burnout', 'deadline',
        'overthinking', 'red flag', 'green flag', 'situationship',
        'pickleball', 'running club', 'JOMO', '6-7', '365 buttons',
        'soft life', 'slow living', 'mental health', 'skincare',
        'drakor', 'wedding', 'LDR', 'cuan', 'side hustle', 'financial crisis',
        'kerja remote', 'WFH', 'RTO', 'phk', 'resign', 'fomo', 'jomblo'
    ];

    let filtered = [...trends];
    if (gender === 'female') {
        filtered = [...trends, 'skincare', 'drakor', 'wedding', 'makeup', 'body shaming', 'beauty standards'];
    } else if (gender === 'male') {
        filtered = [...trends, 'game', 'bola', 'motor', 'coding', 'gym', 'barbel', 'whey protein'];
    }

    const shuffled = filtered.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
}

// ============================================
// BUILD PROMPT - VERSI LENGKAP DENGAN VARIASI PANJANG
// ============================================
function buildPrompt(characterName, mood) {
    const p = PERSONAS[characterName];
    if (!p) return null;

    // VARIASI PANJANG YANG LO MINTA (7, 18, 27, 36)
    const wordLengths = [7, 18, 27, 36];
    const targetWords = wordLengths[Math.floor(Math.random() * wordLengths.length)];
    const isLongPost = targetWords > 20;
    const isVeryLongPost = targetWords > 30;

    const waktu = getWaktuContext();
    const cuaca = getCuaca();
    const trending = getTrending(p.gender);
    const selectedTrend = trending[Math.floor(Math.random() * trending.length)];

    return `Kamu adalah **${characterName}**, seorang anak muda GenZ Indonesia ASLI (bukan AI).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 **DATA DIRI (HIDUP DAN REAL):**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Nama panggilan: ${p.panggilan} (temen-temen manggil gitu)
- Usia: ${p.umur} tahun — fase hidup lagi galau-galaunya
- Gender: ${p.gender === 'female' ? 'Perempuan' : 'Laki-laki'}
- Pekerjaan: ${p.kerjaan} — kadang semangat, kadang males
- Status cinta: ${p.statusCinta} — complicated banget sumpah
- Kepribadian: ${p.personality} — gabisa dipungkiri
- Hobi: ${p.hobby} — pelarian dari realita
- Masalah hidup: ${p.masalah} — lagi struggle parah
- Kebiasaan: ${p.kebiasaan} — udah kayak ritual

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ **KONTEKS WAKTU (SEKARANG):**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Hari: ${waktu.day} (${waktu.dayType})
- Jam: ${waktu.hour}:00 (${waktu.timeDesc})
- Tanggal: ${waktu.date}
- Suasana hati: ${waktu.timeVibe}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌤️ **CUACA SEKARANG:**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- ${cuaca.kondisi} — ${cuaca.mood}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 **YANG LAGI TRENDING:**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- ${trending[0]}
- ${trending[1]}
- ${trending[2]}
- Yang paling relate sama hidup lo: **${selectedTrend}**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
😤 **MOOD LO SEKARANG:**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Mood: **${mood}** (${mood === 'surviving' ? 'bertahan hidup, capek tp gapapa' : mood === 'thriving' ? 'lagi on fire, happy, cuan' : mood === 'chaotic' ? 'hidup kacau, absurd, random abis' : 'doom, hopeless, males gerak'})

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 **TUGAS LO:**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Buat SATU curhat dengan panjang **${targetWords} KATA** (bisa kurang/lebih 3-4 kata, yang penting natural) yang WAJIB relate dengan:

✅ DATA DIRI lo (${p.kerjaan}, ${p.statusCinta}, ${p.masalah})
✅ KONTEKS WAKTU (${waktu.day} ${waktu.timeDesc}, ${waktu.timeVibe})
✅ CUACA (${cuaca.kondisi})
✅ TRENDING TOPIK (${selectedTrend})
✅ MOOD lo (${mood})

${isVeryLongPost ? '📝 Lo lagi banyak pikiran, ceritanya lebih detail, kasih konteks, kayak nge-tweet panjang' : isLongPost ? '📝 Lumayan panjang, bisa cerita sedikit lebih dalam' : '📝 Straight to the point, kayak orang buru-buru curhat'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 **GAYA BAHASA:**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. PAKE BAHASA GAUL ANAK JAKSEL (campur Indonesia-Inggris, kayak "literally", "which is", "btw", "sumpah", "banget", "sih", "deh")
2. HARUS ADA 1-3 EMOJI YANG PAS (ga dipaksakan, natural aja)
3. JANGAN KAYAK AI — lo manusia beneran yang lagi stres/ seneng/ galau
4. RELATABLE — orang lain baca bisa ngerasa "wah gue juga ngalamin"
5. SPESIFIK — kasih detail kecil (misal: "skripsi bab 3", "client minta revisi jam 11 malem", "orderan sneakers laku 15")

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚫 **LARANGAN:**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ JANGAN pake tanda kutip ("") di awal/akhir
❌ JANGAN nambahin "kata ${characterName}" atau embel-embel
❌ JANGAN pake format kayak "Curhat:" atau "Spill:"
❌ JANGAN jelasin panjang lebar di luar teks curhat
✅ LANGSUNG tulis teks curhatnya aja

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 **CONTOH PANJANG VARIATIF:**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔹 **PENDEK (7-10 kata):**
"skripsi bab 3 error terus, dosen pembimbingnya ga bales 🥲"
"client minta revisi jam 11 malem, deadline besok pagi. this is fine 🔥"
"motor mogok, dompet tipis, pacar ngambek. triple combo 🫠"

🔹 **SEDANG (15-20 kata):**
"akhirnya dapet panggilan interview setelah ngelamar 50+ tempat, semoga lancar ya Allah, ini kesempatan terakhir sebelum nganggur 6 bulan ✨"
"minggu malem gini sendirian di kos, liat story mantan lagi jalan sama doi baru. I guess I'll just cry with my skincare tonight 😭"

🔹 **PANJANG (25-30 kata):**
"selasa siang panas banget, client nanyain progress, laptop mau lowbat, listrik mati, mental lagi chaos. ditambah inget kalo semalem lupa sholat isya. hidup emang kadang suka bikin kita nanya: ini ujian atau lagi di-prank sama takdir sih 🫠"

🔹 **SANGAT PANJANG (35-40 kata):**
"minggu pagi jam 3, gara-gara overthinking mikirin masa depan, jadi buka-buka IG dan liat temen-temen pada nikah, beli rumah, punya mobil baru, sementara gue masih struggle sama skripsi bab 3 yang ga selesai-selesai, ditambah dompet lagi tipis karena minggu kemarin gajian tapi langsung habis buat bayar utang. pengen rebah aja tapi mata gamau merem, maybe this is my villain arc idk 🛌💔"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TULIS CURHATNYA (${targetWords} kata, ±3 kata fleksibel):
`;
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
                        content: 'Kamu adalah anak muda GenZ Indonesia ASLI yang lagi curhat di sosial media. BUKAN AI. BAHASA LO: casual, gaul, campur Indonesia-Inggris, pake "sih/deh/ih/weh". LANGSUNG tulis curhatnya.'
                    },
                    { role: 'user', content: prompt }
                ],
                temperature: 1.2,
                max_tokens: 200,
                top_p: 0.95,
                frequency_penalty: 0.8,
                presence_penalty: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        let spill = data.choices[0].message.content.trim();

        // Bersihin hasil
        spill = spill.replace(/^["'""']|["'""']$/g, '');
        spill = spill.replace(/\\n/g, ' ');
        spill = spill.replace(/\s+/g, ' ').trim();

        return spill;

    } catch (error) {
        console.error(`[Brew] Error untuk ${characterName}:`, error.message);

        // Fallback variatif
        const fallbacks = [
            `capek ah hari ini, ${mood} mode on. skripsi bab 3 error terus, dosennya kayak hantu jarang muncul 😭`,
            `lagi fase ${mood} tapi gatau harus ngapain. minggu malem gini enaknya nangis sambil dengerin lagu sedih sambil inget mantan`,
            `hidup lagi ${mood} mode. tadi pagi udah niat produktif, eh malah scroll tiktok 3 jam. weh gitu aja gitu 🫠`,
            `entah kenapa hari ini rasanya ${mood} banget. mungkin efek hujan dari tadi siang, jadi makin pengen dipeluk tapi gaada yang nyamain`
        ];
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
}

// ============================================
// GENERATE BATCH + SAVE TO SUPABASE
// ============================================
async function generateAndSaveSpills(count = 9) {
    const characters = Object.keys(PERSONAS);
    const moods = ['surviving', 'thriving', 'chaotic', 'doom'];
    const spills = [];
    const aiEntriesToInsert = [];

    console.log(`[Brew] 🚀 Generating ${count} AI spills dengan variasi panjang 7, 18, 27, 36 kata...`);

    for (let i = 0; i < count; i++) {
        const char = characters[Math.floor(Math.random() * characters.length)];
        const mood = moods[Math.floor(Math.random() * moods.length)];

        const content = await generateOneSpill(char, mood);

        const spill = {
            id: `ai_${Date.now()}_${i}_${Math.random().toString(36).slice(2)}`,
            author: char,
            mood: mood,
            content: content,
            timestamp: Date.now() - (i * 60000)
        };

        spills.push(spill);

        // Siapin buat disimpan ke Supabase
        aiEntriesToInsert.push({
            user_id: 'ai_system',
            content: content,
            mood: mood,
            reactions: {
                skull: Math.floor(Math.random() * 15) + 2,
                cry: Math.floor(Math.random() * 25) + 5,
                fire: Math.floor(Math.random() * 20) + 1,
                upside: Math.floor(Math.random() * 8) + 1
            },
            created_at: new Date().toISOString(),
            is_ai: true
        });

        // Delay biar ga overload API
        await new Promise(r => setTimeout(r, 200));
    }

    // SIMPAN KE SUPABASE
    try {
        const { error, data } = await supabase
            .from('entries')
            .insert(aiEntriesToInsert)
            .select();

        if (error) {
            console.error('[Brew] Gagal simpan ke Supabase:', error.message);
        } else {
            console.log(`[Brew] ✅ ${aiEntriesToInsert.length} AI spills disimpan ke Supabase`);

            // Bersihin AI entries lama (keep 30 terbaru)
            const { error: cleanupError } = await supabase
                .rpc('delete_old_ai_entries', { keep_count: 30 });

            if (cleanupError) {
                console.log('[Brew] Cleanup skip:', cleanupError.message);
            } else {
                console.log('[Brew] 🧹 AI entries lama dibersihkan');
            }
        }
    } catch (dbError) {
        console.error('[Brew] Database error:', dbError.message);
    }

    console.log(`[Brew] ✅ Selesai generate ${spills.length} spills dengan variasi panjang`);
    return spills;
}

// ============================================
// ENDPOINT /brew
// ============================================
router.post('/brew', async (req, res) => {
    try {
        const { count = 9 } = req.body;

        if (count > 20) {
            return res.status(400).json({
                success: false,
                error: 'Maksimal 20 spills per batch'
            });
        }

        const spills = await generateAndSaveSpills(count);

        res.json({
            success: true,
            spills: spills,
            count: spills.length,
            message: '🍵 AI spills siap dengan variasi panjang 7, 18, 27, 36 kata!'
        });

    } catch (error) {
        console.error('[Brew] Error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Endpoint test
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Brew API is running with full personas',
        personas: Object.keys(PERSONAS).length,
        endpoints: ['POST /brew', 'GET /test']
    });
});

module.exports = router;
