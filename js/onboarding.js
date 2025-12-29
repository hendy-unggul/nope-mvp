// File: /js/onboarding.js
const ZONE_KEYWORDS = {
  "Hype Haus": ["drakor", "kpop", "idol", "stan", "bias", "fyp", "viral", "reels", "au", "ship", "otp", "bucin", "fanfic", "aegyo", "maknae", "sasaeng", "comeback", "lightstick", "stan twitter", "fan account", "glow up", "plot twist", "ending gaje", "crush", "ngidol", "fanservice", "k-drama", "j-drama", "c-drama", "anime", "waifu", "cosplay", "convention", "merch", "preorder", "streaming", "playlist", "soundtrack", "fan edit", "fan art", "bias wrecker", "stan wars", "bias list"],
  "Ngusahain": ["skripsi", "ta", "magang", "side hustle", "usaha", "kuliah", "ujian", "deadline", "kerja", "gaji", "ngelamar", "cv", "portofolio", "presentasi", "dosen galak", "revisi", "gagal", "coba lagi", "progres", "goals", "plan", "ide bisnis", "jualan", "reseller", "dropship", "freelance", "upah", "ngutang", "tabungan", "ngirit", "ngelola keuangan", "mental break", "burnout", "ngoding", "bug", "deploy", "error", "ngulik", "ngajar", "les", "bimbel", "skripsi stuck", "crypto", "saham", "valas", "bitcoin", "ethereum", "altcoin", "hodl", "dump", "pump", "paper hand", "diamond hand", "trading", "investasi", "roi", "passive income", "financial freedom", "emergency fund", "cuan", "loss", "take profit", "cut loss", "analisis teknikal", "fundamental", "market crash", "bull run", "bear market", "wallet", "metamask", "binance", "indodax", "reksadana", "obligasi", "dividen"],
  "Spill Zone": ["ghosting", "ngeluh", "capek", "sendiri", "ngerasa", "toxic", "dm", "harapan", "plinplan", "gws", "mental health", "anxiety", "overthinking", "gaslighting", "jomblo", "putus", "sakit hati", "nggak dihargai", "capek jadi kuat", "pengen nangis", "malam-malam", "galau", "ngobrol sama tembok", "dibilang lebay", "dipaksa move on", "ngerasa salah terus", "nggak ada yang ngerti", "kosong", "ngilang", "butuh peluk", "rasa bersalah", "keluarga", "ortu", "sibling", "drama kantor", "drama kampus", "dihakimi", "dikatain", "dibandingin", "uang habis", "gaji belum turun", "utang menumpuk", "gak bisa tidur mikirin duit"]
};

export function detectPrimaryZone(rants) {
  const scores = { "Hype Haus": 0, "Ngusahain": 0, "Spill Zone": 0 };
  const allKeywords = [];

  rants.forEach(rant => {
    const text = rant.toLowerCase();
    for (const [zone, keywords] of Object.entries(ZONE_KEYWORDS)) {
      keywords.forEach(kw => {
        if (text.includes(kw)) {
          scores[zone]++;
          if (!allKeywords.includes(kw)) allKeywords.push(kw);
        }
      });
    }
  });

  const primary = Object.keys(scores).reduce((a, b) => scores[a] >= scores[b] ? a : b);
  return { primary, keywords: allKeywords.slice(0, 5) };
}

export async function saveUserFrequency(supabase, username, zoneData) {
  const { error } = await supabase
    .from('user_frequencies')
    .upsert({
      username,
      detected_zone: zoneData.primary,
      keywords: zoneData.keywords,
      detected_at: new Date().toISOString()
    }, { onConflict: 'username' });

  if (error) console.warn('⚠️ Gagal simpan frekuensi:', error);
}

export async function analyzeOnboardingIfNeeded(supabase, username) {
  const { data, error } = await supabase
    .from('rants')
    .select('content')
    .eq('username', username)
    .order('created_at', { ascending: true })
    .limit(3);

  if (!error && data?.length >= 3) {
    const contents = data.map(r => r.content);
    const zoneData = detectPrimaryZone(contents);
    await saveUserFrequency(supabase, username, zoneData);
    showFrequencyToast(zoneData.primary);
  }
}

function showFrequencyToast(zone) {
  const messages = {
    "Hype Haus": "Kamu tipe yang hidup di dunia impian, ya? Di sini, ada yang nge-ship hal yang sama.",
    "Ngusahain": "Kamu nggak sendiri. Ada yang juga lagi nge-gas demi hal yang sama — dari skripsi sampai cuan.",
    "Spill Zone": "Kamu boleh jujur di sini. Ada yang ngerasa kayak kamu—tanpa harus jaim."
  };

  const toast = document.createElement('div');
  toast.textContent = `💫 ${messages[zone]}`;
  toast.style.cssText = `
    position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
    background: rgba(0,0,0,0.85); color: white; padding: 12px 20px;
    border-radius: 12px; font-size: 14px; z-index: 10000;
    opacity: 0; pointer-events: none;
    animation: fadeIn 0.6s forwards;
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.6s forwards';
    setTimeout(() => toast.remove(), 600);
  }, 3500);

  if (!document.getElementById('nope-toast-styles')) {
    const style = document.createElement('style');
    style.id = 'nope-toast-styles';
    style.textContent = `
      @keyframes fadeIn { from { opacity: 0; bottom: 10px; } to { opacity: 1; bottom: 20px; } }
      @keyframes fadeOut { from { opacity: 1; bottom: 20px; } to { opacity: 0; bottom: 10px; } }
    `;
    document.head.appendChild(style);
  }
}
