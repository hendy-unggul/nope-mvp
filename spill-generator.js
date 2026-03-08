// ============================================
// spill-generator.js - FIXED VERSION
// STANDALONE MODULE - NO INDEX.HTML DEPENDENCY
// ============================================

const SPILL_CONFIG = {
    API_BASE_URL: '/api/rants',
    BREW_INTERVAL: 240000,
    POOL_MAX_SIZE: 27,
    BREW_COUNT: 9,
    SPILL_TARGET: 8
};

// ✅ INTERNAL STATE
let spillPool = [];
let activeMood = 'all';
let isLoading = false;

function initSpillGenerator() {
    console.log('[SpillGen] 🚀 Initializing...');
    
    // Initial brew after 2 seconds
    setTimeout(() => brewNewSpills(), 2000);
    
    // Auto-brew every 4 minutes
    setInterval(() => brewNewSpills(), SPILL_CONFIG.BREW_INTERVAL);
}

async function brewNewSpills(count = SPILL_CONFIG.BREW_COUNT) {
    if (isLoading) {
        console.log('[SpillGen] ⏳ Already loading, skipping...');
        return;
    }
    
    isLoading = true;
    console.log(`[SpillGen] 🍵 Brewing ${count} spills...`);
    
    try {
        const response = await fetch(`${SPILL_CONFIG.API_BASE_URL}/brew`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ count })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
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
            
            // FIFO - prepend new, slice old
            spillPool = [...newSpills, ...spillPool].slice(0, SPILL_CONFIG.POOL_MAX_SIZE);
            
            console.log(`[SpillGen] ✅ Pool updated: ${spillPool.length}/${SPILL_CONFIG.POOL_MAX_SIZE}`);
            console.log('[SpillGen] 📊 Sample:', spillPool[0]);
            
            // Render
            renderSpills();
        } else {
            console.warn('[SpillGen] ⚠️ Invalid response format');
        }
    } catch (error) {
        console.error('[SpillGen] ❌ Brew failed:', error.message);
    } finally {
        isLoading = false;
    }
}

function renderSpills() {
    const spillsContainer = document.getElementById('spillsList');
    
    if (!spillsContainer) {
        console.warn('[SpillGen] ⚠️ spillsList container not found - DOM not ready yet?');
        return;
    }
    
    console.log('[SpillGen] 🎨 Rendering...');
    
    // Filter by mood
    let filtered = spillPool;
    if (activeMood !== 'all') {
        filtered = spillPool.filter(s => s.mood === activeMood);
        console.log(`[SpillGen] 🔍 Filtered ${activeMood}: ${filtered.length} items`);
    }
    
    // Take only target amount
    const toShow = filtered.slice(0, SPILL_CONFIG.SPILL_TARGET);
    
    // Update meta
    const metaEl = document.getElementById('feedMeta');
    if (metaEl) {
        metaEl.textContent = `${toShow.length} AI (${spillPool.length} total)`;
    }
    
    // Render HTML
    if (toShow.length === 0) {
        spillsContainer.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">🍃</span>
                <div class="empty-title">BELUM ADA SPILL</div>
                <div class="empty-text">Tunggu sebentar, sedang memuat...</div>
            </div>`;
        console.log('[SpillGen] 📭 No spills to show');
        return;
    }
    
    spillsContainer.innerHTML = toShow.map(spill => `
        <div class="spill-card">
            <div class="spill-head">
                <span class="spill-user">@${escapeHtml(spill.author)}</span>
                <span class="spill-mood ${spill.mood}">${spill.mood}</span>
            </div>
            <div class="spill-body">${escapeHtml(spill.content)}</div>
        </div>
    `).join('');
    
    console.log(`[SpillGen] ✅ Rendered ${toShow.length} spills`);
}

function filterMood(mood) {
    console.log('[SpillGen] 🎯 Filter mood:', mood);
    activeMood = mood;
    
    // Update UI
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

// ============================================
// PUBLIC API - EXPOSE TO WINDOW
// ============================================
window.initSpillGenerator = initSpillGenerator;
window.brewNewSpills = brewNewSpills;
window.filterMood = filterMood;

// ✅ USE GETTER FUNCTION - NOT DIRECT ASSIGNMENT
window.getSpillPool = () => spillPool;

// ============================================
// AUTO INIT
// ============================================
if (typeof window !== 'undefined') {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('[SpillGen] 📄 DOM ready, initializing...');
            setTimeout(initSpillGenerator, 1000);
        });
    } else {
        console.log('[SpillGen] 📄 DOM already ready, initializing...');
        setTimeout(initSpillGenerator, 1000);
    }
}
