// ============================================
// spill-generator.js - FRONTEND SPILL GENERATOR
// Dipanggil dari spill.html untuk ambil spill dari rants.js
// ============================================

const SPILL_CONFIG = {
  API_BASE_URL: '/api/rants', // endpoint backend rants.js
  BREW_INTERVAL: 240000, // 4 menit (dalam ms)
  POOL_MAX_SIZE: 27,
  BREW_COUNT: 9,
  SPILL_TARGET: 8
};

// ============================================
// STATE MANAGEMENT
// ============================================
let spillPool = []; // FIFO pool untuk spill AI (gak pernah ke database)
let realEntries = []; // dari database (punya user beneran)
let activeMood = 'all';
let isLoading = false;

// ============================================
// INITIALIZE SPILL GENERATOR
// ============================================
function initSpillGenerator() {
  console.log('[SpillGen] 🚀 Initializing spill generator...');
  
  // Initial brew pertama kali (2 detik setelah load)
  setTimeout(() => {
    brewNewSpills();
  }, 2000);
  
  // Schedule brew setiap 4 menit
  setInterval(() => {
    brewNewSpills();
  }, SPILL_CONFIG.BREW_INTERVAL);
  
  // Auto refresh real entries setiap 30 detik
  setInterval(() => {
    if (typeof loadRealEntries === 'function') {
      loadRealEntries();
    }
  }, 30000);
}

// ============================================
// BREW SPILL BARU DARI RANTS.JS
// ============================================
async function brewNewSpills(count = SPILL_CONFIG.BREW_COUNT) {
  if (isLoading) {
    console.log('[SpillGen] ⏳ Still brewing, please wait...');
    return;
  }
  
  isLoading = true;
  
  try {
    console.log(`[SpillGen] 🍵 Brewing ${count} new spills...`);
    
    const response = await fetch(`${SPILL_CONFIG.API_BASE_URL}/brew`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ count })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.spills && data.spills.length > 0) {
      // Format spills dari backend
      const newSpills = data.spills.map(spill => ({
        id: spill.id,
        author: spill.author,
        mood: spill.mood,
        content: spill.content,
        timestamp: spill.timestamp,
        reactions: spill.reactions || { skull: 0, cry: 0, fire: 0, upside: 0 },
        isAI: true,
        isReal: false,
        userReacted: null
      }));
      
      // FIFO: baru masuk DEPAN, yang lama keluar dari BELAKANG
      spillPool = [...newSpills, ...spillPool].slice(0, SPILL_CONFIG.POOL_MAX_SIZE);
      
      console.log(`[SpillGen] ✅ +${newSpills.length} new spills, pool: ${spillPool.length}/${SPILL_CONFIG.POOL_MAX_SIZE}`);
      console.log('[SpillGen] 📝 New authors:', newSpills.map(s => s.author).join(', '));
      
      // Trigger render
      if (typeof renderSpills === 'function') {
        renderSpills();
      }
      
      // Update meta feed
      updateFeedMeta();
      
      return newSpills;
    } else {
      throw new Error('Invalid response from server');
    }
    
  } catch (error) {
    console.error('[SpillGen] ❌ Brew failed:', error);
    
    // Fallback: generate offline spill kalau API error
    const offlineSpills = generateOfflineSpills(count);
    spillPool = [...offlineSpills, ...spillPool].slice(0, SPILL_CONFIG.POOL_MAX_SIZE);
    
    if (typeof renderSpills === 'function') {
      renderSpills();
    }
    
    return offlineSpills;
    
  } finally {
    isLoading = false;
  }
}

// ============================================
// FALLBACK OFFLINE SPILLS (KALAU API ERROR)
// ============================================
function generateOfflineSpills(count) {
  console.log('[SpillGen] ⚠️ Using offline fallback...');
  
  const offlineAuthors = [
    'beby.manis', 'pretty.sad', 'agak.koplak', 'bang.juned', 'strawberry.shortcake'
  ];
  
  const offlineTexts = [
    'capek ah hari ini, pengen rebahan aja 🥲',
    'overthinking lagi, ini ritual apa penyakit sih 💀',
    'senin lagi senin lagi, mental illness mode on',
    'lagi fase healing, jangan diganggu pls',
    'someone come talk to me, I'm bored 😭',
    'skripsi bab 3 mandek, maybe I should just give up',
    'love language nya apa ya? kok gue masih single',
    'minggu malem, anxiety dateng lagi'
  ];
  
  const moods = ['surviving', 'chaotic', 'doom', 'thriving'];
  const spills = [];
  
  for (let i = 0; i < count; i++) {
    const author = offlineAuthors[Math.floor(Math.random() * offlineAuthors.length)];
    const mood = moods[Math.floor(Math.random() * moods.length)];
    const content = offlineTexts[Math.floor(Math.random() * offlineTexts.length)];
    
    spills.push({
      id: `offline_${Date.now()}_${i}_${Math.random().toString(36).slice(2)}`,
      author,
      mood,
      content,
      timestamp: Date.now() - Math.floor(Math.random() * 3600000),
      reactions: {
        skull: Math.floor(Math.random() * 20),
        cry: Math.floor(Math.random() * 30),
        fire: Math.floor(Math.random() * 15),
        upside: Math.floor(Math.random() * 10)
      },
      isAI: true,
      isReal: false,
      userReacted: null
    });
  }
  
  return spills;
}

