// ================================================
// FREKUENSI ZONES — SHARPENED CATEGORIZATION ALGORITHM
// ================================================
// Diferensiasi TAJAM antara Hype, Ngusahain, dan Spill
// Menggunakan scoring system + exclusion rules

// ==========================================
// PRINSIP DIFERENSIASI:
// ==========================================
// HYPE HAUS    = Excitement + External Content (idol, drakor, anime)
// NGUSAHAIN    = Progress + Action (doing something tangible)
// SPILL ZONE   = Emotion + Internal State (feeling, venting)

// ==========================================
// 1. HYPE HAUS - ENTERTAINMENT & FANDOM
// ==========================================
const HYPE_IDENTIFIERS = {
  // Core: Entertainment content reference
  strongSignals: [
    // K-pop (100% Hype)
    'comeback', 'debut', 'mv baru', 'teaser', 'lightstick', 'photocard', 'album',
    'bias', 'bias wrecker', 'ult', 'stan', 'fancam', 'idol', 'member',
    
    // Drama/Series (100% Hype)
    'episode', 'drakor', 'kdrama', 'drama korea', 'series', 'netflix',
    'cliffhanger', 'plot twist', 'ending', 'villain', 'couple',
    
    // Anime/Manga (100% Hype)
    'anime', 'manga', 'chapter', 'arc', 'op', 'ed', 'waifu', 'husbando',
    
    // AU/Fiction (100% Hype)
    'au', 'fanfic', 'headcanon', 'otp', 'ship', 'canon',
    
    // Events (100% Hype)
    'concert', 'konser', 'fanmeet', 'showcase', 'comeback stage',
    'music show', 'award', 'mama', 'mma'
  ],
  
  // Medium signals (need context)
  mediumSignals: [
    'nonton', 'dengerin', 'playlist', 'lagu', 'nge-binge',
    'marathon', 'rewatch', 'replay', 'streaming'
  ],
  
  // Excitement markers (boost score)
  excitementMarkers: [
    'v!', 'keren banget', 'gila', 'insane', 'legendary',
    'masterpiece', 'iconic', 'slay', 'ate', 'serve',
    '🔥', '💯', '✨', '😭', '🤧'
  ],
  
  // Anti-patterns (EXCLUDE from Hype even with keywords)
  exclusions: [
    'gagal', 'nangis karena', 'sedih', 'capek nonton',
    'burnout', 'anxiety', 'overthinking', 'kenapa gue'
  ]
};

// ==========================================
// 2. NGUSAHAIN - PROGRESS & ACTION
// ==========================================
const NGUSAHAIN_IDENTIFIERS = {
  // Core: Tangible progress/action
  strongSignals: [
    // Academic progress
    'revisi', 'bab', 'skripsi', 'thesis', 'penelitian', 'data',
    'dosen', 'bimbingan', 'sidang', 'lulus', 'wisuda',
    
    // Work/Hustle (with numbers/results)
    'jualan', 'omzet', 'profit', 'untung', 'jual', 'beli',
    'customer', 'orderan', 'closing', 'deal',
    
    // Skill building
    'belajar', 'kursus', 'bootcamp', 'sertifikat', 'portfolio',
    'project', 'deploy', 'launch', 'rilis',
    
    // Tools/Platform (indicates doing)
    'figma', 'canva', 'notion', 'github', 'vercel',
    'shopee', 'tokped', 'instagram', 'tiktok shop'
  ],
  
  // Progress indicators (MUST HAVE for Ngusahain)
  progressMarkers: [
    'hari ke-', 'udah', 'selesai', 'done', 'progress',
    'tinggal', 'hampir', 'mulai', 'coba', 'nyoba',
    'berhasil', 'sukses', 'lancar', 'jalan', 'running',
    'x%', 'ribu', 'juta', 'target'
  ],
  
  // Action verbs (boost score)
  actionVerbs: [
    'ngerjain', 'bikin', 'buat', 'develop', 'design',
    'coding', 'nulis', 'riset', 'analisis', 'setup',
    'install', 'deploy', 'upload', 'posting', 'marketing'
  ],
  
  // Anti-patterns (EXCLUDE)
  exclusions: [
    // Pure emotion without action
    'pengen doang', 'cuma pengen', 'ga tau mulai',
    'ga jadi', 'menyerah', 'hopeless',
    
    // Passive venting
    'capek banget', 'burnout parah', 'anxiety muncul',
    'overthinking', 'ga bisa tidur'
  ]
};

