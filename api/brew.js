module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    // Routing manual
    if (req.method === 'GET' && req.url === '/api/brew/test') {
        return res.json({ 
            success: true, 
            message: 'Brew API OK',
            timestamp: Date.now()
        });
    }
    
    if (req.method === 'POST' && req.url === '/api/brew') {
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
        return res.json({ 
            success: true, 
            spills: dummy 
        });
    }
    
    // If no route matches
    res.status(404).json({ error: 'Not found' });
};
