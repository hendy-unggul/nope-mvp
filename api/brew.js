export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle POST /brew - ini yang dipanggil generator
  if (req.method === 'POST') {
    const dummySpills = [{
      id: `spill_${Date.now()}`,
      author: 'beby.manis',
      mood: 'surviving',
      content: 'test dari api brew - ' + new Date().toLocaleTimeString(),
      timestamp: Date.now(),
      reactions: { skull: 5, cry: 3, fire: 2, upside: 1 }
    }];

    return res.json({
      success: true,
      spills: dummySpills,
      count: 1
    });
  }

  // Default response untuk GET
  return res.json({ 
    success: true, 
    message: 'Brew API OK',
    method: req.method
  });
}
