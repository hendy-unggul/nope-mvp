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
// ENDPOINT TEST
// ============================================
router.get('/test', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Brew API is alive!',
        hasKey: !!DEEPSEEK_API_KEY
    });
});

// ============================================
// ENDPOINT BREW - DENGAN DEEPSEEK INTEGRATION
// ============================================
router.post('/brew', async (req, res) => {
    try {
        console.log('[BREW] POST /brew called');
        
        // Validasi API key
        if (!DEEPSEEK_API_KEY) {
            console.error('[BREW] No API key available');
            return res.status(500).json({ 
                success: false,
                error: 'DeepSeek API key not configured' 
            });
        }

        // Ambil parameter dari request body
        const { count = 5 } = req.body;
        console.log(`[BREW] Requesting ${count} spills from DeepSeek`);

        // System prompt untuk DeepSeek
        const systemPrompt = `Kamu adalah generator konten untuk aplikasi "Blitz" - sebuah platform microblogging chaos. 
Generate ${count} post singkat yang dramatis, lucu, atau relatable dalam bahasa Indonesia gaul.

Format output HARUS JSON array seperti ini:
[
  {
    "author": "username.random",
    "mood": "surviving|thriving|suffering|vibing",
    "content": "isi post singkat max 280 karakter",
    "wordCount": jumlah_kata,
    "reactions": { "skull": 0-10, "cry": 0-10, "fire": 0-10, "upside": 0-10 }
  }
]

PENTING: 
- Output HANYA JSON array, tanpa markdown atau teks lain
- Content dalam bahasa Indonesia casual/gaul
- Mood harus salah satu dari: surviving, thriving, suffering, vibing
- Author format: lowercase dengan dot (contoh: beby.manis, chaos.enjoyer)`;

        // Panggil DeepSeek API
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
                        content: systemPrompt
                    },
                    {
                        role: 'user',
                        content: `Generate ${count} spills sekarang!`
                    }
                ],
                temperature: 0.9,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[BREW] DeepSeek API error:', response.status, errorText);
            
            // Fallback ke dummy data jika API gagal
            console.log('[BREW] Falling back to dummy data');
            return res.json({
                success: true,
                spills: generateDummySpills(count),
                count: count,
                source: 'fallback'
            });
        }

        const data = await response.json();
        console.log('[BREW] DeepSeek response received');

        // Extract content dari response
        let aiContent = data.choices[0].message.content.trim();
        
        // Clean markdown code blocks jika ada
        aiContent = aiContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        // Parse JSON
        let spills;
        try {
            spills = JSON.parse(aiContent);
        } catch (parseError) {
            console.error('[BREW] JSON parse error:', parseError);
            console.error('[BREW] Raw content:', aiContent);
            
            // Fallback ke dummy
            return res.json({
                success: true,
                spills: generateDummySpills(count),
                count: count,
                source: 'fallback_parse_error'
            });
        }

        // Tambahkan metadata ke setiap spill
        const enrichedSpills = spills.map((spill, idx) => ({
            id: `deepseek_${Date.now()}_${idx}`,
            author: spill.author || 'ai.generator',
            mood: spill.mood || 'vibing',
            content: spill.content || 'error loading content',
            timestamp: Date.now() - (idx * 1000), // Spacing timestamps
            wordCount: spill.wordCount || spill.content.split(' ').length,
            reactions: spill.reactions || { skull: 0, cry: 0, fire: 0, upside: 0 },
            source: 'deepseek'
        }));

        console.log(`[BREW] ✅ Generated ${enrichedSpills.length} spills successfully`);

        res.json({
            success: true,
            spills: enrichedSpills,
            count: enrichedSpills.length,
            source: 'deepseek'
        });

    } catch (error) {
        console.error('[BREW] Fatal error:', error);
        
        // Fallback ke dummy data
        const dummySpills = generateDummySpills(5);
        res.json({
            success: true,
            spills: dummySpills,
            count: dummySpills.length,
            source: 'fallback_error',
            error: error.message
        });
    }
});

// ============================================
// HELPER: GENERATE DUMMY SPILLS
// ============================================
function generateDummySpills(count) {
    const dummyData = [
        { author: 'beby.manis', mood: 'surviving', content: 'gajian masih lama tapi dompet udah nangis 💀' },
        { author: 'chaos.enjoyer', mood: 'thriving', content: 'hari ini produktif: bangun, makan, tidur lagi' },
        { author: 'midnight.thinker', mood: 'suffering', content: 'kenapa deadline selalu datang lebih cepat dari gajian' },
        { author: 'vibe.checker', mood: 'vibing', content: 'coffee + good music + ngoding = life is good ✨' },
        { author: 'real.talk', mood: 'surviving', content: 'adulting itu scam, nobody told me about this' }
    ];

    const spills = [];
    for (let i = 0; i < count; i++) {
        const template = dummyData[i % dummyData.length];
        spills.push({
            id: `dummy_${Date.now()}_${i}`,
            author: template.author,
            mood: template.mood,
            content: template.content,
            timestamp: Date.now() - (i * 2000),
            wordCount: template.content.split(' ').length,
            reactions: { 
                skull: Math.floor(Math.random() * 10), 
                cry: Math.floor(Math.random() * 8), 
                fire: Math.floor(Math.random() * 12), 
                upside: Math.floor(Math.random() * 5) 
            }
        });
    }
    return spills;
}

module.exports = router;
