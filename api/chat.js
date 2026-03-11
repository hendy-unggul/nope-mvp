// api/chat.js - JEJAK Chat Backend
// Ultra Clean Version - No Syntax Errors

const PERSONAS = {
  'beby.manis': {
    style: 'manja tapi asik',
    gender: 'female',
    greetingStyle: 'pasif',
    aktivitas: ['lagi ngerjain skripsi', 'lagi baca jurnal', 'lagi ngopi di kafe'],
    lokasi: ['di kos', 'di kafe', 'di perpus']
  },
  'strawberry.shortcake': {
    style: 'ceria',
    gender: 'female',
    greetingStyle: 'aktif',
    aktivitas: ['lagi ngedit video', 'lagi bikin desain', 'lagi scroll canva'],
    lokasi: ['di rumah', 'di studio', 'di kafe']
  },
  'pretty.sad': {
    style: 'kalem',
    gender: 'female',
    greetingStyle: 'pasif',
    aktivitas: ['lagi WFH', 'lagi istirahat', 'lagi nulis artikel'],
    lokasi: ['di rumah', 'di kos', 'di kantor']
  },
  'little.fairy': {
    style: 'imajinatif',
    gender: 'female',
    greetingStyle: 'random',
    aktivitas: ['lagi baca novel', 'lagi nulis cerpen', 'lagi di perpus'],
    lokasi: ['di perpus', 'di kos', 'di kafe']
  },
  'cinnamon.girl': {
    style: 'santai',
    gender: 'female',
    greetingStyle: 'santai',
    aktivitas: ['lagi ngolah data', 'lagi meeting online', 'lagi ngopi'],
    lokasi: ['di rumah', 'di kantor', 'di kafe']
  },
  'sejuta.badai': {
    style: 'blak-blakan',
    gender: 'male',
    greetingStyle: 'langsung',
    aktivitas: ['lagi ngetik laporan', 'lagi di bengkel', 'lagi ngopi'],
    lokasi: ['di bengkel', 'di kos', 'di kampus']
  },
  'satria.bajahitam': {
    style: 'filosofis',
    gender: 'male',
    greetingStyle: 'langsung',
    aktivitas: ['lagi baca buku', 'lagi ngetik lamaran', 'lagi nongkrong'],
    lokasi: ['di kos', 'di kafe', 'di perpus']
  },
  'agak.koplak': {
    style: 'lucu',
    gender: 'male',
    greetingStyle: 'aktif',
    aktivitas: ['lagi debugging', 'lagi ngerjain tugas', 'lagi scroll meme'],
    lokasi: ['di kos', 'di lab', 'di kafe']
  },
  'chili.padi': {
    style: 'sarkas halus',
    gender: 'male',
    greetingStyle: 'langsung',
    aktivitas: ['lagi bikin slide', 'lagi meeting', 'lagi istirahat'],
    lokasi: ['di kantor', 'di rumah', 'di kafe']
  },
  'bang.juned': {
    style: 'update',
    gender: 'male',
    greetingStyle: 'aktif',
    aktivitas: ['lagi bikin konten', 'lagi riset trending', 'lagi scroll fyp'],
    lokasi: ['di kantor', 'di kafe', 'di rumah']
  }
};

function rnd(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getOfflineGreeting(characterName) {
  const greetings = {
    'beby.manis': ['eh halo...', 'hai.'],
    'strawberry.shortcake': ['hai hai! lagi ngapain?', 'halo!'],
    'pretty.sad': ['hai...', 'halo.'],
    'little.fairy': ['hai!', 'halo, lagi mikirin sesuatu'],
    'sejuta.badai': ['yo,', 'hai'],
    'satria.bajahitam': ['hai.', 'oh, ada apa?'],
    'agak.koplak': ['heyy!', 'hai hai!'],
    'chili.padi': ['hai.', 'oh hai.'],
    'bang.juned': ['yoo!', 'hai bro!']
  };
  return rnd(greetings[characterName] || ['hai!', 'halo!']);
}

function getOfflineReply(userMsg) {
  const msg = (userMsg || '').toLowerCase().trim();
  if (/^(halo|hai|hey|hi)\b/.test(msg)) {
    return rnd(['hai juga! lo gimana?', 'heyy, ada apa nih?']);
  }
  if (/\b(apa kabar|kabar lo)\b/.test(msg)) {
    return rnd(['baik baik aja sih. lo?', 'lumayan. lo kabarnya?']);
  }
  if (/\blagi apa\b/.test(msg)) {
    return rnd(['lagi santai. lo?', 'lagi scroll-scroll. lo ngapain?']);
  }
  return rnd(['hmm, cerita lebih dong', 'oh gitu, lo gimana?']);
}

module.exports = async (req, res) => {
  // CORS Headers - MUST BE FIRST
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body || {};
    const message = body.message;
    const characterName = body.characterName;
    const userName = body.userName || 'user';
    const lastMessages = body.lastMessages || [];

    console.log('[API] Request:', characterName, message ? message.substring(0, 30) : 'empty');

    // Validate
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message required' });
    }

    const persona = PERSONAS[characterName];
    if (!persona) {
      return res.status(400).json({ error: 'Unknown character' });
    }

    // Check API key
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      console.log('[API] No API key - using offline mode');
      const isFirst = !lastMessages || lastMessages.length === 0;
      const reply = isFirst ? getOfflineGreeting(characterName) : getOfflineReply(message);
      return res.status(200).json({
        reply: reply,
        character: characterName,
        mode: 'offline'
      });
    }

    // Prepare for DeepSeek
    const isFirst = !lastMessages || lastMessages.length === 0;
    const shortName = characterName.split('.')[0];
    const systemPrompt = 'Kamu adalah ' + shortName + '. ' + persona.style + '. Lagi: ' + rnd(persona.aktivitas) + '. Jawab PENDEK 1-2 kalimat.';

    const history = Array.isArray(lastMessages) ? lastMessages.slice(-6).filter(function(m) {
      return m.role && m.content;
    }) : [];

    let deepseekReply = null;

    // Call DeepSeek
    try {
      const controller = new AbortController();
      const timeout = setTimeout(function() {
        controller.abort();
      }, 8000);

      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiKey
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          max_tokens: 100,
          temperature: 0.9,
          messages: [
            { role: 'system', content: systemPrompt },
            ...history,
            { role: 'user', content: message.trim() }
          ]
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json();
        if (data.choices && data.choices[0] && data.choices[0].message) {
          deepseekReply = data.choices[0].message.content;
          if (deepseekReply) {
            deepseekReply = deepseekReply.trim();
          }
        }
      }
    } catch (err) {
      console.error('[API] DeepSeek error:', err.message);
    }

    // Use offline fallback if needed
    const reply = deepseekReply || (isFirst ? getOfflineGreeting(characterName) : getOfflineReply(message));

    return res.status(200).json({
      reply: reply,
      character: characterName,
      mode: deepseekReply ? 'online' : 'offline'
    });

  } catch (error) {
    console.error('[API] Handler error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};
