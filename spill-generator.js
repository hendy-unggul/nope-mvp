// ============================================
// spill-generator.js - VERSI FIXED
// ============================================

const SPILL_CONFIG = {
    API_BASE_URL: '/api/rants',
    BREW_INTERVAL: 240000,
    POOL_MAX_SIZE: 27,
    BREW_COUNT: 9,
    SPILL_TARGET: 8
};

// ✅ SEMUA VARIABLE ADA DI SINI
let spillPool = [];

function getSpillPool() {
    return spillPool;
}

function initSpillGenerator() {
    console.log('[SpillGen] 🚀 Initializing...');
    
    setTimeout(() => brewNewSpills(), 2000);
    setInterval(() => brewNewSpills(), SPILL_CONFIG.BREW_INTERVAL);
}

async function brewNewSpills(count = SPILL_CONFIG.BREW_COUNT) {
    console.log('[SpillGen] 🍵 Starting brew...');
    
    try {
        const response = await fetch(`${SPILL_CONFIG.API_BASE_URL}/brew`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ count })
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        console.log('[SpillGen] 📦 API Response:', data);
        
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
            
            // FIFO - tambahkan di depan, potong di belakang
            spillPool = [...newSpills, ...spillPool].slice(0, SPILL_CONFIG.POOL_MAX_SIZE);
            
            console.log(`[SpillGen] ✅ Pool updated: ${spillPool.length}/${SPILL_CONFIG.POOL_MAX_SIZE} spills`);
            
            // Trigger render di main script
            if (typeof window.renderAllSpills === 'function') {
                console.log('[SpillGen] 🎨 Triggering render...');
                window.renderAllSpills();
            } else {
                console.warn('[SpillGen] ⚠️ window.renderAllSpills not found!');
            }
            
            return true;
        }
    } catch (error) {
        console.error('[SpillGen] ❌ Brew failed:', error);
        return false;
    }
}

// EXPOSE KE WINDOW
window.initSpillGenerator = initSpillGenerator;
window.brewNewSpills = brewNewSpills;
window.getSpillPool = getSpillPool;

// AUTO INIT
if (typeof window !== 'undefined') {
    console.log('[SpillGen] 🎬 Auto-initializing in 1 second...');
    setTimeout(initSpillGenerator, 1000);
}
