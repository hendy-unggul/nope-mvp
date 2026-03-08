// ============================================
// spill-generator.js - VERSI FINAL
// ============================================

const SPILL_CONFIG = {
    API_BASE_URL: '/api/rants',
    BREW_INTERVAL: 240000,
    POOL_MAX_SIZE: 27,
    BREW_COUNT: 9,
    SPILL_TARGET: 8
};

// ✅ SEMUA VARIABLE ADA DI SINI
let spillPool = [];  // ganti dari fillerPool
let activeMood = 'all';
let isLoading = false;

function initSpillGenerator() {
    console.log('[SpillGen] 🚀 Initializing...');
    
    // HAPUS PANGGILAN ensureFillerPool
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
            
            // FIFO
            spillPool = [...newSpills, ...spillPool].slice(0, SPILL_CONFIG.POOL_MAX_SIZE);
            
            console.log(`[SpillGen] 🍵 +${newSpills.length} entries, pool: ${spillPool.length}/${SPILL_CONFIG.POOL_MAX_SIZE}`);
            
            // Render ulang
            renderSpills();
        }
    } catch (error) {
        console.error('[SpillGen] ❌ Brew failed:', error);
    } finally {
        isLoading = false;
    }
}

function renderSpills() {
    const spillsContainer = document.getElementById('spillsList');
    if (!spillsContainer) return;
    
    // Gabung realEntries (dari window) + spillPool
    const realEntriesFromWindow = window.realEntries || [];
    let allSpills = [...realEntriesFromWindow, ...spillPool];
    
    // Urutin berdasarkan timestamp (terbaru dulu)
    allSpills.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    
    // Filter mood
    if (activeMood !== 'all') {
        allSpills = allSpills.filter(s => s.mood === activeMood);
    }
    
    // Ambil sesuai target
    const toShow = allSpills.slice(0, SPILL_CONFIG.SPILL_TARGET);
    
    // Update meta
    const metaEl = document.getElementById('feedMeta');
    if (metaEl) {
        const realCount = realEntriesFromWindow.length;
        const aiCount = spillPool.length;
        metaEl.textContent = `${toShow.length} (${realCount} real, ${aiCount} pool)`;
    }
    
    // Render HTML
    if (toShow.length === 0) {
        spillsContainer.innerHTML = `<div class="empty-state">Belum ada spill</div>`;
        return;
    }
    
    spillsContainer.innerHTML = toShow.map(spill => `
        <div class="spill-card">
            <div class="spill-head">
                <span>@${escapeHtml(spill.author)}</span>
                <span class="spill-mood ${spill.mood}">${spill.mood}</span>
            </div>
            <div class="spill-body">${escapeHtml(spill.content)}</div>
        </div>
    `).join('');
}

function filterMood(mood) {
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

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// EXPOSE KE WINDOW
window.initSpillGenerator = initSpillGenerator;
window.brewNewSpills = brewNewSpills;
window.filterMood = filterMood;
window.spillPool = spillPool;  // biar bisa diakses

// AUTO INIT
if (typeof window !== 'undefined') {
    setTimeout(initSpillGenerator, 1000);
}
