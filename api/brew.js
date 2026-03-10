const express = require('express');
const router = express.Router();

// ============================================
// ENDPOINT TEST
// ============================================
router.get('/test', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Brew API is alive!',
        timestamp: Date.now()
    });
});

// ============================================
// ENDPOINT BREW - SIMPLE VERSION
// ============================================
router.post('/brew', (req, res) => {
    try {
        console.log('[BREW] POST /brew called');
        
        const dummySpills = [];
        for (let i = 0; i < 3; i++) {
            dummySpills.push({
                id: `dummy_${Date.now()}_${i}`,
                author: ['beby.manis', 'agak.koplak', 'pretty.sad'][Math.floor(Math.random() * 3)],
                mood: ['surviving', 'thriving', 'chaotic', 'doom'][Math.floor(Math.random() * 4)],
                content: 'test spill dari API - ' + new Date().toLocaleTimeString(),
                timestamp: Date.now() - (i * 1000),
                reactions: { skull: 3, cry: 5, fire: 2, upside: 4 }
            });
        }
        
        res.json({
            success: true,
            spills: dummySpills,
            count: dummySpills.length,
            source: 'dummy'
        });
        
    } catch (error) {
        console.error('[BREW] Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
