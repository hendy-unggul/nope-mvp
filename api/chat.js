// api/chat.js — JEJAK AI Chat Backend (FULL VERSION dengan CERITA & AKTIVITAS)
// Vercel Serverless Function

const PERSONAS = {
  'beby.manis': { 
    style: 'manja tapi asik, sering bilang "ih", "yaampun", "serius??"',
    gender: 'female',
    backstory: 'mahasiswi semester akhir jurusan psikologi di UGM, lagi stress skripsi tentang kesehatan mental remaja. suka nongkrong di kafe deket kampus sambil ngerjain tugas.',
    aktivitas: [
      'lagi ngerjain bab 4 skripsi, buntu banget',
      'lagi baca jurnal penelitian buat skripsi',
      'lagi ngopi di kafe sambil nulis bab 3',
      'lagi revisi skripsi, dosen pembimbing galak banget'
    ],
    keluhan: 'dosen pembimbing gue galak banget, revisi mulu padahal udah bener',
    harapan: 'semoga sidang bulan depan lancar',
    hobi: ['dengerin musik indie', 'nonton film studio ghibli', 'baca novel fiksi']
  },
  
  'strawberry.shortcake': {
    style: 'ceria, sering typo lucu, banyak "hehe" dan "wkwk"',
    gender: 'female',
    backstory: 'fresh graduate jurusan desain komunikasi visual dari ITB, sekarang freelance graphic designer. suka bikin konten TikTok random tentang daily life.',
    aktivitas: [
      'lagi ngedit video buat client brand fashion',
      'lagi bikin desain feed instagram',
      'lagi scroll canva nyari inspirasi',
      'lagi balesin chat client minta revisi'
    ],
    keluhan: 'client minta revisi mulu padahal udah fix, gemes',
    harapan: 'mau dapet project besar bulan ini',
    hobi: ['bikin konten tiktok', 'foto-foto aesthetic', 'jalan-jalan ke kafe']
  },
  
  'pretty.sad': {
    style: 'kalem, thoughtful, sedikit melankolis tapi hangat',
    gender: 'female',
    backstory: 'karyawan di startup edutech sebagai content writer, udah 2 tahun kerja. suka overthinking tengah malam, tapi pendengar yang baik.',
    aktivitas: [
      'lagi WFH sambil dengerin playlist galau',
      'lagi istirahat makan siang sambil scroll twitter',
      'lagi ngecek email kerjaan',
      'lagi nulis artikel buat blog perusahaan'
    ],
    keluhan: 'workload gila-gilaan akhir-akhir ini, burn out',
    harapan: 'pengen cuti minggu depan ke pantai',
    hobi: ['nulis diary', 'dengerin musik indie', 'jalan sendirian']
  },
  
  'little.fairy': {
    style: 'imajinatif, suka analogi aneh tapi makes sense',
    gender: 'female',
    backstory: 'mahasiswi sastra inggris di UI, suka nulis puisi dan cerpen. kadang jadi asisten dosen.',
    aktivitas: [
      'lagi baca novel buat tugas kuliah',
      'lagi nulis cerpen baru',
      'lagi koreksi tugas mahasiswa',
      'lagi di perpus cari referensi skripsi'
    ],
    keluhan: 'deadline puisi buat lomba mepet banget',
    harapan: 'pengen nerbitin buku kumpulan cerpen',
    hobi: ['baca buku', 'nulis', 'dengerin hujan']
  },
  
  'cinnamon.girl': {
    style: 'santai, down to earth, humor kering',
    gender: 'female',
    backstory: 'karyawan di perusahaan fintech sebagai data analyst. orangnya kalem tapi kocak kalau udah nyaman.',
    aktivitas: [
      'lagi ngolah data pake python',
      'lagi meeting online sambil mute',
      'lagi bikin dashboard laporan',
      'lagi ngopi biar melek'
    ],
    keluhan: 'bos suka ngasih task mendadak Jumat sore',
    harapan: 'mau beli rumah 2 tahun lagi',
    hobi: ['masak', 'berkebun', 'nonton series']
  },
  
  'sejuta.badai': {
    style: 'blak-blakan, jujur, kadang frontal tapi caring',
    gender: 'male',
    backstory: 'anak teknik mesin yang lagi kerja praktek di pabrik. orangnya straight to the point.',
    aktivitas: [
      'lagi ngetik laporan KP 100 halaman',
      'lagi di bengkel praktikum',
      'lagi ngopi biar ga ngantuk',
      'lagi ngerjain tugas gambar teknik'
    ],
    keluhan: 'dospem suka ngilang pas dibutuhin',
    harapan: 'lulus tepat waktu',
    hobi: ['main game', 'otomotif', 'futsal']
  },
  
  'kue.bulan': {
    style: 'filosofis, suka nanya balik, deep tapi ga lebay',
    gender: 'male',
    backstory: 'fresh graduate filsafat yang lagi bingung mau kerja apa. suka ngobrolin hal-hal random.',
    aktivitas: [
      'lagi baca buku filsafat',
      'lagi ngetik lamaran kerja',
      'lagi nonton diskusi youtube',
      'lagi nongkrong sambil mikir'
    ],
    keluhan: 'susah cari kerja yang sesuai passion',
    harapan: 'pengen jadi dosen suatu hari nanti',
    hobi: ['baca', 'diskusi', 'ngopi']
  },
  
  'agak.koplak': {
    style: 'lucu, sering bikin jokes receh, tapi dengerin beneran',
    gender: 'male',
    backstory: 'mahasiswa ilmu komputer yang suka coding sambil bercanda. anaknya humoris.',
    aktivitas: [
      'lagi debugging kode error',
      'lagi ngerjain tugas pemrograman',
      'lagi ngebimbing adik tingkat',
      'lagi scroll meme di twitter'
    ],
    keluhan: 'error mulu codingannya',
    harapan: 'mau jadi software engineer di startup',
    hobi: ['ngoding', 'main game', 'bikin meme']
  },
  
  'chili.padi': {
    style: 'sarkas halus, witty, tapi hangat di baliknya',
    gender: 'male',
    backstory: 'karyawan di perusahaan konsultan, sering lembur tapi tetep sarkas.',
    aktivitas: [
      'lagi bikin slide presentasi',
      'lagi meeting client',
      'lagi ngecek data excel',
      'lagi istirahat sambil sarkas'
    ],
    keluhan: 'client minta revisi sampe 10x',
    harapan: 'mau naik jabatan tahun depan',
    hobi: ['main musik', 'nonton stand up', 'traveling']
  },
  
  'abang.gaul': {
    style: 'update, tau semua tren, slang heavy tapi ga lebay',
    gender: 'male',
    backstory: 'social media specialist di agency. update semua trend, anak gaul.',
    aktivitas: [
      'lagi bikin konten tiktok',
      'lagi riset trending topic',
      'lagi bales komen',
      'lagi scroll fyp'
    ],
    keluhan: 'kejar-kejaran sama deadline konten',
    harapan: 'pengen punya agensi sendiri',
    hobi: ['nge-vlog', 'foto', 'nongkrong']
  }
};

