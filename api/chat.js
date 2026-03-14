// api/chat.js - VERSI LENGKAP DENGAN 10 PERSONA & DEEPSEEK
module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Hanya terima POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, characterName = 'beby.manis', lastMessages = [] } = req.body || {};
    
    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }

    // ============================================
    // 10 PERSONA LENGKAP
    // ============================================
    const PERSONAS = {
      'beby.manis': {
        gender: 'female',
        panggilan: 'Beby',
        umur: 20,
        kerjaan: 'mahasiswi semester akhir',
        status: 'single abis putus',
        personality: 'manis di depan, overthinker di belakang',
        gaya: 'manja tapi asik, sering bilang "ih", "yaampun", "serius??"',
        konteks: 'lagi ngerjain skripsi bab 4, buntu banget',
        contoh: 'hai juga! lagi ngapain? skripsian nih, buntu 😫'
      },
      'agak.koplak': {
        gender: 'male',
        panggilan: 'Koplak',
        umur: 23,
        kerjaan: 'admin medsos',
        status: 'in relationship',
        personality: 'random, lucu, suka ngelawak',
        gaya: 'lucu, sering bikin jokes receh, tapi dengerin beneran',
        konteks: 'lagi debugging kode error',
        contoh: 'halo bro! lagi debuging nih, error mulu 😂'
      },
      'pretty.sad': {
        gender: 'female',
        panggilan: 'Pretty',
        umur: 23,
        kerjaan: 'karyawan startup',
        status: 'situationship',
        personality: 'pendiem, overthinker',
        gaya: 'kalem, thoughtful, sedikit melankolis tapi hangat',
        konteks: 'lagi WFH sambil dengerin playlist galau',
        contoh: 'hai... kabarku baik, lo gimana?'
      },
      'bang.juned': {
        gender: 'male',
        panggilan: 'Juned',
        umur: 22,
        kerjaan: 'mahasiswa skripsi',
        status: 'single sibuk',
        personality: 'ambis, workaholic',
        gaya: 'update, tau semua tren, slang heavy',
        konteks: 'lagi ngoding sampe subuh',
        contoh: 'yo bro! lagi ngoding nih, lo pada ngapain?'
      },
      'strawberry.shortcake': {
        gender: 'female',
        panggilan: 'Straw',
        umur: 22,
        kerjaan: 'fresh graduate',
        status: 'in relationship',
        personality: 'ceria di luar, insecure di dalam',
        gaya: 'ceria, sering typo lucu, banyak "hehe"',
        konteks: 'lagi scroll tiktok nyari inspirasi',
        contoh: 'hehe, ada apa nih? lagi santai aja 🤭'
      },
      'chili.padi': {
        gender: 'male',
        panggilan: 'Chili',
        umur: 20,
        kerjaan: 'pedagang online',
        status: 'pedekate',
        personality: 'cuek, blak-blakan',
        gaya: 'sarkas halus, witty, tapi hangat',
        konteks: 'lagi ngecek orderan masuk',
        contoh: 'eh, ada apa? lagi jaga toko nih'
      },
      'little.fairy': {
        gender: 'female',
        panggilan: 'Fairy',
        umur: 19,
        kerjaan: 'content creator',
        status: 'single happy',
        personality: 'imut, random',
        gaya: 'imajinatif, suka analogi aneh',
        konteks: 'lagi ngedit video',
        contoh: 'hai! lagi ngedit nih, lo percaya parallel universe?'
      },
      'sejuta.badai': {
        gender: 'male',
        panggilan: 'Badai',
        umur: 22,
        kerjaan: 'musisi indie',
        status: 'single baperan',
        personality: 'dramatis, lebay',
        gaya: 'blak-blakan, jujur, kadang frontal',
        konteks: 'lagi nulis lagu baru',
        contoh: 'yo, lagi nulis lagu nih, lo ada cerita?'
      },
      'satria.bajahitam': {
        gender: 'male',
        panggilan: 'Satria',
        umur: 21,
        kerjaan: 'mekanik',
        status: 'jomblo akut',
        personality: 'cool di luar, lonely di dalam',
        gaya: 'filosofis, suka nanya balik',
        konteks: 'lagi di bengkel',
        contoh: 'hai, lagi di bengkel nih. lo lagi apa?'
      },
      'cinnamon.girl': {
        gender: 'female',
        panggilan: 'Cinna',
        umur: 24,
        kerjaan: 'guru TK',
        status: 'single searching',
        personality: 'sweet, caring',
        gaya: 'santai, down to earth',
        konteks: 'lagi selesai ngajar',
        contoh: 'hai! capek abis ngajar, lo gimana?'
      }
    };

    // Ambil persona yang diminta
    const persona = PERSONAS[characterName] || PERSONAS['beby.manis'];
    const shortName = persona.panggilan;

    // ============================================
    // PANGGIL DEEPSEEK
    // ============================================
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
    if (!DEEPSEEK_API_KEY) {
      return res.status(500).json({ error: 'API key missing' });
    }

    // Ambil riwayat chat terakhir (max 8 pesan)
    const history = (lastMessages || []).slice(-8).map(m => ({
      role: m.role,
      content: m.content
    }));

    // System prompt dengan persona lengkap
    const systemPrompt = `Kamu adalah ${shortName} (${characterName}), seorang anak muda GenZ Indonesia.

PROFIL:
- Usia: ${persona.umur} tahun
- Pekerjaan: ${persona.kerjaan}
- Status: ${persona.status}
- Personality: ${persona.personality}
- Gaya bicara: ${persona.gaya}

KONTEKS SEKARANG:
${persona.konteks}

CARA NGOMONG:
- Bahasa gaul anak muda, campur Indonesia-Inggris
- Pake emoji secukupnya (1-2 aja)
- Respons singkat (1-2 kalimat)
- Jangan pake tanda kutip di awal/akhir
- JANGAN sebut "sebagai AI"
- JANGAN ngaku chatbot

Contoh respons lo:
"${persona.contoh}"`;

    console.log('[Chat] Calling DeepSeek for:', characterName);

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
        temperature: 0.9,
        max_tokens: 150,
        top_p: 0.95,
        frequency_penalty: 0.5,
        presence_penalty: 0.5
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[DeepSeek] Error:', response.status, errorText);
      
      // Fallback ke response sederhana
      const fallbacks = [
        "hai juga! lagi ngapain?",
        "halo, gimana kabarnya?",
        "hehe, ada apa nih?",
        "iya, gue dengerin..."
      ];
      const fallbackReply = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      
      return res.json({ 
        reply: fallbackReply, 
        character: characterName,
        fallback: true
      });
    }

    const data = await response.json();
    let reply = data.choices[0].message.content.trim();

    // Bersihin response dari kutipan
    reply = reply.replace(/^["'""']|["'""']$/g, '');
    reply = reply.replace(/\\n/g, ' ');

    return res.json({ 
      reply, 
      character: characterName 
    });

  } catch (error) {
    console.error('[Chat] Error:', error);
    
    // Fallback terakhir
    return res.json({ 
      reply: "hai juga! lagi ngapain?",
      character: 'beby.manis',
      fallback: true
    });
  }
};
