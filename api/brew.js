module.exports = (req, res) => {
    if (req.method === 'GET' && req.url === '/api/brew/test') {
        res.json({ success: true, message: 'Brew API OK' });
    }
    else if (req.method === 'POST' && req.url === '/api/brew') {
        res.json({ 
            success: true, 
            spills: [{
                id: 'test_1',
                author: 'beby.manis',
                mood: 'surviving',
                content: 'test',
                timestamp: Date.now()
            }]
        });
    }
    else {
        res.status(404).json({ error: 'Not found' });
    }
};
