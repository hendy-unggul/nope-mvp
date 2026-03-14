// api/chat.js - VERSI NATURAL DENGAN EFEK MANUSIA
module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, characterName = 'beby.manis', lastMessages = [] } = req.body || {};
    
    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }

    // ============================================
    // PERSONA LENGKAP
    // ============================================
    const PERSONAS = {
      'beby.manis': {
        panggilan: 'Beby',
        gender: 'cewek',
        sifat: 'manja, suka overthinking, anak skripsi',
        contoh: 'hai juga! lagi ngapain?'
      },
      'agak.koplak': {
        panggilan: 'Koplak',
        gender: 'cowok',
        sifat: 'random, suka bercanda, admin medsos',
        contoh: 'halo bro! lg apa?'
      },
      'pretty.sad': {
        panggilan: 'Pretty',
        gender: 'cewek',
        sifat: 'kalem, pendengar baik, suka galau',
        contoh: 'hai... lg dengerin lagu'
      },
      'bang.juned': {
        panggilan: 'Juned',
        gender: 'cowok',
        sifat: 'gaul, update, sibuk coding',
        contoh: 'yo! lg ngoding nih'
      },
      'strawberry.shortcake': {
        panggilan: 'Straw',
        gender: 'cewek',
        sifat: 'ceria, suka bikin konten',
        contoh: 'hehe, ada apa?'
      },
      'chili.padi': {
        panggilan: 'Chili',
        gender: 'cowok',
        sifat: 'cuek, blak-blakan, jualan online',
        contoh: 'eh, lg jaga toko'
      },
      'little.fairy': {
        panggilan: 'Fairy',
        gender: 'cewek',
        sifat: 'imut, random, suka hal aneh',
        contoh: 'hai! lo percaya parallel universe?'
      },
      'sejuta.badai': {
        panggilan: 'Badai',
        gender: 'cowok',
        sifat: 'dramatis, lebay, musisi',
        contoh: 'hai, lagi nulis lagu'
      },
      'satria.bajahitam': {
        panggilan: 'Satria',
        gender: 'cowok',
        sifat: 'filosofis, suka nanya balik',
        contoh: 'halo, lg di bengkel'
      },
      'cinnamon.girl': {
        panggilan: 'Cinna',
        gender: 'cewek',
        sifat: 'sweet, caring, guru TK',
        contoh: 'hai! capek abis ngajar'
      }
    };

    const persona = PERSONAS[characterName] || PERSONAS['beby.manis'];

    // ============================================
    // FUNGSI BUAT EFEK MANUSIA
    // ============================================
    function addHumanEffect(text) {
      // Kadang tambah jeda di awal
      const hasPause = Math.random() < 0.3;
      if (hasPause) {
        const pauses = ['eh', 'hmm', 'anu', 'yah', 'umm'];
        const pause = pauses[Math.floor(Math.random() * pauses.length)];
        text = `${pause}, ${text}`;
      }

      // Kadang typo dikit
      const hasTypo = Math.random() < 0.15;
      if (hasTypo) {
        // Simple typo: huruf dobel atau ilang
        const typoType = Math.random();
        if (typoType < 0.5 && text.length > 3) {
          // Hapus 1 huruf random
          const pos = Math.floor(Math.random() * (text.length - 2)) + 1;
          text = text.slice(0, pos) + text.slice(pos + 1);
        } else {
          // Dobel huruf
          const pos = Math.floor(Math.random() * (text.length - 1)) + 1;
          text = text.slice(0, pos) + text[pos] + text.slice(pos);
        }
      }

      // Kadang ngulang kata
      const hasRepeat = Math.random() < 0.1;
      if (hasRepeat && text.includes(' ')) {
        const words = text.split(' ');
        if (words.length > 2) {
          const repeatPos = Math.floor(Math.random() * (words.length - 1)) + 1;
          words.splice(repeatPos, 0, words[repeatPos]);
          text = words.join(' ');
        }
      }

      // Tambah emot random
      const hasEmoji = Math.random() < 0.4;
      if (hasEmoji) {
        const emojis = ['😅', '🤔', '😆', '😐', '😏', '🤨', '😮‍💨', '😭'];
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];
        text = text + ' ' + emoji;
      }

      return text;
    }

    // ============================================
    // PANGGIL DEEPSEEK
    // ============================================
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
    if (!DEEPSEEK_API_KEY) {
      return res.status(500).json({ error: 'API key missing' });
    }

    const history = (lastMessages || []).slice(-8).map(m => ({
      role: m.role,
      content: m.content
    }));

    // Prompt yang lebih santai
    const systemPrompt = `Kamu adalah ${persona.panggilan}, ${persona.sifat}. 
Ngomong santai aja kayak lagi chat sama temen. Bisa pake bahasa gaul. Jawab singkat.`;

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          ...history,
          { role: 'user', content: message }
        ],
        temperature: 1.1, // Lebih random
        max_tokens: 120
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek error: ${response.status}`);
    }

    const data = await response.json();
    let reply = data.choices[0].message.content.trim();

    // Bersihin kutipan
    reply = reply.replace(/^["'""']|["'""']$/g, '');

    // Tambah efek manusia
    reply = addHumanEffect(reply);

    // Simulasi jeda ngetik (dikirim ke frontend untuk ditampilkan)
    // Frontend bisa pake info ini buat animasi typing
    const typingSpeed = Math.floor(Math.random() * 100) + 50; // 50-150ms per karakter

    return res.json({ 
      reply, 
      character: characterName,
      typing: {
        speed: typingSpeed,
        length: reply.length
      }
    });

  } catch (error) {
    console.error('[Chat] Error:', error);
    
    // Fallback dengan efek manusia
    const fallbacks = [
      "hai juga! lagi ngapain?",
      "halo, gimana kabarnya?",
      "hehe, ada apa nih?",
      "iya, gue dengerin..."
    ];
    
    let fallbackReply = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    fallbackReply = addHumanEffect(fallbackReply);
    
    return res.json({ 
      reply: fallbackReply,
      character: 'beby.manis',
      fallback: true
    });
  }
};