// ==========================================
// 3. SPILL ZONE - EMOTION & VENTING
// ==========================================
const SPILL_IDENTIFIERS = {
  // Core: Internal emotional state
  strongSignals: [
    // Direct emotion
    'sedih', 'nangis', 'galau', 'bingung', 'takut',
    'cemas', 'khawatir', 'panik', 'stress',
    
    // Mental state
    'burnout', 'anxiety', 'overthinking', 'insomnia',
    'lelah', 'capek', 'exhausted', 'drained',
    
    // Loneliness/isolation
    'sendiri', 'sendirian', 'kesepian', 'lonely',
    'ditinggal', 'diabaikan', 'dilupakan',
    
    // Confusion/existential
    'kenapa ya', 'kenapa gue', 'apa gunanya', 'buat apa',
    'ga tau', 'gatau', 'bingung', 'lost',
    
    // Burden/pressure
    'beban', 'berat', 'overwhelmed', 'terlalu banyak',
    'ga kuat', 'ga sanggup'
  ],
  
  // Venting patterns (boost score)
  ventingPatterns: [
    'rasanya', 'kok gue', 'kenapa harus gue', 'cape deh',
    'udah coba', 'tetep aja', 'gitu gitu aja',
    'ga ada yang', 'selalu', 'terus menerus'
  ],
  
  // Question markers (internal conflict)
  questionMarkers: [
    '?', 'kenapa', 'gimana', 'kapan', 'apakah',
    'apa iya', 'emang gue', 'salah gue'
  ],
  
  // Negative emotions
  negativeMarkers: [
    'ga', 'gak', 'nggak', 'enggak', 'bukan',
    'jangan', 'stop', 'cukup', 'enough'
  ]
};

// ==========================================
// SCORING ALGORITHM
// ==========================================
function categorizeVenting(content) {
  const lower = content.toLowerCase();
  const scores = {
    hype: 0,
    ngusahain: 0,
    spill: 0
  };
  
  // ===== HYPE SCORING =====
  // Strong signals (each worth 10 points)
  HYPE_IDENTIFIERS.strongSignals.forEach(signal => {
    if (lower.includes(signal)) scores.hype += 10;
  });
  
  // Medium signals (each worth 3 points)
  HYPE_IDENTIFIERS.mediumSignals.forEach(signal => {
    if (lower.includes(signal)) scores.hype += 3;
  });
  
  // Excitement markers (each worth 5 points)
  HYPE_IDENTIFIERS.excitementMarkers.forEach(marker => {
    if (lower.includes(marker)) scores.hype += 5;
  });
  
  // Apply exclusions (negate all Hype score)
  const hasHypeExclusion = HYPE_IDENTIFIERS.exclusions.some(ex => lower.includes(ex));
  if (hasHypeExclusion) scores.hype = 0;
  
  // ===== NGUSAHAIN SCORING =====
  // Strong signals (each worth 8 points)
  NGUSAHAIN_IDENTIFIERS.strongSignals.forEach(signal => {
    if (lower.includes(signal)) scores.ngusahain += 8;
  });
  
  // Progress markers (REQUIRED - multiply score by 2 if present)
  const hasProgress = NGUSAHAIN_IDENTIFIERS.progressMarkers.some(pm => lower.includes(pm));
  if (hasProgress) scores.ngusahain *= 2;
  
  // Action verbs (each worth 5 points)
  NGUSAHAIN_IDENTIFIERS.actionVerbs.forEach(verb => {
    if (lower.includes(verb)) scores.ngusahain += 5;
  });
  
  // Apply exclusions (reduce to 20% if contains passive venting)
  const hasNgusahainExclusion = NGUSAHAIN_IDENTIFIERS.exclusions.some(ex => lower.includes(ex));
  if (hasNgusahainExclusion) scores.ngusahain *= 0.2;
  
  // ===== SPILL SCORING =====
  // Strong signals (each worth 7 points)
  SPILL_IDENTIFIERS.strongSignals.forEach(signal => {
    if (lower.includes(signal)) scores.spill += 7;
  });
  
  // Venting patterns (each worth 6 points)
  SPILL_IDENTIFIERS.ventingPatterns.forEach(pattern => {
    if (lower.includes(pattern)) scores.spill += 6;
  });
  
  // Question markers (each worth 3 points)
  SPILL_IDENTIFIERS.questionMarkers.forEach(marker => {
    if (lower.includes(marker)) scores.spill += 3;
  });
  
  // Negative markers (each worth 2 points)
  SPILL_IDENTIFIERS.negativeMarkers.forEach(marker => {
    if (lower.includes(marker)) scores.spill += 2;
  });
  
  // ===== DECISION LOGIC =====
  // Minimum threshold to avoid false positives
  const MIN_THRESHOLD = 10;
  
  // Find highest score
  const maxScore = Math.max(scores.hype, scores.ngusahain, scores.spill);
  
  // If all scores below threshold, default to Spill
  if (maxScore < MIN_THRESHOLD) return 'spill';
  
  // Return zone with highest score
  if (scores.hype === maxScore) return 'hype';
  if (scores.ngusahain === maxScore) return 'ngusahain';
  return 'spill';
}

