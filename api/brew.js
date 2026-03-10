const express = require('express');
const router = express.Router();

router.get('/test', (req, res) => {
    res.json({ success: true, message: 'Brew API is alive!' });
});

router.post('/brew', (req, res) => {
    const dummy = [];
    for (let i = 0; i < 3; i++) {
        dummy.push({
            id: `test_${Date.now()}_${i}`,
            author: 'beby.manis',
            mood: 'surviving',
            content: 'test spill',
            timestamp: Date.now()
        });
    }
    res.json({ success: true, spills: dummy });
});

module.exports = router;
