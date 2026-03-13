// api/brew.js - VERSI VERCEL SERVERLESS
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight (OPTIONS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // DEEPSEEK CONFIG
  const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
  if (!DEEPSEEK_API_KEY) {
    console.error('[BREW] ❌ API key missing');
  }

  // ========== ROUTING MANUAL ==========
  
  // GET /api/brew/test
  if (req.method === 'GET' && req.url === '/api/brew/test') {
    return res.json({ 
      success: true, 
      message: 'Brew API is alive!',
      hasKey: !!DEEPSEEK_API_KEY,
      timestamp: Date.now()
    });
  }

  // POST /api/brew
  if (req.method === 'POST' && req.url === '/api/brew') {
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
      
      return res.json({
        success: true,
        spills: dummy,
        count: dummy.length
      });
      
    } catch (error) {
      console.error('[BREW] Error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // If no route matches
  return res.status(404).json({ error: 'Endpoint not found' });
};
