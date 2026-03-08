// ============================================
// spill-generator.js - FRONTEND SPILL GENERATOR
// FIXED VERSION - No syntax errors
// ============================================

const SPILL_CONFIG = {
    API_BASE_URL: '/api/rants',
    BREW_INTERVAL: 240000,
    POOL_MAX_SIZE: 27,
    BREW_COUNT: 9,
    SPILL_TARGET: 8
};

let spillPool = [];
let realEntries = [];
let activeMood = 'all';
let isLoading = false;

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
            
            if (typeof renderSpills === 'function') renderSpills();
        }
    } catch (error) {
        console.error('[SpillGen] ❌ Brew failed:', error);
    } finally {
        isLoading = false;
    }
}

// EXPOSE KE WINDOW
window.initSpillGenerator = initSpillGenerator;
window.brewNewSpills = brewNewSpills;

// AUTO INIT
if (typeof window !== 'undefined') {
    setTimeout(initSpillGenerator, 1000);
}
