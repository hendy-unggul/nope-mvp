const express = require('express');
const router = express.Router();

// ENDPOINT TEST
router.get('/test', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Brew API is alive!',
        timestamp: Date.now()
    });
});

// ENDPOINT BREW - VERSI SIMPLE
router.post('/brew', (req, res) => {
    const dummySpills = [];
    for (let i = 0; i < 3; i++) {
        dummySpills.push({
            id: `dummy_${Date.now()}_${i}`,
            author: 'beby.manis',
            mood: 'surviving',
            content: `test spill #${i+1} dari API`,
            timestamp: Date.now(),
            reactions: { skull: 3, cry: 5, fire: 2, upside: 4 }
        });
    }
    res.json({
        success: true,
        spills: dummySpills,
        count: dummySpills.length
    });
});

module.exports = router;
