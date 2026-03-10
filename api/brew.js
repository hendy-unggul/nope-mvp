const express = require('express');
const router = express.Router();

// ============================================
// DEEPSEEK CONFIG
// ============================================
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
if (!DEEPSEEK_API_KEY) {
    console.error('[BREW] ❌ DEEPSEEK_API_KEY not found in environment!');
}
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// ============================================
// PERSONAS - 10 KARAKTER
// ============================================
const PERSONAS = {
    'beby.manis': { 
        gender: 'female', 
        panggilan: 'Beby', 
        umur: 20, 
        kerjaan: 'mahasiswi semester akhir', 
        statusCinta: 'single abis putus' 
    },
    'agak.koplak': { 
        gender: 'male', 
        panggilan: 'Koplak', 
        umur: 23, 
        kerjaan: 'admin medsos', 
        statusCinta: 'in relationship' 
    },
    'pretty.sad': { 
        gender: 'female', 
        panggilan: 'Pretty', 
        umur: 23, 
        kerjaan: 'karyawan startup', 
        statusCinta: 'situationship' 
    },
    'bang.juned': { 
        gender: 'male', 
        panggilan: 'Juned', 
        umur: 22, 
        kerjaan: 'mahasiswa skripsi', 
        statusCinta: 'single sibuk' 
    },
    'strawberry.shortcake': { 
        gender: 'female', 
        panggilan: 'Straw', 
        umur: 22, 
        kerjaan: 'fresh graduate', 
        statusCinta: 'in relationship' 
    },
    'chili.padi': { 
        gender: 'male', 
        panggilan: 'Chili', 
        umur: 20, 
        kerjaan: 'pedagang online', 
        statusCinta: 'pedekate' 
    },
    'little.fairy': { 
        gender: 'female', 
        panggilan: 'Fairy', 
        umur: 19, 
        kerjaan: 'content creator', 
        statusCinta: 'single happy' 
    },
    'sejuta.badai': { 
        gender: 'male', 
        panggilan: 'Badai', 
        umur: 22, 
        kerjaan: 'musisi indie', 
        statusCinta: 'single baperan' 
    },
    'satria.bajahitam': { 
        gender: 'male', 
        panggilan: 'Satria', 
        umur: 21, 
        kerjaan: 'mekanik', 
        statusCinta: 'jomblo akut' 
    },
    'cinnamon.girl': { 
        gender: 'female', 
        panggilan: 'Cinna', 
        umur: 24, 
        kerjaan: 'guru TK', 
        statusCinta: 'single searching' 
    }
};

// ============================================
// GET RANDOM MOOD
// ============================================
function getRandomMood() {
    const moods = ['surviving', 'thriving', 'chaotic', 'doom'];
    return moods[Math.floor(Math.random() * moods.length)];
}

// ============================================
// GENERATE 1 SPILL (FALLBACK)
// ============================================
function generateFallbackSpill(characterName, mood) {
    const fallbacks = [
        `capek ah hari ini, ${mood} mode on. skripsi bab 3 error terus 😭`,
        `lagi fase ${mood} tapi gatau harus ngapain. minggu malem gini enaknya nangis`,
        `hidup lagi ${mood} mode. tadi pagi udah niat produktif, eh malah scroll tiktok`,
        `entah kenapa hari ini rasanya ${mood} banget. mungkin efek hujan`,
        `kerjaan numpuk, deadline mepet, ${mood} mode activated 🫠`,
        `hari ini ${mood} banget, semoga besok lebih baik`
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

// ============================================
// GENERATE 1 SPILL (DEEPSEEK)
// ============================================
async function generateOneSpill(characterName, mood) {
    // Kalau ga ada API key, pake fallback
    if (!DEEPSEEK_API_KEY) {
        console.log('[BREW] ⚠️ No API key, using fallback');
        return generateFallbackSpill(characterName, mood);
    }
    
    try {
        const prompt = `Kamu adalah ${characterName}, seorang anak muda GenZ. 
Sekarang mood kamu ${mood}. Buat 1 kalimat curhat singkat (max 15 kata) 
yang relate dengan kehidupan anak muda sekarang. Pakai bahasa gaul dan emoji.`;

        const response = await fetch(DEEPSEEK_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: 'Kamu anak muda GenZ yang lagi curhat. Jawab singkat, gaul, pake emoji.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 1.0,
                max_tokens: 100
            })
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        return data.choices[0].message.content.trim();
        
    } catch (error) {
        console.error('[BREW] DeepSeek error:', error.message);
        return generateFallbackSpill(characterName, mood);
    }
}

// ============================================
// GENERATE BATCH SPILLS
// ============================================
async function generateAndSaveSpills(count = 3) {
    console.log('[BREW] 🟢 Generating', count, 'spills...');
    
    const characters = Object.keys(PERSONAS);
    const spills = [];
    
    for (let i = 0; i < count; i++) {
        const char = characters[Math.floor(Math.random() * characters.length)];
        const mood = getRandomMood();
        
        const content = await generateOneSpill(char, mood);
        
        // Hitung perkiraan jumlah kata
        const wordCount = content.split(/\s+/).length;
        
        spills.push({
            id: `spill_${Date.now()}_${i}`,
            author: char,
            mood: mood,
            content: content,
            wordCount: wordCount,
            timestamp: Date.now() - (i * 60000),
            reactions: {
                skull: Math.floor(Math.random() * 10) + 2,
                cry: Math.floor(Math.random() * 15) + 3,
                fire: Math.floor(Math.random() * 8) + 1,
                upside: Math.floor(Math.random() * 5) + 1
            }
        });
        
        // Delay biar ga overload API
        await new Promise(r => setTimeout(r, 200));
    }
    
    console.log('[BREW] ✅ Generated', spills.length, 'spills');
    return spills;
}

// ============================================
// ENDPOINT TEST (GET)
// ============================================
router.get('/test', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Brew API is alive!',
        hasKey: !!DEEPSEEK_API_KEY,
        personas: Object.keys(PERSONAS).length
    });
});

// ============================================
// ENDPOINT BREW (POST) - INI YANG DIPANGGIL GENERATOR
// ============================================
router.post('/brew', async (req, res) => {
    try {
        const { count = 3 } = req.body;
        
        console.log('[BREW] 📥 POST /brew called with count:', count);
        
        const spills = await generateAndSaveSpills(count);
        
        res.json({
            success: true,
            spills: spills,
            count: spills.length
        });
        
    } catch (error) {
        console.error('[BREW] ❌ Error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

module.exports = router;
