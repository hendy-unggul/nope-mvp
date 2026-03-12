module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const body = req.body || {};
    const message = body.message || '';
    const characterName = body.characterName || 'unknown';
    
    const replies = [
      'hmm cerita dong',
      'oh gitu, terus gimana?',
      'iya lanjutin',
      'wah seru nih',
      'gue dengerin kok'
    ];
    
    const randomReply = replies[Math.floor(Math.random() * replies.length)];
    
    return res.status(200).json({
      reply: randomReply,
      character: characterName,
      mode: 'offline'
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Internal error',
      message: error.message 
    });
  }
};
