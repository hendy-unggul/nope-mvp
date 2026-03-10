const express = require('express');
const router = express.Router();

// ENDPOINT TEST
router.get('/test', function(req, res) {
    return res.json({ 
        success: true, 
        message: 'Brew API is alive!'
    });
});

// ENDPOINT BREW
router.post('/brew', async function(req, res) {
    try {
        console.log('[BREW] POST /brew called');
        
        const dummySpills = [];
        for (let i = 0; i < 3; i++) {
            dummySpills.push({
                id: `test_${Date.now()}_${i}`,
                author: 'beby.manis',
                mood: 'surviving',
                content: 'test spill dari api minimal',
                timestamp: Date.now(),
                reactions: { skull: 5, cry: 3, fire: 2, upside: 1 }
            });
        }
        
        return res.json({
            success: true,
            spills: dummySpills,
            count: dummySpills.length
        });
        
    } catch (error) {
        console.error('[BREW] Error:', error);
        return res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

module.exports = router;
