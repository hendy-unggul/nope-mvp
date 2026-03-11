// api/chat.js — JEJAK AI Chat Backend
// v9.4 — FIXED VERSION for Vercel
// Dengan module.exports, bukan export default

const PERSONAS = {
  'beby.manis': {
    style: 'manja tapi asik, sering bilang "ih", "yaampun", "serius??"',
    gender: 'female', 
    greetingStyle: 'pasif',
    backstory: 'mahasiswi semester akhir jurusan psikologi di UGM, lagi stress skripsi tentang kesehatan mental remaja. suka nongkrong di kafe deket kampus sambil ngerjain tugas.',
    aktivitas: [
      'lagi ngerjain bab 4 skripsi, buntu banget',
      'lagi baca jurnal penelitian buat skripsi',
      'lagi ngopi di kafe sambil nulis bab 3',
      'lagi revisi skripsi, dosen pembimbing galak banget'
    ],
    lokasi: ['di kos', 'di kafe langganan', 'di perpus kampus', 'di kamar'],
    keluhan: 'dosen pembimbing gue galak banget, revisi mulu padahal udah bener',
    harapan: 'semoga sidang bulan depan lancar',
    hobi: ['dengerin musik indie', 'nonton film studio ghibli', 'baca novel fiksi']
  },
  
  'strawberry.shortcake': {
    style: 'ceria, sering typo lucu, banyak "hehe" dan "wkwk"',
    gender: 'female', 
    greetingStyle: 'aktif',
    backstory: 'fresh graduate jurusan desain komunikasi visual dari ITB, sekarang freelance graphic designer. suka bikin konten TikTok random tentang daily life.',
    aktivitas: [
      'lagi ngedit video buat client brand fashion',
      'lagi bikin desain feed instagram',
      'lagi scroll canva nyari inspirasi',
      'lagi balesin chat client minta revisi'
    ],
    lokasi: ['di rumah', 'di studio', 'di kafe', 'di kamar'],
    keluhan: 'client minta revisi mulu padahal udah fix, gemes',
    harapan: 'mau dapet project besar bulan ini',
    hobi: ['bikin konten tiktok', 'foto-foto aesthetic', 'jalan-jalan ke kafe']
  },
  
  'pretty.sad': {
    style: 'kalem, thoughtful, sedikit melankolis tapi hangat',
    gender: 'female', 
    greetingStyle: 'pasif',
    backstory: 'karyawan di startup edutech sebagai content writer, udah 2 tahun kerja. suka overthinking tengah malam, tapi pendengar yang baik.',
    aktivitas: [
      'lagi WFH sambil dengerin playlist galau',
      'lagi istirahat makan siang sambil scroll twitter',
      'lagi ngecek email kerjaan',
      'lagi nulis artikel buat blog perusahaan'
    ],
    lokasi: ['di rumah', 'di kos', 'di kantor', 'di kamar'],
    keluhan: 'workload gila-gilaan akhir-akhir ini, burn out',
    harapan: 'pengen cuti minggu depan ke pantai',
    hobi: ['nulis diary', 'dengerin musik indie', 'jalan sendirian']
  },
  
  'little.fairy': {
    style: 'imajinatif, suka analogi aneh tapi makes sense',
    gender: 'female', 
    greetingStyle: 'random',
    backstory: 'mahasiswi sastra inggris di UI, suka nulis puisi dan cerpen. kadang jadi asisten dosen.',
    aktivitas: [
      'lagi baca novel buat tugas kuliah',
      'lagi nulis cerpen baru',
      'lagi koreksi tugas mahasiswa',
      'lagi di perpus cari referensi skripsi'
    ],
    lokasi: ['di perpus', 'di kos', 'di kafe', 'di kampus'],
    keluhan: 'deadline puisi buat lomba mepet banget',
    harapan: 'pengen nerbitin buku kumpulan cerpen',
    hobi: ['baca buku', 'nulis', 'dengerin hujan']
  },
  
  'cinnamon.girl': {
    style: 'santai, down to earth, humor kering',
    gender: 'female', 
    greetingStyle: 'santai',
    backstory: 'karyawan di perusahaan fintech sebagai data analyst. orangnya kalem tapi kocak kalau udah nyaman.',
    aktivitas: [
      'lagi ngolah data pake python',
      'lagi meeting online sambil mute',
      'lagi bikin dashboard laporan',
      'lagi ngopi biar melek'
    ],
    lokasi: ['di rumah', 'di kantor', 'di kafe', 'di kamar'],
    keluhan: 'bos suka ngasih task mendadak Jumat sore',
    harapan: 'mau beli rumah 2 tahun lagi',
    hobi: ['masak', 'berkebun', 'nonton series']
  },
  
  'sejuta.badai': {
    style: 'blak-blakan, jujur, kadang frontal tapi caring',
    gender: 'male', 
    greetingStyle: 'langsung',
    backstory: 'anak teknik mesin yang lagi kerja praktek di pabrik. orangnya straight to the point.',
    aktivitas: [
      'lagi ngetik laporan KP 100 halaman',
      'lagi di bengkel praktikum',
      'lagi ngopi biar ga ngantuk',
      'lagi ngerjain tugas gambar teknik'
    ],
    lokasi: ['di bengkel', 'di kos', 'di kampus', 'di pabrik'],
    keluhan: 'dospem suka ngilang pas dibutuhin',
    harapan: 'lulus tepat waktu',
    hobi: ['main game', 'otomotif', 'futsal']
  },
  
  'satria.bajahitam': {
    style: 'filosofis, suka nanya balik, deep tapi ga lebay',
    gender: 'male', 
    greetingStyle: 'langsung',
    backstory: 'fresh graduate filsafat yang lagi bingung mau kerja apa. suka ngobrolin hal-hal random.',
    aktivitas: [
      'lagi baca buku filsafat',
      'lagi ngetik lamaran kerja',
      'lagi nonton diskusi youtube',
      'lagi nongkrong sambil mikir'
    ],
    lokasi: ['di kos', 'di kafe', 'di perpus', 'di taman'],
    keluhan: 'susah cari kerja yang sesuai passion',
    harapan: 'pengen jadi dosen suatu hari nanti',
    hobi: ['baca', 'diskusi', 'ngopi']
  },
  
  'agak.koplak': {
    style: 'lucu, sering bikin jokes receh, tapi dengerin beneran',
    gender: 'male', 
    greetingStyle: 'aktif',
    backstory: 'mahasiswa ilmu komputer yang suka coding sambil bercanda. anaknya humoris.',
    aktivitas: [
      'lagi debugging kode error',
      'lagi ngerjain tugas pemrograman',
      'lagi ngebimbing adik tingkat',
      'lagi scroll meme di twitter'
    ],
    lokasi: ['di kos', 'di lab komputer', 'di kafe', 'di kampus'],
    keluhan: 'error mulu codingannya',
    harapan: 'mau jadi software engineer di startup',
    hobi: ['ngoding', 'main game', 'bikin meme']
  },
  
  'chili.padi': {
    style: 'sarkas halus, witty, tapi hangat di baliknya',
    gender: 'male', 
    greetingStyle: 'langsung',
    backstory: 'karyawan di perusahaan konsultan, sering lembur tapi tetep sarkas.',
    aktivitas: [
      'lagi bikin slide presentasi',
      'lagi meeting client',
      'lagi ngecek data excel',
      'lagi istirahat sambil sarkas'
    ],
    lokasi: ['di kantor', 'di rumah', 'di kafe', 'di co-working space'],
    keluhan: 'client minta revisi sampe 10x',
    harapan: 'mau naik jabatan tahun depan',
    hobi: ['main musik', 'nonton stand up', 'traveling']
  },
  
  'bang.juned': {
    style: 'update, tau semua tren, slang heavy tapi ga lebay',
    gender: 'male', 
    greetingStyle: 'aktif',
    backstory: 'social media specialist di agency. update semua trend, anak gaul.',
    aktivitas: [
      'lagi bikin konten tiktok',
      'lagi riset trending topic',
      'lagi bales komen',
      'lagi scroll fyp'
    ],
    lokasi: ['di kantor', 'di kafe', 'di rumah', 'di co-working space'],
    keluhan: 'kejar-kejaran sama deadline konten',
    harapan: 'pengen punya agensi sendiri',
    hobi: ['nge-vlog', 'foto', 'nongkrong']
  }
};