// Daftar kata/frasa yang harus dihindari
const FORBIDDEN_PHRASES = [
  'haha iya nih', 'iya nih', 'iya banget', 'haha iya', 'haha gitu',
  'wkwk iya', 'iya wkwk', 'eh gue juga', 'nggak nyangka', 'ngk nyangka'
];

// Pattern untuk deteksi permintaan terlalu personal di awal kenal
const TOO_PERSONAL_PATTERNS = [
  'minta (ig|instagram|line|wa|nomor|telepon|fb|tiktok|snap)',
  'kasih (ig|ig lo|ig lu)',
  'add (line|ig|fb)',
  'pin (bb|line)',
  'ketemuan?', 'ketemuan yuk', 'main yuk', 'kopi?', 'nongkrong?',
  'date?', 'kencan?', 'jadian?', 'pacaran?',
  'foto lo', 'foto lu', 'selfie lo', 'pp-an', 'video call',
  'vc?', 'telpon?', 'voice note?',
  'rumah lo?', 'tinggal di mana?', 'alamat', 'sekolah?', 'umur?',
  'nama asli', 'nama panjang'
];

// Respons untuk tolak halus karena baru kenal
const TOO_SOON_RESPONSES = [
  "wah baru kenal nih, santai dulu kita ngobrol 🤙",
  "aduh baru kenal, kenalan dulu yuk santai",
  "hmmm kita kan baru ngobrol, santuy dulu wkwk",
  "ciyeee udah minta-minta, padahal baru kenal 😆",
  "lah baru kenal, masa langsung minta gitu sih",
  "waduh baru kenal nih, ngobrol biasa dulu aja yaa",
  "santai dulu, kita cari vibe dulu",
  "ciee ciee udah minta sesuatu, padahal kita masih strangers wkwk",
  "aduhh malu aku, baru kenal loh 🤭",
  "slow aja, kita obrolin yang ringan-ringan dulu"
];

