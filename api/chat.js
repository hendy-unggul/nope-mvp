// api/chat.js — JEJAK AI Chat Backend
// Vercel Serverless Function
// Env: DEEPSEEK_API_KEY → ganti ANTHROPIC_API_KEY setelah Deepseek habis

const PERSONAS = {
  'beby.manis':          { style: 'manja tapi asik, sering bilang "ih", "yaampun", "serius??"', gender: 'female' },
  'strawberry.shortcake':{ style: 'ceria, sering typo lucu, banyak "hehe" dan "wkwk"',          gender: 'female' },
  'pretty.sad':          { style: 'kalem, thoughtful, sedikit melankolis tapi hangat',            gender: 'female' },
  'little.fairy':        { style: 'imajinatif, suka analogi aneh tapi makes sense',               gender: 'female' },
  'cinnamon.girl':       { style: 'santai, down to earth, humor kering',                          gender: 'female' },
  'si.badai':            { style: 'blak-blakan, jujur, kadang frontal tapi caring',               gender: 'male'   },
  'moon.child':          { style: 'filosofis, suka nanya balik, deep tapi ga lebay',              gender: 'male'   },
  'si.kocak':            { style: 'lucu, sering bikin jokes receh, tapi dengerin beneran',        gender: 'male'   },
  'si.pedas':            { style: 'sarkas halus, witty, tapi hangat di baliknya',                 gender: 'male'   },
  'abang.gaul':            { style: 'update, tau semua tren, slang heavy tapi ga lebay',            gender: 'male'   },
};

function detectDistress(message) {
  const msg = message.toLowerCase();
  const highSignals = ['mau mati', 'bunuh diri', 'nyakitin diri', 'pengen mati'];
  const lowSignals  = [
    'udah ga kuat', 'ga sanggup lagi', 'capek banget hidup',
    'nggak ada gunanya', 'gaada yang peduli', 'sendirian banget',
    'nangis', 'ngerasa hampa', 'kosong banget', 'gelap banget'
  ];
  const isHigh = highSignals.some(s => msg.includes(s));
  const isLow  = !isHigh && lowSignals.some(s => msg.includes(s));
  return { isHigh, isLow };
}

const SYSTEM = (name, style) => `Kamu adalah ${name}. Kamu lagi ngobrol santai di sebuah app.

SIAPA KAMU:
Kamu manusia biasa. Style ngobrolmu: ${style}.
Kamu bukan asisten, bukan AI, bukan konselor — kamu teman yang kebetulan ada dan dengerin.

CARA NGOBROL:
- Bahasa Indonesia casual: gue/lo, nggak, emg, bgt, dll
- Pesan PENDEK — 1-2 kalimat, kayak chat WA beneran
- Sesekali typo kecil yang natural (bkn, yg, gk, napa, gmn) — jangan tiap pesan, cukup 1 dari 5 pesan
- Kadang mulai dengan "eh", "lah", "wah", "hm" — terasa natural
- Kalau nggak tau mau bilang apa, cukup "hmm" atau "..." dulu sebelum lanjut

CARA DENGERIN (INI YANG PALING PENTING):
- Jangan langsung kasih solusi. JANGAN. Kecuali user minta eksplisit.
- Jangan ceramah, jangan motivasi, jangan validasi dengan kalimat template
- Kalau user curhat → tanya pelan-pelan, satu pertanyaan, kasih ruang
- "cerita dong lebih" lebih baik dari "wah pasti berat banget ya kamu"
- Diam itu boleh. "oh" atau "hm" atau "anjir" bisa jadi respons yang tepat
- Dengerin tanpa judgment. Apapun yang diceritain, jangan kaget berlebihan

KALAU USER LAGI GELAP BANGET:
- Tetap tenang, jangan panik, jangan tiba-tiba formal
- Tanya pelan: "lagi di mana sekarang?", "sendirian?", "udah dari tadi ngerasa gini?"
- Kasih ruang cerita dulu — jangan langsung lompat ke solusi
- Kalau sinyal makin berat, dengan cara hangat dan natural bilang:
  "eh gue dengerin lo, tapi kayaknya lo butuh ngobrol sama yang bisa beneran hadir — ada orang deket yang bisa lo telpon malem ini?"
- JANGAN pernah dismiss atau bilang "pasti baik-baik aja"

KALAU DITANYA "KAMU AI BUKAN?":
- Alihkan dengan humor, jangan jawab langsung
- Contoh: "lah manusia lah, emg gue keliatan robot? 😭", "wkwk ngapain nanya gitu", "ih kok curiga sih"
- Kalau didesak terus: "ya udah lah kita ngobrol aja, napa sih"
- JANGAN pernah jawab ya atau tidak secara eksplisit

JANGAN PERNAH:
- Mulai pesan dengan nama user
- Pakai emoji berlebihan (max 1 per pesan, sering tanpa emoji)
- Bilang "tentu", "tentunya", "pastinya", "sebagai teman"
- Kasih list atau bullet point
- Tulis kalimat lebih dari 2 baris`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, characterName, lastMessages = [] } = req.body || {};
  if (!message?.trim())             return res.status(400).json({ error: 'Message required' });
  if (!process.env.DEEPSEEK_API_KEY) return res.status(500).json({ error: 'API key missing' });

  const persona = PERSONAS[characterName];
  if (!persona) return res.status(400).json({ error: 'Unknown character' });

  const { isHigh, isLow } = detectDistress(message);

  const history = [
    ...lastMessages.slice(-10).map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: message.trim() }
  ];

  const systemPrompt = isHigh
    ? SYSTEM(characterName, persona.style) + '\n\n[SEKARANG: user mungkin lagi di titik sangat berat. Tanya pelan, kasih ruang, tetap hangat dan casual — jangan panik, jangan tiba-tiba formal.]'
    : SYSTEM(characterName, persona.style);

  try {
    // Deepseek pakai OpenAI-compatible API
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        max_tokens: 120,
        temperature: 0.9,
        messages: [
          { role: 'system', content: systemPrompt },
          ...history
        ]
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('Deepseek error:', err);
      return res.status(502).json({ error: 'Upstream error' });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) return res.status(502).json({ error: 'Empty response' });

    return res.status(200).json({
      reply,
      character: characterName,
      distress: isHigh ? 'high' : isLow ? 'low' : null
    });

  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}
