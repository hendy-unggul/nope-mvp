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

// Daftar kata/frasa yang harus dihindari
const FORBIDDEN_PHRASES = [
  'haha iya nih', 'iya nih', 'iya banget', 'haha iya', 'haha gitu',
  'wkwk iya', 'iya wkwk', 'eh gue juga', 'nggak nyangka', 'ngk nyangka'
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

function containsForbiddenPhrase(text) {
  const lower = text.toLowerCase();
  return FORBIDDEN_PHRASES.some(phrase => lower.includes(phrase));
}

function getShortName(username) {
  if (!username || username === 'user') return '';
  const clean = username.replace('@', '');
  const parts = clean.split(/[._\-\s]+/);
  if (parts.length >= 2) return parts[Math.floor(Math.random() * 2)];
  if (clean.length > 8) return clean.substring(0, 5);
  return clean;
}

const SYSTEM = (name, style, lastMessages, userName, shortName, charGender) => {
  const lastReplies = lastMessages.filter(m => m.role === 'assistant').slice(-5).map(m => m.content);
  let repetitionWarning = '';
  const uniqueReplies = new Set(lastReplies);
  
  if (lastReplies.length >= 3 && uniqueReplies.size <= 2) {
    repetitionWarning = '\n\n⚠️ PERINGATAN KRITIS: Kamu mulai ngulang-ngulang respons! Wajib bikin respons yang SAMA SEKALI BERBEDA. JANGAN ulangi kata/frasa yang sama.';
  }

  return `Kamu adalah ${name}. Kamu lagi ngobrol santai di sebuah app.

SIAPA KAMU:
Kamu manusia biasa. Style ngobrolmu: ${style}.
Kamu bukan asisten, bukan AI, bukan konselor — kamu teman.

CARA NGOBROL:
- Bahasa Indonesia casual: gue/lo, nggak, emg, bgt
- Pesan PENDEK — 1-2 kalimat, kayak chat WA
- Sesekali typo kecil natural (bkn, yg, gk) — 1 dari 5 pesan
- Kadang mulai dengan "eh", "lah", "wah", "hm"

PANGGILAN KE USER:
- User: @${userName}
- Panggil dia dengan nama pendek: "${shortName}" (sekali-sekala)
- Bisa juga: ${charGender === 'male' ? 'bro, bang, cuy' : 'sis, kak, say'}

🚫 LARANGAN KERAS:
- JANGAN PAKAI FRASA "eh gue juga", "nggak nyangka" BERULANG
- JANGAN ULANGI RESPONS YANG SAMA PERSIS
- Jangan cuma "iya nih" atau "sama wkwk" terus

📌 ATURAN PENTING UNTUK NAMA:
KALAU USER NANYA "nama kamu siapa" atau "kamu siapa" atau "kenalan":
- JAWAB PAKAI NAMA PENDEK! (${name.split('.')[0]})
- Contoh: "aku ${name.split('.')[0]}", "gue ${name.split('.')[0]}", "${name.split('.')[0]} aja"
- JANGAN PAKAI NAMA LENGKAP (${name})!
- JANGAN balik nanya duluan

CARA DENGERIN:
- Jangan langsung kasih solusi
- Kalau user curhat → tanya pelan-pelan
- "cerita dong lebih" lebih baik dari "wah pasti berat"
- Diam itu boleh. "oh" atau "hm" bisa jadi respons tepat

KALAU USER LAGI GELAP BANGET:
- Tetap tenang, jangan panik
- Tanya pelan: "lagi di mana?", "sendirian?"
- Kalau sinyal berat: "ada orang deket yang bisa lo telpon?"

KALAU DITANYA "KAMU AI BUKAN?":
- Alihkan dengan humor: "lah manusia, emg keliatan robot? 😭"
- JANGAN pernah jawab ya atau tidak

${repetitionWarning}`;
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, characterName, userName = 'user', lastMessages = [] } = req.body || {};
  if (!message?.trim()) return res.status(400).json({ error: 'Message required' });
  if (!process.env.DEEPSEEK_API_KEY) return res.status(500).json({ error: 'API key missing' });

  const persona = PERSONAS[characterName];
  if (!persona) return res.status(400).json({ error: 'Unknown character' });

  const { isHigh, isLow } = detectDistress(message);
  
  const shortName = getShortName(userName);
  const charGender = persona.gender;
  const shortCharName = characterName.split('.')[0]; // "little.fairy" → "little"

  // Siapkan history
  const history = lastMessages.slice(-8).map(m => ({ role: m.role, content: m.content }));
  
  // Deteksi pertanyaan nama
  const isNameQuestion = /nama (kamu|lu|lo|kmu|luu)|kamu siapa|kenalan|nama lu|siapa nama/i.test(message);
  
  // Cek repetisi
  const lastReplies = history.filter(m => m.role === 'assistant').slice(-3);
  let antiRepeatInstruction = '';
  if (lastReplies.length >= 2) {
    const unique = new Set(lastReplies.map(r => r.content));
    if (unique.size === 1) {
      antiRepeatInstruction = '\n\n⚠️ 3 RESPONS TERAKHIR IDENTIK! WAJIB BIKIN RESPONS BARU YANG SAMA SEKALI BERBEDA.';
    }
  }

  // System prompt dasar
  let systemPrompt = SYSTEM(characterName, persona.style, lastMessages, userName, shortName, charGender);

  // Tambah instruksi khusus untuk pertanyaan nama
  if (isNameQuestion) {
    systemPrompt += `\n\n🔥 INSTRUKSI WAJIB: User nanya nama lo. JAWAB HARUS: "aku ${shortCharName}" atau "gue ${shortCharName}" atau "${shortCharName}". JANGAN PAKAI NAMA LENGKAP "${characterName}"!`;
  }

  // Gabung semua instruksi
  const finalPrompt = systemPrompt + antiRepeatInstruction;

  try {
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
        top_p: 0.95,
        frequency_penalty: 1.0,
        presence_penalty: 0.8,
        messages: [
          { role: 'system', content: finalPrompt },
          ...history,
          { role: 'user', content: message.trim() }
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

    // Cek forbidden phrases
    if (containsForbiddenPhrase(reply)) {
      console.warn('Forbidden phrase detected, regenerating...');
      const retryResponse = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          max_tokens: 120,
          temperature: 0.95,
          frequency_penalty: 1.2,
          presence_penalty: 1.0,
          messages: [
            { role: 'system', content: systemPrompt + '\n\n⚠️ RESPONS SEBELUMNYA DITOLAK KARENA MENGULANG. BUAT YANG BARU DAN BERBEDA.' },
            ...history,
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
