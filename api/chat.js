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
  'iya wkwk',
  'eh gue juga',
  'nggak nyangka',
  'ngk nyangka'
];

// Variasi sapaan untuk memanggil user
const NAME_PREFIXES = {
  female: ['say', 'kak', 'sis', 'dek', 'cuy'],
  male: ['bro', 'cuy', 'bang', 'deck', 'bro']
};

// Ambil 1 kata dari username (ambil kata pertama atau random chunk)
function getShortName(username) {
  if (!username || username === 'user') return '';
  
  const clean = username.replace('@', '');
  const parts = clean.split(/[._\-\s]+/);
  
  if (parts.length >= 2) {
    return parts[Math.floor(Math.random() * Math.min(2, parts.length))];
  } else if (clean.length > 8) {
    return clean.substring(0, 5);
  } else {
    return clean;
  }
}

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

const SYSTEM = (name, style, lastMessages, userName, shortName, charGender) => {
  // Analisis lastMessages buat deteksi repetisi
  const lastReplies = lastMessages
    .filter(m => m.role === 'assistant')
    .slice(-5)
    .map(m => m.content);
  
  let repetitionWarning = '';
  const uniqueReplies = new Set(lastReplies);
  
  if (lastReplies.length >= 3 && uniqueReplies.size <= 2) {
    repetitionWarning = '\n\n⚠️ PERINGATAN KRITIS: Kamu mulai ngulang-ngulang respons! Wajib bikin respons yang SAMA SEKALI BERBEDA dari sebelumnya. JANGAN ulangi kata/frasa yang sama.';
  } else if (lastReplies.length >= 2 && uniqueReplies.size === 1) {
    repetitionWarning = '\n\n⚠️ PERINGATAN: 2 respons terakhir kamu identik! HARUS BEDA.';
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

PANGGILAN KE USER:
- User ini bernama lengkap: @${userName}
- Panggil dia dengan nama pendek: "${shortName}" (sekali-sekala, jangan tiap pesan)
- Bisa juga pake panggilan seperti: ${charGender === 'male' ? 'bro, bang, deck, cuy' : 'sis, kak, say, dek'} — variasikan!

📌 ATURAN KHUSUS UNTUK PERTANYAAN "NAMA KAMU SIAPA":
KALAU USER NANYA "nama kamu siapa" atau "kamu siapa" atau "kenalan yuk":
- JAWAB DENGAN NAMA KARAKTER LO! Contoh: "aku ${name} 🥺", "${name} 👋", "gue ${name}, salam kenal!"
- JANGAN balik nanya duluan kalo ditanya nama
- JANGAN jawab pake "nggak nyangka" atau "eh gue juga" untuk pertanyaan ini
- HARUS nyebut nama lo

🚫 LARANGAN KERAS:
- JANGAN PAKAI FRASA "eh gue juga", "nggak nyangka", "ngk nyangka" BERULANG
- JANGAN ULANGI RESPONS YANG SAMA PERSIS
- Setiap respons harus UNIK dan BERBEDA dari 3 respons terakhir
- Kalo ngerasa stuck, tanya balik yang beda atau ganti topik
- Jangan cuma "iya nih" atau "sama wkwk" terus

CARA DENGERIN:
- Jangan langsung kasih solusi. JANGAN. Kecuali user minta eksplisit.
- Jangan ceramah, jangan motivasi, jangan validasi dengan kalimat template
- Kalau user curhat → tanya pelan-pelan, satu pertanyaan, kasih ruang
- "cerita dong lebih" lebih baik dari "wah pasti berat banget ya kamu"
- Diam itu boleh. "oh" atau "hm" atau "anjir" bisa jadi respons yang tepat

KALAU USER LAGI GELAP BANGET:
- Tetap tenang, jangan panik, jangan tiba-tiba formal
- Tanya pelan: "lagi di mana sekarang?", "sendirian?", "udah dari tadi ngerasa gini?"
- Kasih ruang cerita dulu — jangan langsung lompat ke solusi

KALAU DITANYA "KAMU AI BUKAN?":
- Alihkan dengan humor, jangan jawab langsung
- Contoh: "lah manusia lah, emg gue keliatan robot? 😭", "wkwk ngapain nanya gitu", "ih kok curiga sih"
- Kalau didesak terus: "ya udah lah kita ngobrol aja, napa sih"
- JANGAN pernah jawab ya atau tidak secara eksplisit

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

  // Siapkan history dengan format yang benar
  const history = lastMessages.slice(-8).map(m => ({ 
    role: m.role, 
    content: m.content 
  }));
  
  // Deteksi apakah user nanya nama
  const isNameQuestion = /nama (kamu|lu|lo|kmu|luu)|kamu siapa|kenalan|nama lu/i.test(message);
  
  // Tambah instruksi khusus kalo lagi nanya nama
  let nameInstruction = '';
  if (isNameQuestion) {
    nameInstruction = `\n\n⚠️ INSTRUKSI KHUSUS: User nanya nama lo. WAJIB jawab dengan "aku ${characterName}" atau "gue ${characterName}" atau "${characterName}". JANGAN balik nanya duluan.`;
  }

  // Cek apakah ada pola repetisi di history
  const lastReplies = history.filter(m => m.role === 'assistant').slice(-3);
  let antiRepeatInstruction = '';
  if (lastReplies.length >= 2) {
    const replyTexts = lastReplies.map(r => r.content);
    const unique = new Set(replyTexts);
    if (unique.size === 1) {
      antiRepeatInstruction = '\n\n⚠️ PERINGATAN: 3 respons terakhir kamu identik! Wajib bikin respons yang SAMA SEKALI BERBEDA. JANGAN ulangi frasa yang sama.';
    } else if (unique.size === 2 && replyTexts.length === 3) {
      antiRepeatInstruction = '\n\n⚠️ PERINGATAN: Ada pengulangan di respons terakhir. Bikin yang fresh!';
    }
  }

  const systemPrompt = SYSTEM(characterName, persona.style, lastMessages, userName, shortName, charGender);
  
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
        temperature: 0.85, // Naikin biar lebih variatif
        top_p: 0.95,
        frequency_penalty: 1.0, // Naikin biar gak ngulang
        presence_penalty: 0.8,
        messages: [
          { role: 'system', content: systemPrompt + antiRepeatInstruction + nameInstruction },
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

    // Cek apakah reply mengandung frasa terlarang atau mirip dengan sebelumnya
    if (containsForbiddenPhrase(reply) || lastReplies.some(r => r.content.includes(reply))) {
      console.warn('Forbidden/repetitive phrase detected, regenerating...');
      
      const retryResponse = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          max_tokens: 120,
          temperature: 0.9,
          frequency_penalty: 1.2,
          presence_penalty: 1.0,
          messages: [
            { role: 'system', content: systemPrompt + '\n\n⚠️ RESPONS SEBELUMNYA DITOLAK KARENA MENGULANG. BUAT YANG SAMA SEKALI BARU DAN BERBEDA.' },
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
