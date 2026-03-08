// ============================================
// spill-generator.js - FRONTEND SPILL GENERATOR
// FIXED VERSION - No duplicate declarations
// ============================================

const SPILL_CONFIG = {
    API_BASE_URL: '/api/rants',
    BREW_INTERVAL: 240000,
    POOL_MAX_SIZE: 27,
    BREW_COUNT: 9,
    SPILL_TARGET: 8
};

// ✅ HANYA 1 VARIABLE - spillPool (milik generator)
let spillPool = [];
let activeMood = 'all';
let isLoading = false;

// ❌ TIDAK ADA deklarasi realEntries di sini!

function initSpillGenerator() {
    console.log('[SpillGen] 🚀 Initializing...');
    setTimeout(() => brewNewSpills(), 2000);
    setInterval(() => brewNewSpills(), SPILL_CONFIG.BREW_INTERVAL);
}

async function brewNewSpills(count = SPILL_CONFIG.BREW_COUNT) {
    if (isLoading) return;
    isLoading = true;
    
    try {
        const response = await fetch(`${SPILL_CONFIG.API_BASE_URL}/brew`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ count })
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        
        if (data.success && data.spills) {
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
            
            spillPool = [...newSpills, ...spillPool].slice(0, SPILL_CONFIG.POOL_MAX_SIZE);
            
            console.log(`[SpillGen] 🍵 +${newSpills.length} entries, pool: ${spillPool.length}/${SPILL_CONFIG.POOL_MAX_SIZE}`);
            
            // ✅ Panggil render dari window (yang asli di spill.html)
            if (typeof window.renderSpills === 'function') {
                window.renderSpills();
            }
        }
    } catch (error) {
        console.error('[SpillGen] ❌ Brew failed:', error);
    } finally {
        isLoading = false;
    }
}

// ✅ Fungsi render yang pake realEntries dari window
function renderSpills() {
    const realEntriesFromWindow = window.realEntries || [];
    const allSpills = [...realEntriesFromWindow, ...spillPool];
    
    // Urutin berdasarkan timestamp
    allSpills.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    
    // Filter mood
    let filtered = activeMood === 'all' 
        ? allSpills 
        : allSpills.filter(s => s.mood === activeMood);
    
    filtered = filtered.slice(0, SPILL_CONFIG.SPILL_TARGET);
    
    // Update meta
    const metaEl = document.getElementById('feedMeta');
    if (metaEl) {
        const realCount = realEntriesFromWindow.length;
        const aiCount = spillPool.length;
        metaEl.textContent = `${filtered.length} (${realCount} real, ${aiCount} pool)`;
    }
    
    // Render ke DOM (panggil fungsi asli spill.html)
    if (typeof window.originalRenderSpills === 'function') {
        window.originalRenderSpills();
    }
}

// EXPOSE KE WINDOW
window.initSpillGenerator = initSpillGenerator;
window.brewNewSpills = brewNewSpills;
window.spillPool = spillPool; // biar bisa diakses dari luar

// AUTO INIT
if (typeof window !== 'undefined') {
    setTimeout(initSpillGenerator, 1000);
}
