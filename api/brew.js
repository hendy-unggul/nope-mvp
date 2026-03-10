const express = require('express');
const router = express.Router();

// ENDPOINT TEST
router.get('/test', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Brew API is alive!' 
    });
});

// ENDPOINT BREW (POST)
router.post('/brew', (req, res) => {
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

module.exports = router;
