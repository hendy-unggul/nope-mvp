// api/chat.js - VERSI DENGAN CORS LENGKAP
module.exports = async (req, res) => {
  // Set CORS headers untuk SEMUA response (termasuk error)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight 24 jam

  // Handle preflight OPTIONS - WAJIB!
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Hanya terima POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, characterName } = req.body || {};
    
    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }

    // Response dengan variasi biar gak monoton
    const replies = [
      "hai juga! lagi ngapain?",
      "halo, gimana kabarnya?",
      "hehe, ada apa nih?",
      "iya, gue dengerin..."
    ];
    
    const randomReply = replies[Math.floor(Math.random() * replies.length)];
    
    return res.status(200).json({
      reply: randomReply,
      character: characterName || 'beby.manis'
    });
    
  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({ error: 'Internal error' });
  }
};