// ==========================================
// EXAMPLES & TEST CASES
// ==========================================
const TEST_CASES = [
  // HYPE examples
  { text: "Comeback baru seventeen keren banget! Choreo nya insane 🔥 v!", expected: "hype" },
  { text: "Baru nonton squid game 2, plot twist nya bikin nangis 😭", expected: "hype" },
  { text: "Bias ku comeback! Teaser nya legendary banget", expected: "hype" },
  { text: "Episode terakhir drakor ini cliffhanger parah", expected: "hype" },
  
  // NGUSAHAIN examples
  { text: "Hari ke-30 ngerjain skripsi, tinggal revisi dari dosen 💪", expected: "ngusahain" },
  { text: "Jualan thrifting bulan ini untung 2jt! Side hustle works 📈", expected: "ngusahain" },
  { text: "Udah selesai bikin portfolio di figma, tinggal deploy", expected: "ngusahain" },
  { text: "Progress coding bootcamp 60%, project hampir jadi", expected: "ngusahain" },
  { text: "Baru closing 5 orderan hari ini, profit lumayan", expected: "ngusahain" },
  
  // SPILL examples
  { text: "Capek banget rasanya jadi versi diri orang lain terus...", expected: "spill" },
  { text: "Kenapa ya rasanya selalu overthinking tiap malem 😔", expected: "spill" },
  { text: "Burnout parah, ga tau harus ngapain lagi", expected: "spill" },
  { text: "Sendiri lagi, ditinggal lagi. Kenapa harus gue?", expected: "spill" },
  { text: "Anxiety muncul lagi. Ga kuat rasanya.", expected: "spill" },
  
  // EDGE CASES (mixed signals - should pick dominant)
  { text: "Nonton drakor sambil ngerjain skripsi, progress 0% 😭", expected: "ngusahain" }, // Progress mentioned
  { text: "Pengen banget nonton comeback tapi burnout parah", expected: "spill" }, // Emotion dominates
  { text: "Udah bikin 10 design figma hari ini, capek tapi puas", expected: "ngusahain" }, // Action dominates
  { text: "Bias comeback tapi kok gue sedih ya?", expected: "spill" }, // Emotion question
];

// Run tests (for debugging)
function runTests() {
  console.log('🧪 Testing Zone Categorization Algorithm...\n');
  
  let passed = 0;
  let failed = 0;
  
  TEST_CASES.forEach((test, index) => {
    const result = categorizeVenting(test.text);
    const isCorrect = result === test.expected;
    
    if (isCorrect) {
      passed++;
      console.log(`✅ Test ${index + 1}: PASS`);
    } else {
      failed++;
      console.log(`❌ Test ${index + 1}: FAIL`);
      console.log(`   Text: "${test.text}"`);
      console.log(`   Expected: ${test.expected}`);
      console.log(`   Got: ${result}\n`);
    }
  });
  
  console.log(`\n📊 Results: ${passed}/${TEST_CASES.length} passed (${Math.round(passed/TEST_CASES.length*100)}%)`);
}

// Export for use in frekuensi-zones.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { categorizeVenting, runTests };
}
