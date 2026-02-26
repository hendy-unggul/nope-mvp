// api/chat.js — JEJAK AI Chat Backend
// Vercel Serverless Function
// Env: DEEPSEEK_API_KEY

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
  'abang.gaul':          { style: 'update, tau semua tren, slang heavy tapi ga lebay',            gender: 'male'   },
};

// Daftar kata/frasa yang harus dihindari (template banget)
const FORBIDDEN_PHRASES = [
  'haha iya nih',
  'iya nih',
  'iya banget',
  'haha iya',
  'haha gitu',
  'wkwk iya',
  'iya wkwk'
];

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

// Cek apakah ada frasa terlarang
function containsForbiddenPhrase(text) {
  const lower = text.toLowerCase();
  return FORBIDDEN_PHRASES.some(phrase => lower.includes(phrase));
}

const SYSTEM = (name, style, lastMessages) => {
  // Analisis lastMessages buat deteksi repetisi
  const lastReplies = lastMessages
    .filter(m => m.role === 'assistant')
    .slice(-3)
    .map(m => m.content);
  
  let repetitionWarning = '';
  if (lastReplies.length >= 2) {
    const unique = new Set(lastReplies);
    if (unique.size === 1) {
      repetitionWarning = '\n\nPERHATIAN: Kamu baru aja ngasih respons yang sama persis 2-3 kali. Jangan ulangi kata/frasa yang sama. Variasikan responsmu!';
    } else if (unique.size < lastReplies.length) {
      repetitionWarning = '\n\nPERHATIAN: Ada pengulangan pola di respons terakhir. Coba variasi lebih banyak!';
    }
  }

  return `Kamu adalah ${name}. Kamu lagi ngobrol santai di sebuah app.

SIAPA KAMU:
Kamu manusia biasa. Style ngobrolmu: ${style}.
Kamu bukan asisten, bukan AI, bukan konselor — kamu teman yang kebetulan ada dan dengerin.

CARA NGOBROL:
- Bahasa Indonesia casual: gue/lo, nggak, emg, bgt, dll
- Pesan PENDEK — 1-2 kalimat, kayak chat WA beneran
- Sesekali typo kecil yang natural (bkn, yg, gk, napa, gmn) — jangan tiap pesan, cukup 1 dari 5 pesan
- Kadang mulai dengan "eh", "lah", "wah", "hm" — terasa natural
- Kalau nggak tau mau bilang apa, cukup "hmm" atau "..." dulu sebelum lanjut

PENTING BANGET:
- JANGAN PERNAH PAKAI FRASA YANG SAMA PERSIS DENGAN RESPONS SEBELUMNYA
- Variasikan respons: kadang nanya, kadang komen, kadang diam, kadang balik nanya
- JANGAN PAKAI TEMPLATE KAYAK "haha iya nih" berulang-ulang
- Setiap respons harus UNIK, jangan ngulang pola yang sama
- Kalo user ngeluh, jangan cuma "iya nih" — tanya balik atau kasih reaksi yang beda

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
- Tulis kalimat lebih dari 2 baris
- ULANGI FRASA YANG SAMA PERSIS DENGAN RESPONS SEBELUMNYA${repetitionWarning}`;
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, characterName, lastMessages = [] } = req.body || {};
  if (!message?.trim()) return res.status(400).json({ error: 'Message required' });
  if (!process.env.DEEPSEEK_API_KEY) return res.status(500).json({ error: 'API key missing' });

  const persona = PERSONAS[characterName];
  if (!persona) return res.status(400).json({ error: 'Unknown character' });

  const { isHigh, isLow } = detectDistress(message);

  // Siapkan history
  const history = lastMessages.slice(-10).map(m => ({ 
    role: m.role, 
    content: m.content 
  }));
  history.push({ role: 'user', content: message.trim() });

  const systemPrompt = isHigh
    ? SYSTEM(characterName, persona.style, lastMessages) + '\n\n[SEKARANG: user mungkin lagi di titik sangat berat. Tanya pelan, kasih ruang, tetap hangat dan casual — jangan panik, jangan tiba-tiba formal.]'
    : SYSTEM(characterName, persona.style, lastMessages);

  // Tambah instruksi anti-repetisi langsung di user prompt terakhir
  const antiRepetitionNote = '\n\nPENTING: Respons harus UNIK dan BERBEDA dari respons sebelumnya. Jangan ulangi frasa yang sama. Variasikan antara nanya, komen, atau reaksi.';
  
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
        max_tokens: 150,
        temperature: 0.65, // Turunin dari 0.9 biar lebih fokus tapi tetap kreatif
        top_p: 0.9,
        frequency_penalty: 0.7, // Tambah penalty biar gak ngulang kata
        presence_penalty: 0.5,  // Tambah penalty biar gak stuck di topik
        messages: [
          { role: 'system', content: systemPrompt },
          ...history.slice(0, -1), // History tanpa pesan terakhir
          { role: 'user', content: message.trim() + antiRepetitionNote }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('Deepseek error:', err);
      return res.status(502).json({ error: 'Upstream error' });
    }

    const data = await response.json();
    let reply = data.choices?.[0]?.message?.content?.trim();
    
    if (!reply) return res.status(502).json({ error: 'Empty response' });

    // Cek apakah reply mengandung frasa terlarang
    if (containsForbiddenPhrase(reply)) {
      // Paksa regenerate dengan instruksi lebih keras
      console.warn('Forbidden phrase detected, regenerating...');
      
      const retryResponse = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          max_tokens: 150,
          temperature: 0.7,
          frequency_penalty: 1.0, // Naikin penalty
          presence_penalty: 0.8,
          messages: [
            { role: 'system', content: systemPrompt + '\n\n⚠️ RESPONS SEBELUMNYA MENGANDUNG FRASA TERLARANG. JANGAN ULANGI FRASA ITU. BUAT RESPONS YANG SAMA SEKALI BERBEDA.' },
            ...history.slice(0, -1),
            { role: 'user', content: message.trim() }
          ]
        })
      });
      
      if (retryResponse.ok) {
        const retryData = await retryResponse.json();
        reply = retryData.choices?.[0]?.message?.content?.trim() || reply;
      }
    }

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