// ============================================
// RENDER SPILLS (GABUNGIN REAL + AI)
// ============================================
function renderSpills() {
  const spillsContainer = document.getElementById('spillsList');
  if (!spillsContainer) return;
  
  // Gabung real entries (dari database) sama AI spills (dari pool)
  let allSpills = [...(realEntries || []), ...spillPool];
  
  // Urutin berdasarkan timestamp (terbaru dulu)
  allSpills.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  
  // Filter berdasarkan mood
  if (activeMood !== 'all') {
    allSpills = allSpills.filter(s => s.mood === activeMood);
  }
  
  // Ambil sesuai target
  const toShow = allSpills.slice(0, SPILL_CONFIG.SPILL_TARGET);
  
  if (toShow.length === 0) {
    spillsContainer.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">🍃</span>
        <div class="empty-title">BELUM ADA SPILL</div>
        <div class="empty-text">Coba filter lain atau tunggu brew berikutnya</div>
      </div>
    `;
    return;
  }
  
  // Render HTML
  spillsContainer.innerHTML = toShow.map(spill => {
    const aiLabel = ''; // HAPUS LABEL AI biar keliatan real user
    
    const reactions = spill.reactions || { skull: 0, cry: 0, fire: 0, upside: 0 };
    
    return `
      <div class="spill-card" data-id="${spill.id}">
        <div class="spill-head">
          <span class="spill-user">@${escapeHtml(spill.author)}${aiLabel}</span>
          <span class="spill-mood ${spill.mood}">${spill.mood.toUpperCase()}</span>
        </div>
        <div class="spill-body">${escapeHtml(spill.content)}</div>
        <div class="spill-actions">
          <button class="react-btn ${spill.userReacted === 'skull' ? 'active' : ''}" onclick="reactToSpill('${spill.id}', 'skull')">
            💀<span class="react-count">${reactions.skull}</span>
          </button>
          <button class="react-btn ${spill.userReacted === 'cry' ? 'active' : ''}" onclick="reactToSpill('${spill.id}', 'cry')">
            😭<span class="react-count">${reactions.cry}</span>
          </button>
          <button class="react-btn ${spill.userReacted === 'fire' ? 'active' : ''}" onclick="reactToSpill('${spill.id}', 'fire')">
            🔥<span class="react-count">${reactions.fire}</span>
          </button>
          <button class="react-btn ${spill.userReacted === 'upside' ? 'active' : ''}" onclick="reactToSpill('${spill.id}', 'upside')">
            🙃<span class="react-count">${reactions.upside}</span>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// ============================================
// UPDATE FEED META
// ============================================
function updateFeedMeta() {
  const metaEl = document.getElementById('feedMeta');
  if (!metaEl) return;
  
  const realCount = realEntries?.length || 0;
  const aiCount = spillPool.length;
  const total = Math.min(realCount + aiCount, SPILL_CONFIG.SPILL_TARGET);
  
  metaEl.textContent = `${total} (${realCount} real, ${aiCount} pool)`;
}

// ============================================
// REACTION HANDLER
// ============================================
async function reactToSpill(spillId, reactionType) {
  // Cari spill di pool atau real entries
  const spillInPool = spillPool.find(s => s.id === spillId);
  const spillInReal = realEntries?.find(s => s.id === spillId);
  
  const spill = spillInPool || spillInReal;
  if (!spill) return;
  
  // Toggle reaction
  const wasActive = spill.userReacted === reactionType;
  
  if (wasActive) {
    // Hapus reaction
    spill.reactions[reactionType] = Math.max(0, (spill.reactions[reactionType] || 0) - 1);
    spill.userReacted = null;
  } else {
    // Hapus reaction lama kalau ada
    if (spill.userReacted) {
      const oldReaction = spill.userReacted;
      spill.reactions[oldReaction] = Math.max(0, (spill.reactions[oldReaction] || 0) - 1);
    }
    // Tambah reaction baru
    spill.reactions[reactionType] = (spill.reactions[reactionType] || 0) + 1;
    spill.userReacted = reactionType;
  }
  
  // Update UI
  renderSpills();
  
  // Kalau spill dari real entries, sync ke database
  if (spillInReal && typeof window.syncReactionToDB === 'function') {
    window.syncReactionToDB(spillId, spill.reactions);
  }
}

// ============================================
// FILTER MOOD
// ============================================
function filterSpillsByMood(mood) {
  activeMood = mood;
  
  // Update active class di chips
  document.querySelectorAll('.mood-chip').forEach(chip => {
    if (chip.dataset.mood === mood) {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
  });
  
  renderSpills();
}

// ============================================
// MANUAL BREW (BUAT REFRESH BUTTON)
// ============================================
async function manualBrew() {
  const btn = document.querySelector('.refresh-btn');
  if (btn) btn.classList.add('loading');
  
  await brewNewSpills();
  
  if (btn) btn.classList.remove('loading');
}

// ============================================
// UTILS: ESCAPE HTML
// ============================================
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================
// EXPORT KE WINDOW (biar bisa dipanggil dari HTML)
// ============================================
window.initSpillGenerator = initSpillGenerator;
window.brewNewSpills = brewNewSpills;
window.manualBrew = manualBrew;
window.filterSpillsByMood = filterSpillsByMood;
window.reactToSpill = reactToSpill;
window.renderSpills = renderSpills;
window.updateFeedMeta = updateFeedMeta;

// Auto init kalau langsung di-load
if (typeof window !== 'undefined' && document.readyState !== 'loading') {
  setTimeout(initSpillGenerator, 1000);
} else if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initSpillGenerator, 1000);
  });
}

console.log('[SpillGen] 📦 Frontend spill generator ready');