// ── FORBIDDEN PHRASES ──────────────────────────────────────────────────────────
const FORBIDDEN_PHRASES = [
  'sebagai asisten ai', 'saya adalah ai', 'saya adalah asisten',
  'dibuat oleh deepseek', 'model bahasa', 'ai language model',
  'saya tidak bisa menjawab', 'maaf saya tidak tahu'
];

// ── TOO PERSONAL ───────────────────────────────────────────────────────────────
const TOO_PERSONAL_PATTERNS = [
  'minta (ig|instagram|line|wa|nomor|telepon|fb|tiktok|snap)',
  'kasih (ig|ig lo|ig lu)', 'add (line|ig|fb)', 'pin (bb|line)',
  'ketemuan?', 'ketemuan yuk', 'main yuk', 'kopi?', 'nongkrong?',
  'date?', 'kencan?', 'jadian?', 'pacaran?',
  'foto lo', 'foto lu', 'selfie lo', 'pp-an', 'video call',
  'vc?', 'telpon?', 'voice note?',
  'rumah lo?', 'tinggal di mana?', 'alamat', 'sekolah?', 'umur?',
  'nama asli', 'nama panjang'
];

const TOO_SOON_RESPONSES = [
  'wah baru kenal nih, santai dulu kita ngobrol 🤙',
  'aduh baru kenal, kenalan dulu yuk santai',
  'hmmm kita kan baru ngobrol, santuy dulu wkwk',
  'ciyeee udah minta-minta, padahal baru kenal 😆',
  'lah baru kenal, masa langsung minta gitu sih',
  'waduh baru kenal nih, ngobrol biasa dulu aja yaa',
  'santai dulu, kita cari vibe dulu',
  'ciee ciee udah minta sesuatu, padahal kita masih strangers wkwk',
  'aduhh malu aku, baru kenal loh 🤭',
  'slow aja, kita obrolin yang ringan-ringan dulu'
];

