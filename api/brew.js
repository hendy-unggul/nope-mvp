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
// ENDPOINT BREW - VERSI MINIMAL DULU
// ============================================
router.post('/brew', async (req, res) => {
    try {
        console.log('[BREW] POST /brew called');
        
        const dummy = [];
        for (let i = 0; i < 3; i++) {
            dummy.push({
                id: `test_${Date.now()}_${i}`,
                author: 'beby.manis',
                mood: 'surviving',
                content: 'test api minimal',
                timestamp: Date.now(),
                wordCount: 3,
                reactions: { skull: 5, cry: 3, fire: 2, upside: 1 }
            });
        }
        
        res.json({
            success: true,
            spills: dummy,
            count: dummy.length
        });
        
    } catch (error) {
        console.error('[BREW] Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;  // ← INI JUGA PENTING!
