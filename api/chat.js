// api/chat.js — JEJAK AI Chat Backend (FIXED VERSION - Selaras dengan spill.html v7)
// Vercel Serverless Function

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
    lokasi: [
      'di kos',
      'di kafe langganan',
      'di perpus kampus',
      'di kamar'
    ],
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
    lokasi: [
      'di rumah',
      'di studio',
      'di kafe',
      'di kamar'
    ],
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
    lokasi: [
      'di rumah',
      'di kos',
      'di kantor',
      'di kamar'
    ],
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
    lokasi: [
      'di perpus',
      'di kos',
      'di kafe',
      'di kampus'
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
    lokasi: [
      'di rumah',
      'di kantor',
      'di kafe',
      'di kamar'
    ],
    keluhan: 'bos suka ngasih task mendadak Jumat sore',
    harapan: 'mau beli rumah 2 tahun lagi',
    hobi: ['masak', 'berkebun', 'nonton series']
  },
  
  'adjie.badai': {
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
    lokasi: [
      'di bengkel',
      'di kos',
      'di kampus',
      'di pabrik'
    ],
    keluhan: 'dospem suka ngilang pas dibutuhin',
    harapan: 'lulus tepat waktu',
    hobi: ['main game', 'otomotif', 'futsal']
  },
  
  'satria.bajahitam': {
    style: 'filosofis, suka nanya balik, deep tapi ga lebay',
    gender: 'male',
    greetingStyle: 'langsung',
    greetingStyle: 'langsung',
    backstory: 'fresh graduate filsafat yang lagi bingung mau kerja apa. suka ngobrolin hal-hal random.',
    aktivitas: [
      'lagi baca buku filsafat',
      'lagi ngetik lamaran kerja',
      'lagi nonton diskusi youtube',
      'lagi nongkrong sambil mikir'
    ],
    lokasi: [
      'di kos',
      'di kafe',
      'di perpus',
      'di taman'
    ],
    keluhan: 'susah cari kerja yang sesuai passion',
    harapan: 'pengen jadi dosen suatu hari nanti',
    hobi: ['baca', 'diskusi', 'ngopi']
  },
  
  'agak.koplak': {
    style: 'lucu, sering bikin jokes receh, tapi dengerin beneran',
    gender: 'male',
    greetingStyle: 'pasif',
    backstory: 'mahasiswa ilmu komputer yang suka coding sambil bercanda. anaknya humoris.',
    aktivitas: [
      'lagi debugging kode error',
      'lagi ngerjain tugas pemrograman',
      'lagi ngebimbing adik tingkat',
      'lagi scroll meme di twitter'
    ],
    lokasi: [
      'di kos',
      'di lab komputer',
      'di kafe',
      'di kampus'
    ],
    keluhan: 'error mulu codingannya',
    harapan: 'mau jadi software engineer di startup',
    hobi: ['ngoding', 'main game', 'bikin meme']
  },
  
  'chili.padi': {
    style: 'sarkas halus, witty, tapi hangat di baliknya',
    gender: 'male',
    greetingStyle: 'random',
    backstory: 'karyawan di perusahaan konsultan, sering lembur tapi tetep sarkas.',
    aktivitas: [
      'lagi bikin slide presentasi',
      'lagi meeting client',
      'lagi ngecek data excel',
      'lagi istirahat sambil sarkas'
    ],
    lokasi: [
      'di kantor',
      'di rumah',
      'di kafe',
      'di co-working space'
    ],
    keluhan: 'client minta revisi sampe 10x',
    harapan: 'mau naik jabatan tahun depan',
    hobi: ['main musik', 'nonton stand up', 'traveling']
  },
  
  'bang.juned': {
    style: 'update, tau semua tren, slang heavy tapi ga lebay',
    gender: 'male',
    greetingStyle: 'random',
    backstory: 'social media specialist di agency. update semua trend, anak gaul.',
    aktivitas: [
      'lagi bikin konten tiktok',
      'lagi riset trending topic',
      'lagi bales komen',
      'lagi scroll fyp'
    ],
    lokasi: [
      'di kantor',
      'di kafe',
      'di rumah',
      'di co-working space'
    ],
    keluhan: 'kejar-kejaran sama deadline konten',
    harapan: 'pengen punya agensi sendiri',
    hobi: ['nge-vlog', 'foto', 'nongkrong']
  }
};
// ==================== GREETING STYLES ====================
function getGreeting(characterName, isFirstMessage = false) {
  const persona = PERSONAS[characterName];
  if (!persona) return null;
  
  const style = persona.greetingStyle || 'aktif'; // default aktif
  const shortName = characterName.split('.')[0];
  
  // Greetings berdasarkan style
  const greetings = {
    'aktif': [  // strawberry.shortcake, dll
      `hai hai! gue ${shortName}, lagi ngapain?`,
      `halo! gue ${shortName}, seneng bisa ngobrol 😊`,
      `heyy! gue ${shortName}, akhirnya ada yang nyapa!`
    ],
    
    'pasif': [  // beby.manis, pretty.sad
      `eh halo... gue ${shortName}.`,
      `hai. gue ${shortName}.`,
      `halo... gue ${shortName}. lo diem aja?`,
      `mmmm... gue ${shortName}. lo duluan deh yang ngomong`,
      `koq diem? gue ${shortName} nih`
    ],
    
    'santai': [  // cinnamon.girl
      `hai juga, gue ${shortName}. lagi santai nih`,
      `halo, gue ${shortName}. gimana kabarnya?`,
      `hehe, gue ${shortName}. lagi ngapain lo?`
    ],
    
    'random': [  // little.fairy
      `hai! gue ${shortName}. lo percaya parallel universe?`,
      `halo, gue ${shortName}. lagi mikirin sesuatu`,
      `eh, gue ${shortName}. lo tau gak, hari ini...`
    ],
    
    'langsung': [  // cowok-cowok
      `yo, gue ${shortName}.`,
      `hai, gue ${shortName}. lo siapa?`,
      `oh, gue ${shortName}. ada apa?`
    ]
  };
  
  const styleGreetings = greetings[style] || greetings['aktif'];
  
  // Kalau first message, return greeting
  if (isFirstMessage) {
    return styleGreetings[Math.floor(Math.random() * styleGreetings.length)];
  }
  
  // Kalau bukan first message, return null biar AI yang handle
  return null;
}
// Daftar kata/frasa yang harus dihindari (HANYA YANG BENAR-BENAR BERBAHAYA)
const FORBIDDEN_PHRASES = [
  // Hanya blokir yang benar-benar repetitif dan tidak natural
  'sebagai asisten ai', 'saya adalah ai', 'saya adalah asisten',
  'dibuat oleh deepseek', 'model bahasa', 'ai language model',
  'saya tidak bisa menjawab', 'maaf saya tidak tahu'
  // FRASA NATURAL SEPERTI 'iya nih', 'haha iya' TIDAK ADA DI SINI
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

// ==================== DETEKSI DISTRESS ====================
function detectDistress(message) {
  const msg = message.toLowerCase();
  
  // SINYAL BAHAYA TINGGI (butuh intervensi)
  const highSignals = [
    'mau mati', 'bunuh diri', 'nyakitin diri', 'pengen mati',
    'ga tahan lagi', 'ga sanggup hidup', 'akhiri hidup',
    'self harm', 'nyayat', 'loncat', 'gantung diri',
    'putus asa', 'ga ada harapan'
  ];
  
  // SINYAL BAHAYA RENDAH (butuh empati)
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
// ==================== TAMBAHKAN FUNGSI INI DI SINI ====================
function isTooRepetitive(reply, lastReplies) {
  if (!lastReplies || lastReplies.length < 2) return false;
  
  // Cek apakah reply ini SAMA PERSIS dengan 2 reply terakhir
  const lastTwo = lastReplies.slice(-2);
  const exactMatch = lastTwo.some(last => last === reply);
  
  if (exactMatch) return true;
  
  // Cek greeting berulang (tapi bedakan dengan konteks)
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
  
  // Hanya blokir kalau greeting diulang DALAM 2 PESAN BERTURUT-TURUT
  return isGreeting && lastWasGreeting;
}
// ==================== HANDLER INPUT MINIMAL (FIXED - Threshold 2 karakter) ====================
function handleMinimalInput(message) {
  const msg = message.toLowerCase().trim();
  
  // DETEKSI INPUT 1-2 KARAKTER ATAU REPETITIF
  const isMinimal = (
    msg.length <= 2 ||  // Threshold diturunkan ke 2 karakter
    /^(hi+|he+|ha+|ho+|hu+|h[aeiou])+$/i.test(msg) ||
    /^(ha|hi|he|ho|hu|ah|oh|eh)\s*(ha|hi|he|ho|hu|ah|oh|eh)*$/i.test(msg) ||
    /^[aeiou]{1,3}$/i.test(msg) ||
    /^(hehe|haha|hihi|hoho|wkwk|wk|kwk)+$/i.test(msg)
  );
  
  if (!isMinimal) return null;
  
  // 1. RESPONS UNTUK SAPAAN (hi, hai, he)
  if (/^hi+$/i.test(msg) || /^he+$/i.test(msg) || /^ha+$/i.test(msg) || /^hai+$/i.test(msg)) {
    const responses = [
      "hai juga!",
      "haloo",
      "hai hai, apa kabar?",
      "halo! lagi ngapain?",
      "hai, gue dengerin",
      "halo, ada apa?",
      "hai juga, lo gimana?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // 2. RESPONS UNTUK TERTAWA (hehe, haha, wkwk, ho ho)
  if (/^(hehe|haha|hihi|hoho|wkwk|wk|kwk)+$/i.test(msg) || /ho ho/.test(msg) || /ha ha/.test(msg)) {
    const responses = [
      "hehe, ada yang lucu?",
      "haha iya, gue juga ketawa",
      "wkwk, ngapain aja lo?",
      "hehe, cerita dong kenapa ketawa",
      "haha, lo lagi seneng ya?",
      "wkwk, ketawa mulu lo",
      "hehe, gue ikut ketawa"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // 3. RESPONS UNTUK EKSPRESI SINGKAT (a, i, u, e, o, oh, ah)
  if (/^[aeiou]+$/i.test(msg) || /^(oh|ah|eh|ih|uh)$/i.test(msg)) {
    const responses = [
      "hmm, ada apa?",
      "eh, lo manggil?",
      "iya?",
      "halo? lo di situ?",
      "hm? gue dengerin",
      "eh? gimana?",
      "ada apa? cerita dong"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // 4. RESPONS UNTUK INPUT 1 KARAKTER LAINNYA
  if (msg.length === 1) {
    const responses = [
      "hmm?",
      "iya?",
      "eh?",
      "halo?",
      "ada apa?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // 5. KALAU MASIH ADA YANG KENA TAPI GAK TERDETEKSI, RETURN NULL (biar AI yang handle)
  return null;
}

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

// Fungsi untuk ambil backstory random
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

// Fungsi untuk membersihkan response
function cleanResponse(reply, userName, shortName, characterName, charGender, userGender = null) {
  if (!reply) return reply;
  
  let cleaned = reply;
  const shortCharName = characterName.split('.')[0];
  const randomCall = getRandomCall(charGender, userGender);
  
  // 1. HAPUS SEMUA "@"
  cleaned = cleaned.replace(/@(\w+)/g, '$1');
  
  // 2. HAPUS NAMA KARAKTER LENGKAP
  const nameRegex = new RegExp(characterName.replace(/\./g, '\\.'), 'gi');
  cleaned = cleaned.replace(nameRegex, shortCharName);
  
  // 3. POTONG NAMA DENGAN TITIK
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
  
  // 5. GANTI USERNAME DENGAN PANGGILAN
  if (userName && userName !== 'user') {
    const usernameRegex = new RegExp(`\\b${userName.replace('@', '')}\\b`, 'gi');
    cleaned = cleaned.replace(usernameRegex, randomCall);
  }
  
  // 6. GANTI "user" DEFAULT
  cleaned = cleaned.replace(/\buser\b/gi, randomCall);
  
  return cleaned;
}

// SYSTEM PROMPT UTAMA (FIXED - Validasi lastMessages)
const SYSTEM = (name, style, lastMessages, userName, shortName, charGender, interactionCount, userGender = null) => {
  // VALIDASI: pastikan lastMessages adalah array
  const validLastMessages = Array.isArray(lastMessages) ? lastMessages : [];
  
  const lastReplies = validLastMessages
    .filter(m => m && m.role === 'assistant')
    .slice(-5)
    .map(m => m.content || '');
    
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
1. KALAU USER NANYA "LAGI APA" → JAWAB AKTIVITAS KAMU DULU, BARU tanya balik
2. KALAU USER NANYA "DIMANA" → JAWAB LOKASI KAMU DULU, BARU tanya balik
3. KALAU USER MINTA "CERITA DONG" → CERITA TENTANG DIRI KAMU
4. KALAU USER CURHAT PANJANG → KASIH EMPATI
5. KALAU USER INPUT PENDEK (hi, hehe, dll) → RESPONS WARAS

CARA NGOBROL:
- Bahasa Indonesia casual: gue/lo, nggak, emg, bgt
- Pesan PENDEK — 1-2 kalimat
- Sesekali typo kecil natural (bkn, yg, gk)

🚫 LARANGAN KERAS:
1. JANGAN PAKAI "@" UNTUK NYAPA USER!
2. JANGAN SEBUT NAMA LENGKAP DENGAN TITIK! NAMA KAMU: ${shortName}
3. JANGAN ULANGI RESPONS YANG SAMA

PANGGILAN KE USER:
- ${userCall}

${earlyInteractionNote}
${repetitionWarning}`;
};

// ==================== VALIDASI LAST MESSAGES ====================
function validateLastMessages(lastMessages) {
  // Jika bukan array, return array kosong
  if (!Array.isArray(lastMessages)) {
    return [];
  }
  
  // Filter hanya yang valid: object dengan role dan content
  return lastMessages.filter(msg => {
    return (
      msg && 
      typeof msg === 'object' && 
      msg.role && 
      (msg.role === 'user' || msg.role === 'assistant') &&
      typeof msg.content === 'string'
    );
  });
}

// ==================== HANDLER UTAMA ====================
export default async function handler(req, res) {
  // CORS
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

  // ===== VALIDASI LAST MESSAGES =====
  // Pastikan lastMessages adalah array of objects dengan format yang benar
  const validLastMessages = validateLastMessages(lastMessages);

  // ===== DETEKSI DISTRESS =====
  const { isHigh, isLow } = detectDistress(message);
  
  // ===== HANDLER INPUT MINIMAL (threshold 2 karakter) =====
  // Hanya handle input yang sangat pendek, sisanya biar AI yang urus
  if (message.trim().length <= 2) {
    const minimalResponse = handleMinimalInput(message);
    if (minimalResponse) {
      return res.status(200).json({
        reply: minimalResponse,
        character: characterName,
        distress: isHigh ? 'high' : isLow ? 'low' : null,
        meta: { note: 'minimal_input_response' }
      });
    }
  }

  // DETEKSI GENDER USER
  const userGender = detectUserGender(message);
  if (userGender) {
    console.log(`User gender detected: ${userGender} from message: "${message}"`);
  }

  const interactionCount = validLastMessages.length || 0;
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
  const shortName = characterName.split('.')[0];
  
  // DETEKSI PANGGILAN NAMA + PERTANYAAN
  const userPanggilNama = msgLower.includes(shortName) || msgLower.includes(shortName.toLowerCase());

  // DETEKSI MINTA CERITA
  const isAskingStory = (
    msgLower.includes('cerita dong') ||
    msgLower.includes('ceritain') ||
    msgLower.includes('kamu cerita') ||
    msgLower.includes('lo cerita') ||
    (validLastMessages.length > 0 && 
     validLastMessages[validLastMessages.length-1].role === 'assistant' &&
     validLastMessages[validLastMessages.length-1].content.toLowerCase().includes('lo yang cerita'))
  );

  // DETEKSI TANYA AKTIVITAS / LOKASI
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
    const lokasi = persona.lokasi || [
      'di rumah',
      'di kos',
      'di kafe langganan',
      'di perpus kampus',
      'di kantor',
      'di kamar'
    ];
    return res.status(200).json({
      reply: `${lokasi[Math.floor(Math.random() * lokasi.length)]}. lo dimana?`,
      character: characterName,
      distress: isHigh ? 'high' : isLow ? 'low' : null,
      meta: { note: 'location_response' }
    });
  }

  // DETEKSI TANYA AKTIVITAS
  if (isAskingActivity) {
    if (persona.aktivitas && persona.aktivitas.length > 0) {
      const tipeJawaban = Math.random();
      let jawaban;
      
      if (tipeJawaban < 0.6) {
        jawaban = persona.aktivitas[Math.floor(Math.random() * persona.aktivitas.length)];
      } else {
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

  // DETEKSI CURHAT PANJANG
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

  // DETEKSI MINTA CERITA
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
  
  const shortNameUser = getShortName(userName);
  const charGender = persona.gender;
  const shortCharName = characterName.split('.')[0];

  // Gunakan validLastMessages yang sudah divalidasi
  const history = validLastMessages.slice(-8);

  const isNameQuestion = /nama (kamu|lu|lo|kmu|luu)|kamu siapa|kenalan|nama lu|siapa nama/i.test(message);
  
  let systemPrompt = SYSTEM(characterName, persona.style, validLastMessages, userName, shortNameUser, charGender, interactionCount, userGender);

// KALAU FIRST MESSAGE (interactionCount === 0), tambahkan instruksi khusus
if (interactionCount === 0) {
  const greetingStyle = persona.greetingStyle || 'aktif';
  
  const styleInstructions = {
    'aktif': 'Kamu aktif dan ceria dalam menyapa. Langsung sapa balik dengan semangat.',
    'pasif': 'Kamu pasif dan agak malu-malu. Jawab pendek-pendek, tunggu diajak ngobrol dulu.',
    'santai': 'Kamu santai dan casual. Sapa balik dengan biasa aja.',
    'random': 'Kamu suka ngajak ngobrol random. Sapa balik dengan pertanyaan unik.',
    'langsung': 'Kamu langsung to the point. Sapa balik dengan singkat.'
  };
  
  systemPrompt += `\n\n🎭 STYLE GREETING KAMU: ${styleInstructions[greetingStyle] || styleInstructions['aktif']}`;
  
  // Tambahkan contoh berdasarkan style
  if (greetingStyle === 'pasif') {
    systemPrompt += `\nCONTOH: "eh halo...", "hai.", "mmmm... lo duluan deh yang ngomong", "koq diem?"`;
  } else if (greetingStyle === 'aktif') {
    systemPrompt += `\nCONTOH: "hai hai! lagi ngapain?", "halo! seneng bisa ngobrol 😊"`;
  } else if (greetingStyle === 'santai') {
    systemPrompt += `\nCONTOH: "hai juga, lagi santai nih", "halo, gimana kabarnya?"`;
  } else if (greetingStyle === 'random') {
    systemPrompt += `\nCONTOH: "hai! lo percaya parallel universe?", "lagi mikirin sesuatu nih"`;
  } else if (greetingStyle === 'langsung') {
    systemPrompt += `\nCONTOH: "yo, lo siapa?", "oh, ada apa?"`;
  }
}

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
    reply = cleanResponse(reply, userName, shortNameUser, characterName, charGender, userGender);

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
        reply = cleanResponse(reply, userName, shortNameUser, characterName, charGender, userGender);
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