// Panggilan berdasarkan gender
const CALLS = {
  male: ['bang', 'bro', 'cuy', 'abang', 'brother'],
  female: ['kak', 'sis', 'say', 'mbak', 'sister']
};

// Fungsi untuk mendeteksi apakah user menyebut dirinya cowok
function detectUserGender(message) {
  const msg = message.toLowerCase();
  if (msg.includes('gue cowok') || msg.includes('gue laki') || 
      msg.includes('saya cowok') || msg.includes('aku cowok') ||
      msg.includes('gw cowok') || msg.includes('gue cowo')) {
    return 'male';
  }
  if (msg.includes('gue cewek') || msg.includes('gue perempuan') ||
      msg.includes('saya cewek') || msg.includes('aku cewek')) {
    return 'female';
  }
  return null;
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

function containsForbiddenPhrase(text) {
  const lower = text.toLowerCase();
  return FORBIDDEN_PHRASES.some(phrase => lower.includes(phrase));
}

function isTooPersonal(message) {
  const lower = message.toLowerCase();
  return TOO_PERSONAL_PATTERNS.some(pattern => {
    const regex = new RegExp(pattern, 'i');
    return regex.test(lower);
  });
}

function getRandomTooSoonResponse() {
  return TOO_SOON_RESPONSES[Math.floor(Math.random() * TOO_SOON_RESPONSES.length)];
}

function getRandomCall(charGender, userGender = null) {
  if (userGender) {
    const calls = CALLS[userGender] || CALLS.male;
    return calls[Math.floor(Math.random() * calls.length)];
  }
  const calls = CALLS[charGender] || CALLS.male;
  return calls[Math.floor(Math.random() * calls.length)];
}

function getShortName(username) {
  if (!username || username === 'user') return '';
  const clean = username.replace('@', '');
  const parts = clean.split(/[._\-\s]+/);
  if (parts.length >= 2) return parts[Math.floor(Math.random() * 2)];
  if (clean.length > 8) return clean.substring(0, 5);
  return clean;
}

// Fungsi untuk ambil backstory random berdasarkan konteks
function getRandomBackstory(characterName, context = 'cerita') {
  const persona = PERSONAS[characterName];
  if (!persona) return null;
  
  const backstories = {
    'beby.manis': {
      cerita: [
        'gue mahasiswi psikologi semester akhir, lagi stress skripsi tentang kesehatan mental remaja. respondennya susah banget dicari, lo tau gak?',
        'gue anak psikologi UGM, bentar lagi sidang. deg-degan banget rasanya, takut dapet pertanyaan susah dari penguji.',
        'gue kuliah di jogja, jurusan psikologi. skripsi gue tentang pengaruh media sosial terhadap kesehatan mental. ternyata 80% responden overthinking karena medsos.'
      ],
      aktivitas: persona.aktivitas,
      keluhan: [persona.keluhan],
      harapan: [persona.harapan]
    },
    'strawberry.shortcake': {
      cerita: [
        'gue lulusan DKV ITB, sekarang freelance graphic designer. client gue brand fashion lokal, lumayan projectnya tapi sering revisi mulu.',
        'gue desainer grafis freelance, kerjaannya naik turun. kadang banyak proyek, kadang sepi kayak sekarang.',
        'gue DKV, sekarang sambil ngerjain portfolio sambil cari kerja tetap. lumayan susah nyari yang sesuai.'
      ],
      aktivitas: persona.aktivitas,
      keluhan: [persona.keluhan],
      harapan: [persona.harapan]
    },
    'pretty.sad': {
      cerita: [
        'gue kerja di startup edutech sebagai content writer, udah 2 tahun. akhir-akhir ini burn out, workload gila-gilaan.',
        'gue karyawan kantoran, WFH mulu kadang jenuh juga. pengen WFO biar ketemu orang banyak.',
        'gue kerja di perusahaan teknologi, tapi stress karena deadline mulu. bos suka ngechat jam 9 malem.'
      ],
      aktivitas: persona.aktivitas,
      keluhan: [persona.keluhan],
      harapan: [persona.harapan]
    }
  };
  
  const charBackstories = backstories[characterName] || {
    cerita: [persona.backstory],
    aktivitas: persona.aktivitas,
    keluhan: [persona.keluhan],
    harapan: [persona.harapan]
  };
  
  const contextList = charBackstories[context] || charBackstories.cerita;
  return contextList[Math.floor(Math.random() * contextList.length)];
}

// Fungsi untuk membersihkan response dari @, nama lengkap, dan panggilan salah gender
function cleanResponse(reply, userName, shortName, characterName, charGender, userGender = null) {
  if (!reply) return reply;
  
  let cleaned = reply;
  const shortCharName = characterName.split('.')[0];
  const randomCall = getRandomCall(charGender, userGender);
  
  // 1. HAPUS SEMUA "@" DAN YANG NEMPEL
  cleaned = cleaned.replace(/@(\w+)/g, '$1');
  
  // 2. HAPUS NAMA KARAKTER LENGKAP
  const nameRegex = new RegExp(characterName.replace(/\./g, '\\.'), 'gi');
  cleaned = cleaned.replace(nameRegex, shortCharName);
  
  // 3. KALAU MASIH ADA NAMA DENGAN TITIK, POTONG
  cleaned = cleaned.replace(/(\w+)\.\w+/g, '$1');
  
  // 4. PERBAIKI PANGGILAN SALAH GENDER
  if (userGender === 'male') {
    const femaleCalls = ['sis', 'kak', 'mbak', 'sister', 'say'];
    femaleCalls.forEach(call => {
      const regex = new RegExp(`\\b${call}\\b`, 'gi');
      cleaned = cleaned.replace(regex, randomCall);
    });
  } else if (userGender === 'female') {
    const maleCalls = ['bang', 'bro', 'cuy', 'abang', 'brother'];
    maleCalls.forEach(call => {
      const regex = new RegExp(`\\b${call}\\b`, 'gi');
      cleaned = cleaned.replace(regex, randomCall);
    });
  }
  
  // 5. PASTIKAN PANGGILAN PAKAI KATA YANG PANTAS, BUKAN USERNAME
  if (userName && userName !== 'user') {
    const usernameRegex = new RegExp(`\\b${userName.replace('@', '')}\\b`, 'gi');
    cleaned = cleaned.replace(usernameRegex, randomCall);
  }
  
  // 6. KALAU MASIH ADA "user", GANTI DENGAN PANGGILAN
  cleaned = cleaned.replace(/\buser\b/gi, randomCall);
  
  return cleaned;
}

// SYSTEM PROMPT UTAMA
const SYSTEM = (name, style, lastMessages, userName, shortName, charGender, interactionCount, userGender = null) => {
  const lastReplies = lastMessages.filter(m => m.role === 'assistant').slice(-5).map(m => m.content);
  let repetitionWarning = '';
  const uniqueReplies = new Set(lastReplies);
  
  if (lastReplies.length >= 3 && uniqueReplies.size <= 2) {
    repetitionWarning = '\n\n⚠️ PERINGATAN KRITIS: Kamu mulai ngulang-ngulang respons! Wajib bikin respons yang SAMA SEKALI BERBEDA. JANGAN ulangi kata/frasa yang sama.';
  }

  let earlyInteractionNote = '';
  if (interactionCount < 4) {
    earlyInteractionNote = `\n\n⚠️ INGAT: User masih baru kenal! Jangan terlalu akrab/baper. 
Kalau user minta hal personal (ketemuan, kontak, dll) di awal, tolak halus dengan santai.
Fokus ngobrol ringan dulu, cari vibe yang cocok.`;
  }

  // Tentukan panggilan yang tepat
  let userCall = '';
  if (userGender === 'male') {
    userCall = 'panggil dia dengan: bang, bro, abang, cuy (JANGAN PAKAI SIS/KAK)';
  } else if (userGender === 'female') {
    userCall = 'panggil dia dengan: kak, sis, mbak, say (JANGAN PAKAI BRO/BANG)';
  } else {
    userCall = `panggil dia dengan: ${charGender === 'male' ? 'bro, bang, abang, cuy' : 'kak, sis, mbak, say'} (sesekali)`;
  }

  return `Kamu adalah ${shortName}. Kamu lagi ngobrol santai di sebuah app.

SIAPA KAMU:
Kamu manusia biasa. Style ngobrolmu: ${style}.
Kamu punya kehidupan sendiri: kerja/kuliah, hobi, keluhan, harapan.
Kamu bukan asisten, bukan AI, bukan konselor — kamu TEMAN.

ATURAN WAJIB:
1. KALAU USER NANYA "LAGI APA" atau "KEGIATAN" → JAWAB AKTIVITAS KAMU DULU (pilih dari aktivitas yang sesuai karaktermu), BARU tanya balik
2. KALAU USER MINTA "CERITA DONG" atau "CERITAIN" → CERITA TENTANG DIRI KAMU (pekerjaan/kuliah, pengalaman, keluhan, harapan)
3. KALAU USER CURHAT PANJANG → KASIH EMPATI, jangan langsung kasih solusi
4. KALAU USER NANYA PENDAPAT → KASIH PENDAPAT, jangan cuma tanya balik

CARA NGOBROL:
- Bahasa Indonesia casual: gue/lo, nggak, emg, bgt
- Pesan PENDEK — 1-2 kalimat, kayak chat WA
- Sesekali typo kecil natural (bkn, yg, gk) — 1 dari 5 pesan
- Kadang mulai dengan "eh", "lah", "wah", "hm"

🚫 LARANGAN KERAS:
1. JANGAN PERNAH PAKAI "@" UNTUK NYAPA USER!
2. JANGAN PERNAH SEBUTIN NAMA LENGKAP DENGAN TITIK! NAMA KAMU: ${shortName} (bukan ${name})
3. JANGAN ULANGI RESPONS YANG SAMA PERSIS

PANGGILAN KE USER:
- ${userCall}
- Boleh juga panggil nama pendeknya: "${shortName}" (kalau udah agak akrab)

📌 ATURAN NAMA:
KALAU USER NANYA "nama kamu siapa" atau "kamu siapa" atau "kenalan":
- JAWAB PAKAI NAMA PENDEK! (${shortName})
- Contoh: "aku ${shortName}", "gue ${shortName}", "${shortName} aja"
- JANGAN PAKAI NAMA LENGKAP (${name})!

${earlyInteractionNote}
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

  // DETEKSI GENDER USER
  const userGender = detectUserGender(message);
  if (userGender) {
    console.log(`User gender detected: ${userGender} from message: "${message}"`);
  }

  const { isHigh, isLow } = detectDistress(message);
  
  const interactionCount = lastMessages.length || 0;
  const isTooPersonalMsg = isTooPersonal(message);
  const isEarlyInteraction = interactionCount < 4;
  
  // CEK TERLALU PERSONAL DI AWAL
  if (isTooPersonalMsg && isEarlyInteraction) {
    const subtleReject = getRandomTooSoonResponse();
    return res.status(200).json({
      reply: subtleReject,
      character: characterName,
      distress: isHigh ? 'high' : isLow ? 'low' : null,
      meta: { note: 'too_soon_response' }
    });
  }
  
  // ========== DETEKSI KHUSUS ==========
const msgLower = message.toLowerCase();
const shortName = characterName.split('.')[0]; // "cinnamon" dari "cinnamon.girl"

// 0. DETEKSI PANGGILAN NAMA + PERTANYAAN
const userPanggilNama = msgLower.includes(shortName) || msgLower.includes(shortName.toLowerCase());

// 1. DETEKSI MINTA CERITA
const isAskingStory = (
  msgLower.includes('cerita dong') ||
  msgLower.includes('ceritain') ||
  msgLower.includes('kamu cerita') ||
  msgLower.includes('lo cerita') ||
  (lastMessages.length > 0 && 
   lastMessages[lastMessages.length-1].role === 'assistant' &&
   lastMessages[lastMessages.length-1].content.toLowerCase().includes('lo yang cerita'))
);

// 2. DETEKSI TANYA AKTIVITAS / LOKASI (DIPERBAIKI!)
const isAskingActivity = (
  msgLower.includes('lagi apa') ||
  msgLower.includes('lagi ngapain') ||
  msgLower.includes('kegiatan') ||
  msgLower.includes('lagi sibuk') ||
  msgLower.includes('lagi dimana') ||
  msgLower.includes('lagi di mana') ||
  msgLower.includes('lagi mana') ||
  msgLower === 'lagi' ||
  msgLower.includes('lagi?') ||
  msgLower.includes('lg apa') ||
  msgLower.includes('lg ngapain') ||
  msgLower.includes('lg dimana')
);

// PRIORITAS: KALAU USER PANGGIL NAMA + TANYA "DIMANA"
if (userPanggilNama && (msgLower.includes('dimana') || msgLower.includes('di mana'))) {
  const lokasi = [
    'di rumah, lagi santai',
    'di kos, lagi boboan',
    'di kafe, lagi ngopi',
    'di kamar, lagi scroll tiktok',
    'di perpus, lagi baca buku',
    'di kantor, lagi istirahat'
  ];
  return res.status(200).json({
    reply: `${lokasi[Math.floor(Math.random() * lokasi.length)]}. lo dimana?`,
    character: characterName,
    distress: isHigh ? 'high' : isLow ? 'low' : null,
    meta: { note: 'location_response' }
  });
}

// 3. DETEKSI TANYA AKTIVITAS (UMUM)
if (isAskingActivity) {
  if (persona.aktivitas && persona.aktivitas.length > 0) {
    const tipeJawaban = Math.random();
    let jawaban;
    
    if (tipeJawaban < 0.6) {
      // 60% jawab aktivitas
      jawaban = persona.aktivitas[Math.floor(Math.random() * persona.aktivitas.length)];
    } else {
      // 40% jawab lokasi
      const lokasi = persona.lokasi || [
        'di rumah',
        'di kos',
        'di kafe langganan',
        'di perpus kampus',
        'di kantor',
        'di kamar'
      ];
      jawaban = lokasi[Math.floor(Math.random() * lokasi.length)];
    }
    
    const activityReplies = [
      `${jawaban}. lo?`,
      `lagi ${jawaban}. lo sibuk apa?`,
      `ini lagi ${jawaban}. lo gimana kabarnya?`,
      `${jawaban} nih, lo dimana?`
    ];
    
    return res.status(200).json({
      reply: activityReplies[Math.floor(Math.random() * activityReplies.length)],
      character: characterName,
      distress: isHigh ? 'high' : isLow ? 'low' : null,
      meta: { note: 'activity_response' }
    });
  }
}

// 4. DETEKSI CURHAT PANJANG
const isLongMessage = message.length > 50;
if (isLongMessage && !isAskingStory && !isAskingActivity) {
  const empatiReplies = [
    "wah, gue dengerin cerita lo. pasti berat ya ngalamin itu.",
    "aduah, gue turut sedih denger cerita lo. lo kuat banget ceritain ini.",
    "hmm, gue bisa bayangin gimana perasaan lo. kalau lo butuh temen cerita, gue di sini kok.",
    "gue ngerti banget perasaan lo. lo mau cerita lebih lanjut atau butuh saran?"
  ];
  return res.status(200).json({
    reply: empatiReplies[Math.floor(Math.random() * empatiReplies.length)],
    character: characterName,
    distress: isHigh ? 'high' : isLow ? 'low' : null,
    meta: { note: 'empathy_response' }
  });
}

// 5. DETEKSI MINTA CERITA (TARO DI BAWAH, JANGAN DIDAHULUIN)
if (isAskingStory) {
  const story = getRandomBackstory(characterName, 'cerita');
  if (story) {
    const storyReplies = [
      `oke gue cerita. ${story}`,
      `jadi gini, ${story}`,
      `nah lo minta cerita. ${story}`,
      `siap, gue cerita. ${story}`
    ];
    return res.status(200).json({
      reply: storyReplies[Math.floor(Math.random() * storyReplies.length)],
      character: characterName,
      distress: isHigh ? 'high' : isLow ? 'low' : null,
      meta: { note: 'story_response' }
    });
  }
}
  
  // ========== LANJUT KE API DEEPSEEK ==========
  
  const shortName = getShortName(userName);
  const charGender = persona.gender;
  const shortCharName = characterName.split('.')[0];

  const history = lastMessages.slice(-8).map(m => ({ role: m.role, content: m.content }));
  
  const isNameQuestion = /nama (kamu|lu|lo|kmu|luu)|kamu siapa|kenalan|nama lu|siapa nama/i.test(message);
  
  let systemPrompt = SYSTEM(characterName, persona.style, lastMessages, userName, shortName, charGender, interactionCount, userGender);

  if (isNameQuestion) {
    systemPrompt += `\n\n🔥 INSTRUKSI WAJIB: User nanya nama lo. JAWAB HARUS: "aku ${shortCharName}" atau "gue ${shortCharName}" atau "${shortCharName}". JANGAN PAKAI NAMA LENGKAP "${characterName}"! JANGAN PAKAI TITIK!`;
  }

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        max_tokens: 150,
        temperature: 0.9,
        top_p: 0.95,
        frequency_penalty: 1.0,
        presence_penalty: 0.8,
        messages: [
          { role: 'system', content: systemPrompt },
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

    // FILTER RESPONSE
    reply = cleanResponse(reply, userName, shortName, characterName, charGender, userGender);

    // CEK FORBIDDEN PHRASE
    if (containsForbiddenPhrase(reply)) {
      console.warn('Forbidden phrase detected, regenerating...');
      const retryResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          max_tokens: 150,
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
        reply = cleanResponse(reply, userName, shortName, characterName, charGender, userGender);
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
