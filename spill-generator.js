// ============================================
// spill-generator.js - FIXED WITH REAL USERS
// ============================================

(function() {
    'use strict';
    
    const SPILL_CONFIG = {
        API_BASE_URL: '/api/brew',  // ✅ LANGSUNG KE ENDPOINT
        BREW_INTERVAL: 240000,
        POOL_MAX_SIZE: 27,
        BREW_COUNT: 9,
        SPILL_TARGET: 8
    };

    let spillPool = [];
    let activeMood = 'all';
    let isLoading = false;

    const FALLBACK_SPILLS = [ ... ]; // (tetep sama)

    function initSpillGenerator() {
        console.log('[SpillGen] 🚀 Initializing...');
        setTimeout(() => brewNewSpills(), 2000);
        setInterval(() => brewNewSpills(), SPILL_CONFIG.BREW_INTERVAL);
    }

    async function brewNewSpills(count = SPILL_CONFIG.BREW_COUNT) {
        if (isLoading) return;
        isLoading = true;
        
        try {
            // ✅ FIX: langsung pake API_BASE_URL, ga perlu + '/brew'
            const response = await fetch(SPILL_CONFIG.API_BASE_URL, {
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
                    reactions: spill.reactions || { skull:0, cry:0, fire:0, upside:0 },
                    isAI: true,
                    isReal: false,
                    userReacted: null
                }));
                
                spillPool = [...newSpills, ...spillPool].slice(0, SPILL_CONFIG.POOL_MAX_SIZE);
                renderSpills();
            }
        } catch (error) {
            console.warn('[SpillGen] API failed, using fallback');
            useFallbackData();
        } finally {
            isLoading = false;
        }
    }

    function useFallbackData() {
        const shuffled = [...FALLBACK_SPILLS].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, SPILL_CONFIG.BREW_COUNT);
        
        const now = Date.now();
        selected.forEach((spill, i) => {
            spill.timestamp = now - (i * 300000);
            spill.id = 'fallback_' + now + '_' + i;
        });
        
        spillPool = [...selected, ...spillPool].slice(0, SPILL_CONFIG.POOL_MAX_SIZE);
        renderSpills();
    }

    function renderSpills() {
        const spillsContainer = document.getElementById('spillsList');
        if (!spillsContainer) return;
        
        // ✅ GABUNGIN REAL + AI
        const realEntries = window.realEntries || [];
        let allSpills = [...realEntries, ...spillPool];
        
        // ✅ URUTKAN
        allSpills.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        
        // ✅ FILTER MOOD
        let filtered = allSpills;
        if (activeMood !== 'all') {
            filtered = allSpills.filter(s => s.mood === activeMood);
        }
        
        const toShow = filtered.slice(0, SPILL_CONFIG.SPILL_TARGET);
        
        // ✅ META UPDATE
        const metaEl = document.getElementById('feedMeta');
        if (metaEl) {
            metaEl.textContent = `${toShow.length} (${realEntries.length} real, ${spillPool.length} pool)`;
        }
        
        if (toShow.length === 0) {
            spillsContainer.innerHTML = `<div class="empty-state">Belum ada spill</div>`;
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
    }

    function filterMood(mood) {
        activeMood = mood;
        document.querySelectorAll('.mood-chip').forEach(chip => {
            chip.classList.toggle('active', chip.dataset.mood === mood);
        });
        renderSpills();
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ✅ PUBLIC API
    window.initSpillGenerator = initSpillGenerator;
    window.brewNewSpills = brewNewSpills;
    window.filterMood = filterMood;
    window.refreshSpills = async function() {
        spillPool = [];
        await brewNewSpills();
        renderSpills();
    };

    // AUTO INIT
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initSpillGenerator, 1000);
        });
    } else {
        setTimeout(initSpillGenerator, 1000);
    }
})();