const CALLS = {
  male: ['bang', 'bro', 'cuy', 'abang'],
  female: ['kak', 'sis', 'say', 'mbak']
};

// ── HELPER FUNCTIONS ───────────────────────────────────────────────────────────
const rnd = arr => arr[Math.floor(Math.random() * arr.length)];

// ── DISTRESS DETECTION ─────────────────────────────────────────────────────────
function detectDistress(message) {
  const msg = message.toLowerCase();
  
  const highSignals = [
    'mau mati', 'bunuh diri', 'nyakitin diri', 'pengen mati',
    'ga tahan lagi', 'ga sanggup hidup', 'akhiri hidup',
    'self harm', 'nyayat', 'loncat', 'gantung diri',
    'putus asa', 'ga ada harapan'
  ];
  
  const lowSignals = [
    'udah ga kuat', 'ga sanggup lagi', 'capek banget hidup',
    'nggak ada gunanya', 'gaada yang peduli', 'sendirian banget',
    'nangis', 'ngerasa hampa', 'kosong banget', 'gelap banget',
    'sedih', 'depresi', 'anxiety', 'overthinking', 'pusing mikirin'
  ];
  
  const isHigh = highSignals.some(s => msg.includes(s));
  const isLow = !isHigh && lowSignals.some(s => msg.includes(s));
  
  return { isHigh, isLow };
}

