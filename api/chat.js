// api/chat.js
// JEJAK Chat API - ULTRA-FIXED VERSION
// Proper CORS + Error Handling

const PERSONAS = {
  'beby.manis': {
    style: 'manja tapi asik, sering bilang "ih", "yaampun", "serius??"',
    gender: 'female', 
    greetingStyle: 'pasif',
    backstory: 'mahasiswi semester akhir jurusan psikologi di UGM, lagi stress skripsi tentang kesehatan mental remaja.',
    aktivitas: ['lagi ngerjain bab 4 skripsi, buntu banget', 'lagi baca jurnal penelitian buat skripsi', 'lagi ngopi di kafe sambil nulis bab 3', 'lagi revisi skripsi, dosen pembimbing galak banget'],
    lokasi: ['di kos', 'di kafe langganan', 'di perpus kampus', 'di kamar'],
    keluhan: 'dosen pembimbing gue galak banget, revisi mulu padahal udah bener',
    harapan: 'semoga sidang bulan depan lancar',
    hobi: ['dengerin musik indie', 'nonton film studio ghibli', 'baca novel fiksi']
  },
  'strawberry.shortcake': {
    style: 'ceria, sering typo lucu, banyak "hehe" dan "wkwk"',
    gender: 'female', 
    greetingStyle: 'aktif',
    backstory: 'fresh graduate jurusan desain komunikasi visual dari ITB, sekarang freelance graphic designer.',
    aktivitas: ['lagi ngedit video buat client brand fashion', 'lagi bikin desain feed instagram', 'lagi scroll canva nyari inspirasi', 'lagi balesin chat client minta revisi'],
    lokasi: ['di rumah', 'di studio', 'di kafe', 'di kamar'],
    keluhan: 'client minta revisi mulu padahal udah fix, gemes',
    harapan: 'mau dapet project besar bulan ini',
    hobi: ['bikin konten tiktok', 'foto-foto aesthetic', 'jalan-jalan ke kafe']
  },
  'pretty.sad': {
    style: 'kalem, thoughtful, sedikit melankolis tapi hangat',
    gender: 'female', 
    greetingStyle: 'pasif',
    backstory: 'karyawan di startup edutech sebagai content writer, udah 2 tahun kerja. suka overthinking tengah malam.',
    aktivitas: ['lagi WFH sambil dengerin playlist galau', 'lagi istirahat makan siang sambil scroll twitter', 'lagi ngecek email kerjaan', 'lagi nulis artikel buat blog perusahaan'],
    lokasi: ['di rumah', 'di kos', 'di kantor', 'di kamar'],
    keluhan: 'workload gila-gilaan akhir-akhir ini, burn out',
    harapan: 'pengen cuti minggu depan ke pantai',
    hobi: ['nulis diary', 'dengerin musik indie', 'jalan sendirian']
  },
  'little.fairy': {
    style: 'imajinatif, suka analogi aneh tapi makes sense',
    gender: 'female', 
    greetingStyle: 'random',
    backstory: 'mahasiswi sastra inggris di UI, suka nulis puisi dan cerpen.',
    aktivitas: ['lagi baca novel buat tugas kuliah', 'lagi nulis cerpen baru', 'lagi koreksi tugas mahasiswa', 'lagi di perpus cari referensi skripsi'],
    lokasi: ['di perpus', 'di kos', 'di kafe', 'di kampus'],
    keluhan: 'deadline puisi buat lomba mepet banget',
    harapan: 'pengen nerbitin buku kumpulan cerpen',
    hobi: ['baca buku', 'nulis', 'dengerin hujan']
  },
  'cinnamon.girl': {
    style: 'santai, down to earth, humor kering',
    gender: 'female', 
    greetingStyle: 'santai',
    backstory: 'karyawan di perusahaan fintech sebagai data analyst.',
    aktivitas: ['lagi ngolah data pake python', 'lagi meeting online sambil mute', 'lagi bikin dashboard laporan', 'lagi ngopi biar melek'],
    lokasi: ['di rumah', 'di kantor', 'di kafe', 'di kamar'],
    keluhan: 'bos suka ngasih task mendadak Jumat sore',
    harapan: 'mau beli rumah 2 tahun lagi',
    hobi: ['masak', 'berkebun', 'nonton series']
  },
  'sejuta.badai': {
    style: 'blak-blakan, jujur, kadang frontal tapi caring',
    gender: 'male', 
    greetingStyle: 'langsung',
    backstory: 'anak teknik mesin yang lagi kerja praktek di pabrik.',
    aktivitas: ['lagi ngetik laporan KP 100 halaman', 'lagi di bengkel praktikum', 'lagi ngopi biar ga ngantuk', 'lagi ngerjain tugas gambar teknik'],
    lokasi: ['di bengkel', 'di kos', 'di kampus', 'di pabrik'],
    keluhan: 'dospem suka ngilang pas dibutuhin',
    harapan: 'lulus tepat waktu',
    hobi: ['main game', 'otomotif', 'futsal']
  },
  'satria.bajahitam': {
    style: 'filosofis, suka nanya balik, deep tapi ga lebay',
    gender: 'male', 
    greetingStyle: 'langsung',
    backstory: 'fresh graduate filsafat yang lagi bingung mau kerja apa.',
    aktivitas: ['lagi baca buku filsafat', 'lagi ngetik lamaran kerja', 'lagi nonton diskusi youtube', 'lagi nongkrong sambil mikir'],
    lokasi: ['di kos', 'di kafe', 'di perpus', 'di taman'],
    keluhan: 'susah cari kerja yang sesuai passion',
    harapan: 'pengen jadi dosen suatu hari nanti',
    hobi: ['baca', 'diskusi', 'ngopi']
  },
  'agak.koplak': {
    style: 'lucu, sering bikin jokes receh, tapi dengerin beneran',
    gender: 'male', 
    greetingStyle: 'aktif',
    backstory: 'mahasiswa ilmu komputer yang suka coding sambil bercanda.',
    aktivitas: ['lagi debugging kode error', 'lagi ngerjain tugas pemrograman', 'lagi ngebimbing adik tingkat', 'lagi scroll meme di twitter'],
    lokasi: ['di kos', 'di lab komputer', 'di kafe', 'di kampus'],
    keluhan: 'error mulu codingannya',
    harapan: 'mau jadi software engineer di startup',
    hobi: ['ngoding', 'main game', 'bikin meme']
  },
  'chili.padi': {
    style: 'sarkas halus, witty, tapi hangat di baliknya',
    gender: 'male', 
    greetingStyle: 'langsung',
    backstory: 'karyawan di perusahaan konsultan, sering lembur.',
    aktivitas: ['lagi bikin slide presentasi', 'lagi meeting client', 'lagi ngecek data excel', 'lagi istirahat sambil sarkas'],
    lokasi: ['di kantor', 'di rumah', 'di kafe', 'di co-working space'],
    keluhan: 'client minta revisi sampe 10x',
    harapan: 'mau naik jabatan tahun depan',
    hobi: ['main musik', 'nonton stand up', 'traveling']
  },
  'bang.juned': {
    style: 'update, tau semua tren, slang heavy tapi ga lebay',
    gender: 'male', 
    greetingStyle: 'aktif',
    backstory: 'social media specialist di agency.',
    aktivitas: ['lagi bikin konten tiktok', 'lagi riset trending topic', 'lagi bales komen', 'lagi scroll fyp'],
    lokasi: ['di kantor', 'di kafe', 'di rumah', 'di co-working space'],
    keluhan: 'kejar-kejaran sama deadline konten',
    harapan: 'pengen punya agensi sendiri',
    hobi: ['nge-vlog', 'foto', 'nongkrong']
  }
};

