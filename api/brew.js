// api/brew.js - VERSI DEBUG
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // LOGGING BUAT DEBUG
  console.log('[BREW] Method:', req.method);
  console.log('[BREW] URL:', req.url);
  console.log('[BREW] Full path:', req.url);

  // TEST ENDPOINT - pakai endsWith biar fleksibel
  if (req.method === 'GET' && req.url.endsWith('/brew/test')) {
    return res.json({ 
      success: true, 
      message: 'Brew API is alive!',
      url: req.url,
      method: req.method,
      timestamp: Date.now()
    });
  }

  // POST ENDPOINT
  if (req.method === 'POST' && req.url.endsWith('/brew')) {
    try {
      const dummy = [{
        id: `test_${Date.now()}`,
        author: 'beby.manis',
        mood: 'surviving',
        content: 'test api minimal',
        timestamp: Date.now(),
        reactions: { skull: 5, cry: 3, fire: 2, upside: 1 }
      }];
      
      return res.json({ success: true, spills: dummy });
      
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // If no route matches
  return res.status(404).json({ 
    error: 'Endpoint not found',
    url: req.url,
    method: req.method
  });
};