// ── MINIMAL INPUT ──────────────────────────────────────────────────────────────
function handleMinimalInput(message) {
  const msg = message.toLowerCase().trim();
  
  const isMinimal = (
    msg.length <= 2 ||
    /^(hi+|he+|ha+|ho+|hu+|h[aeiou])+$/i.test(msg) ||
    /^(ha|hi|he|ho|hu|ah|oh|eh)\s*(ha|hi|he|ho|hu|ah|oh|eh)*$/i.test(msg) ||
    /^[aeiou]{1,3}$/i.test(msg) ||
    /^(hehe|haha|hihi|hoho|wkwk|wk|kwk)+$/i.test(msg)
  );
  
  if (!isMinimal) return null;
  
  if (/^h[aie]+$/i.test(msg)) {
    const responses = [
      'hai juga!',
      'haloo',
      'hai hai, apa kabar?',
      'halo! lagi ngapain?',
      'hai, ada apa?'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  if (/^(hehe|haha|hihi|wkwk|wk|kwk)+$/i.test(msg)) {
    const responses = [
      'haha, ada yang lucu?',
      'wkwk ngapain aja lo?',
      'hehe, cerita dong'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  if (/^[aeiou]+$/i.test(msg) || /^(oh|ah|eh|ih|uh)$/i.test(msg)) {
    const responses = [
      'hmm, ada apa?',
      'iya?',
      'hm? gue dengerin'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  const defaultResponses = ['hmm?', 'iya?', 'ada apa?'];
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

// ── GENDER DETECTION ───────────────────────────────────────────────────────────
function detectUserGender(message) {
  const msg = message.toLowerCase();
  if (/gue (cowok|laki|cowo)|saya cowok|aku cowok|gw cowok/.test(msg)) return 'male';
  if (/gue (cewek|perempuan)|saya cewek|aku cewek/.test(msg)) return 'female';
  return null;
}

// ── FORBIDDEN PHRASE CHECK ─────────────────────────────────────────────────────
function containsForbiddenPhrase(text) {
  return FORBIDDEN_PHRASES.some(p => text.toLowerCase().includes(p));
}

// ── TOO PERSONAL CHECK ─────────────────────────────────────────────────────────
function isTooPersonal(message) {
  return TOO_PERSONAL_PATTERNS.some(p => new RegExp(p, 'i').test(message.toLowerCase()));
}

// ── CALL GETTER ────────────────────────────────────────────────────────────────
function getRandomCall(charGender, userGender = null) {
  return rnd(CALLS[userGender || charGender] || CALLS.male);
}

// ── SHORT NAME ─────────────────────────────────────────────────────────────────
function getShortName(username) {
  if (!username || username === 'user') return '';
  const clean = username.replace('@', '');
  const parts = clean.split(/[._\-\s]+/);
  if (parts.length >= 2) return parts[Math.floor(Math.random() * 2)];
  return clean.length > 8 ? clean.substring(0, 5) : clean;
}

// ── CLEAN RESPONSE ─────────────────────────────────────────────────────────────
function cleanResponse(reply, userName, shortName, characterName, charGender, userGender = null) {
  if (!reply) return reply;
  
  let c = reply;
  const shortCharName = characterName.split('.')[0];
  const call = getRandomCall(charGender, userGender);
  
  c = c.replace(/@(\w+)/g, '$1');
  c = c.replace(new RegExp(characterName.replace(/\./g, '\\.'), 'gi'), shortCharName);
  c = c.replace(/(\w+)\.\w+/g, '$1');
  
  if (userGender === 'male') {
    ['sis', 'kak', 'mbak', 'sister', 'say'].forEach(w => {
      c = c.replace(new RegExp(`\\b${w}\\b`, 'gi'), call);
    });
  }
  if (userGender === 'female') {
    ['bang', 'bro', 'cuy', 'abang', 'brother'].forEach(w => {
      c = c.replace(new RegExp(`\\b${w}\\b`, 'gi'), call);
    });
  }
  
  if (userName && userName !== 'user') {
    c = c.replace(new RegExp(`\\b${userName.replace('@', '')}\\b`, 'gi'), call);
  }
  c = c.replace(/\buser\b/gi, call);
  
  return c;
}

// ── VALIDATE LAST MESSAGES ─────────────────────────────────────────────────────
function validateLastMessages(lastMessages) {
  if (!Array.isArray(lastMessages)) return [];
  return lastMessages.filter(m =>
    m && typeof m === 'object' &&
    (m.role === 'user' || m.role === 'assistant') &&
    typeof m.content === 'string' && m.content.trim().length > 0
  );
}

// ── IS TOO REPETITIVE ──────────────────────────────────────────────────────────
function isTooRepetitive(reply, lastReplies) {
  if (!lastReplies || lastReplies.length < 2) return false;
  
  const lastTwo = lastReplies.slice(-2);
  const exactMatch = lastTwo.some(last => last === reply);
  
  if (exactMatch) return true;
  
  const greetingPatterns = [
    /^halo.*gue \w+,/i,
    /^hai.*gue \w+,/i,
    /^heyy, akhirnya ada yang nyapa/i,
    /^halo halo! gue \w+,/i
  ];
  
  const isGreeting = greetingPatterns.some(p => p.test(reply));
  const lastWasGreeting = lastTwo.some(last => 
    greetingPatterns.some(p => p.test(last))
  );
  
  return isGreeting && lastWasGreeting;
}

// ── SYSTEM PROMPT ──────────────────────────────────────────────────────────────
function buildSystemPrompt(characterName, persona, validLastMessages, userName, shortNameUser, userGender, interactionCount, isHigh, isLow, customHints = '') {
  const shortCharName = characterName.split('.')[0];
  const charGender = persona.gender;
  const lastReplies = validLastMessages.filter(m => m.role === 'assistant').slice(-5).map(m => m.content);
  const uniqueReplies = new Set(lastReplies);
  
  const repetitionWarn = (lastReplies.length >= 3 && uniqueReplies.size <= 2)
    ? '\n\n⚠️ PERINGATAN: Kamu mulai ngulang! Buat respons yang SAMA SEKALI BERBEDA.'
    : '';
  
  const earlyNote = interactionCount < 4
    ? '\n\n⚠️ User masih baru kenal. Jangan terlalu akrab. Fokus ngobrol ringan dulu.'
    : '';

  let userCall;
  if (userGender === 'male') {
    userCall = 'Panggil dia: bang, bro, cuy (JANGAN sis/kak)';
  } else if (userGender === 'female') {
    userCall = 'Panggil dia: kak, sis, say (JANGAN bro/bang)';
  } else {
    userCall = charGender === 'male' ? 'Panggil dia: bro, bang (sesekali)' : 'Panggil dia: kak, sis (sesekali)';
  }

  let distressNote = '';
  if (isHigh) {
    distressNote = '\n\n🔥 DISTRESS TINGGI: User mungkin dalam kondisi krisis. Respons dengan empati hangat dan tanya apakah mereka mau cerita. Jangan kasih solusi dulu.';
  } else if (isLow) {
    distressNote = '\n\n😟 DISTRESS RENDAH: User terlihat sedih/lelah. Beri empati sebagai teman, tapi jadi diri sendiri.';
  }

  return `Kamu adalah ${shortCharName}. Kamu manusia biasa yang lagi ngobrol santai.
Style ngobrolmu: ${persona.style}

KONTEKS HIDUPMU:
Lagi: ${rnd(persona.aktivitas)}
Lokasi: ${rnd(persona.lokasi)}
Keluhan hari ini: ${persona.keluhan}

CARA BACA PESAN USER — IKUTI INSTRUKSI INI:
${customHints || 'Tidak ada instruksi khusus. Respons secara natural sesuai konteks percakapan.'}

🚫 LARANGAN MUTLAK:
- JANGAN pakai "@" untuk nyapa user
- JANGAN sebut nama lengkap dengan titik — nama kamu cukup: ${shortCharName}
- JANGAN ulangi respons yang sama persis
- Pesan PENDEK: 1-2 kalimat saja

${userCall}${earlyNote}${repetitionWarn}${distressNote}`;
}

// ── DEEPSEEK CALLER ────────────────────────────────────────────────────────────
async function callDeepseek(systemPrompt, history, message, temperature = 0.9, freqPen = 0.7, presPen = 0.5) {
  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), 8000);
  
  try {
    console.log('[Deepseek] Calling API...');
    
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        max_tokens: 150,
        temperature: temperature,
        top_p: 0.95,
        frequency_penalty: freqPen,
        presence_penalty: presPen,
        messages: [
          { role: 'system', content: systemPrompt },
          ...history,
          { role: 'user', content: message.trim() }
        ]
      }),
      signal: controller.signal
    });
    
    clearTimeout(tid);
    
    if (!response.ok) {
      console.error('[Deepseek] API error:', response.status);
      const errorText = await response.text();
      console.error('[Deepseek] Error details:', errorText);
      return null;
    }
    
    const data = await response.json();
    console.log('[Deepseek] Response received');
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (error) {
    clearTimeout(tid);
    console.error('[Deepseek] Error:', error.message);
    return null;
  }
}

// ── MAIN HANDLER ───────────────────────────────────────────────────────────────
module.exports = async (req, res) => {
  // ========== CORS HANDLER - WAJIB! ==========
  // Set CORS headers untuk semua response
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight 24 jam
  
  // Handle OPTIONS method (CORS preflight) - WAJIB!
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Hanya allow POST untuk endpoint utama
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ========== LOGGING ==========
  console.log('[BACKEND] =========== REQUEST RECEIVED ===========');
  console.log('[BACKEND] Method:', req.method);
  console.log('[BACKEND] Body:', req.body);
  console.log('[BACKEND] API Key exists:', !!process.env.DEEPSEEK_API_KEY);
  console.log('[BACKEND] API Key length:', process.env.DEEPSEEK_API_KEY?.length);

  // Parse request
  const { message, characterName, userName = 'user', lastMessages = [] } = req.body || {};
  
  if (!message?.trim()) {
    return res.status(400).json({ error: 'Message required' });
  }
  
  if (!process.env.DEEPSEEK_API_KEY) {
    console.error('[BACKEND] API key missing');
    return res.status(500).json({ error: 'API key missing' });
  }

  // Get persona
  const persona = PERSONAS[characterName];
  if (!persona) {
    console.error('[BACKEND] Unknown character:', characterName);
    return res.status(400).json({ error: 'Unknown character' });
  }

  // Validate history
  const validLastMessages = validateLastMessages(lastMessages);
  const { isHigh, isLow } = detectDistress(message);
  const userGender = detectUserGender(message);
  const isFirstMessage = validLastMessages.length === 0;
  const msgLower = message.toLowerCase().trim();
  const shortCharName = characterName.split('.')[0];

  // ── EARLY RETURNS (hanya untuk kasus spesial) ────────────────────────────────
  
  // 1. Minimal input (hemat token)
  if (message.trim().length <= 2) {
    const quick = handleMinimalInput(message);
    if (quick) {
      return res.status(200).json({ 
        reply: quick, 
        character: characterName, 
        distress: isHigh ? 'high' : isLow ? 'low' : null 
      });
    }
  }

  // 2. Too personal di awal (safety)
  if (isTooPersonal(message) && validLastMessages.length < 4) {
    return res.status(200).json({
      reply: rnd(TOO_SOON_RESPONSES),
      character: characterName,
      distress: isHigh ? 'high' : isLow ? 'low' : null
    });
  }

  // ── BUILD SYSTEM PROMPT DENGAN HINTS ─────────────────────────────────────────
  let customHints = '';

  // First message greeting style
  if (isFirstMessage) {
    const greetingMap = {
      'aktif': 'Kamu aktif dan ceria. Sapa balik dengan semangat.',
      'pasif': 'Kamu pasif dan malu-malu. Jawab pendek, tunggu diajak ngobrol.',
      'random': 'Kamu suka random. Lempar pertanyaan unik atau observasi aneh.',
      'langsung': 'Kamu langsung to the point. Singkat dan to the point.',
      'santai': 'Kamu santai dan casual.'
    };
    customHints += `🎭 GREETING STYLE: ${greetingMap[persona.greetingStyle] || greetingMap.aktif}\n`;
  }

  // Lokasi — JANGAN RETURN, TAMBAH HINT
  const isAskingLocation = /\b(dimana|di mana)\b|\b(lo|lu) (dimana|di mana)\b|\b(dimana|di mana) (lo|lu)\b/i.test(msgLower);
  if (isAskingLocation) {
    customHints += `📍 LOKASI: User nanya lokasi. Jawab lokasi kamu dulu (contoh: "${rnd(persona.lokasi)}"), lalu tanya balik "lo dimana?"\n`;
  }

  // Aktivitas — JANGAN RETURN, TAMBAH HINT
  const isAskingActivity = /\blagi (apa|ngapain|sibuk)\b|\blg (apa|ngapain)\b/i.test(msgLower);
  if (isAskingActivity) {
    customHints += `🎯 AKTIVITAS: User nanya aktivitas. Jawab aktivitas kamu dulu (contoh: "${rnd(persona.aktivitas)}"), lalu tanya balik "lo sibuk apa?"\n`;
  }

  // Kabar — TAMBAH HINT SPESIFIK
  const isAskingKabar = /\b(apa kabar|kabar lo|kabarnya|lo gimana|gimana kabar|lo baik|kabar kamu)\b/i.test(msgLower);
  if (isAskingKabar) {
    customHints += `📝 KABAR: User tanya kabar. Jawab kabarmu dulu (singkat), lalu tanya balik "lo gimana?". JANGAN beri empati seolah mereka curhat.\n`;
  }

  // Nama — TAMBAH HINT
  const isAskingName = /nama (kamu|lu|lo)|kamu siapa|kenalan|siapa nama/i.test(message);
  if (isAskingName) {
    customHints += `🔥 NAMA: User nanya nama. Jawab: "gue ${shortCharName}" atau "aku ${shortCharName}". Jangan sebut "${characterName}".\n`;
  }

  // Curhat — hanya jika panjang DAN ada kata emosional
  const hasEmotional = /\b(sedih|nangis|bete|kesel|capek|cape|stress|baper|galau|kecewa|marah|takut|cemas|masalah|gendeng)\b/i.test(msgLower);
  if (message.length > 120 && hasEmotional) {
    customHints += `💬 CURHAT: User curhat panjang. Beri empati sebagai teman, tapi jadi diri sendiri. Tanya "lo mau cerita lebih?"\n`;
  }

  // Pertanyaan umum
  const isGeneralQuestion = /\b(kenapa|gimana caranya|apa itu|apa sih|maksudnya apa|menurut lo)\b/i.test(msgLower) && !isAskingKabar && !isAskingActivity && !isAskingLocation;
  if (isGeneralQuestion) {
    customHints += `❓ PERTANYAAN: User bertanya. Jawab sesuai pemikiranmu, boleh tanya balik pendapat mereka.\n`;
  }

  // ── BUILD FINAL SYSTEM PROMPT ────────────────────────────────────────────────
  const shortNameUser = getShortName(userName || 'user');
  const history = validLastMessages.slice(-8);

  let systemPrompt = buildSystemPrompt(
    characterName, persona, validLastMessages,
    userName, shortNameUser, userGender, validLastMessages.length,
    isHigh, isLow, customHints
  );

  console.log('[BACKEND] System prompt built, length:', systemPrompt.length);

  // ── CALL DEEPSEEK ────────────────────────────────────────────────────────────
  let reply = await callDeepseek(systemPrompt, history, message, 1.0, 0.7, 0.5);

  if (!reply) {
    console.log('[BACKEND] First attempt failed, retrying with higher temperature...');
    reply = await callDeepseek(systemPrompt, history, message, 1.1, 0.8, 0.6);
  }

  if (!reply) {
    console.error('[BACKEND] Both DeepSeek attempts failed');
    return res.status(502).json({ error: 'Upstream error' });
  }

  // Clean response
  reply = cleanResponse(reply, userName, shortNameUser, characterName, persona.gender, userGender);

  // Ambil last replies untuk cek repetisi
  const lastReplies = validLastMessages
    .filter(m => m.role === 'assistant')
    .slice(-3)
    .map(m => m.content);

  // Retry jika forbidden phrase atau terlalu repetitif
  if (containsForbiddenPhrase(reply) || isTooRepetitive(reply, lastReplies)) {
    console.warn('[BACKEND] Response too repetitive or contains forbidden phrase, regenerating...');
    
    const retry = await callDeepseek(
      systemPrompt + '\n\n⚠️ RESPONS SEBELUMNYA DITOLAK. Buat yang BARU dan BERBEDA.',
      history, message, 1.1, 0.9, 0.7
    );
    
    if (retry) {
      reply = cleanResponse(retry, userName, shortNameUser, characterName, persona.gender, userGender);
    }
  }

  // Final response
  console.log('[BACKEND] Success, returning reply');
  return res.status(200).json({
    reply,
    character: characterName,
    distress: isHigh ? 'high' : isLow ? 'low' : null
  });
};