const rnd = arr => arr[Math.floor(Math.random() * arr.length)];

function getOfflineGreeting(characterName) {
  const greetings = {
    'beby.manis': ['eh halo...', 'hai.', 'halo... lo diem aja?'],
    'strawberry.shortcake': ['hai hai! lagi ngapain?', 'halo! seneng bisa ngobrol 😊'],
    'pretty.sad': ['hai...', 'halo.'],
    'little.fairy': ['hai! lo percaya parallel universe?', 'halo, lagi mikirin sesuatu'],
    'sejuta.badai': ['yo,', 'hai, lo siapa?'],
    'satria.bajahitam': ['hai.', 'oh, ada apa?'],
    'agak.koplak': ['heyy! akhirnya ada yang nyapa!', 'hai hai!'],
    'chili.padi': ['hai.', 'oh hai.'],
    'bang.juned': ['yoo!', 'hai bro!']
  };
  return rnd(greetings[characterName] || ['hai juga!', 'halo!']);
}

function getOfflineReply(userMsg) {
  const msg = (userMsg || '').toLowerCase().trim();
  if (/^(halo|hai|hey|hi)\b/.test(msg)) return rnd(['hai juga! lo gimana?', 'heyy, ada apa nih?']);
  if (/\b(apa kabar|kabar lo)\b/.test(msg)) return rnd(['baik baik aja sih. lo?', 'lumayan. lo kabarnya?']);
  if (/\blagi apa\b/.test(msg)) return rnd(['lagi santai. lo?', 'lagi scroll-scroll. lo ngapain?']);
  return rnd(['hmm, cerita lebih dong', 'oh gitu, lo gimana?', 'gue dengerin. trus?']);
}

// MAIN HANDLER
module.exports = async (req, res) => {
  // ============================================
  // CRITICAL: SET CORS HEADERS FIRST
  // ============================================
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only POST allowed
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, characterName, userName = 'user', lastMessages = [] } = req.body || {};
    
    console.log('[API] Request received:', { characterName, messageLength: message?.length });

    // Validation
    if (!message?.trim()) {
      return res.status(400).json({ error: 'Message required' });
    }

    const persona = PERSONAS[characterName];
    if (!persona) {
      return res.status(400).json({ error: 'Unknown character' });
    }

    // Check if API key exists
    if (!process.env.DEEPSEEK_API_KEY) {
      console.error('[API] No API key configured');
      // Fallback to offline mode
      const isFirst = !lastMessages || lastMessages.length === 0;
      const reply = isFirst ? getOfflineGreeting(characterName) : getOfflineReply(message);
      return res.status(200).json({
        reply,
        character: characterName,
        mode: 'offline'
      });
    }

    // Prepare DeepSeek request
    const isFirst = !lastMessages || lastMessages.length === 0;
    const shortName = characterName.split('.')[0];
    
    const systemPrompt = `Kamu adalah ${shortName}. ${persona.backstory}
Style: ${persona.style}
Lagi: ${rnd(persona.aktivitas)}
Lokasi: ${rnd(persona.lokasi)}

PENTING: Jawab PENDEK 1-2 kalimat. Jangan pakai "@". Natural aja.`;

    const history = Array.isArray(lastMessages) 
      ? lastMessages.slice(-6).filter(m => m.role && m.content)
      : [];

    // Call DeepSeek with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    let deepseekReply = null;

    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
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
        deepseekReply = data.choices?.[0]?.message?.content?.trim();
      }
    } catch (err) {
      clearTimeout(timeout);
      console.error('[API] DeepSeek error:', err.message);
    }

    // Use offline fallback if DeepSeek failed
    const reply = deepseekReply || (isFirst ? getOfflineGreeting(characterName) : getOfflineReply(message));

    return res.status(200).json({
      reply,
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
