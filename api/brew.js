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
        hasApiKey: !!DEEPSEEK_API_KEY
    });
});

// ============================================
// ENDPOINT BREW - VERSI MINIMAL
// ============================================
router.post('/brew', async (req, res) => {
    try {
        const { count = 3 } = req.body;
        
        const spills = [];
        for (let i = 0; i < count; i++) {
            spills.push({
                id: `test_${Date.now()}_${i}`,
                author: 'beby.manis',
                mood: 'surviving',
                content: 'test spill dari api minimal',
                timestamp: Date.now(),
                reactions: { skull: 5, cry: 3, fire: 2, upside: 1 }
            });
        }
        
        res.json({
            success: true,
            spills: spills,
            count: spills.length
        });
        
    } catch (error) {
        console.error('[BREW] Error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

module.exports = router;
