// spill-generator.js - VERSI SEDERHANA (YANG JALAN SEBELUMNYA)
(function() {
    'use strict';
    
    const CONFIG = {
        POOL_SIZE: 50,
        WINDOW_SIZE: 8,
        BREW_INTERVAL: 240000
    };

    let fullPool = [];
    let windowStart = 0;
    let activeMood = 'all';
    let isLoading = false;
    let nextId = 1;

    // INITIAL SPILLS sederhana
    const INITIAL_SPILLS = [
        { id: 'spill_001', author: 'beby.manis', mood: 'surviving', content: 'deadline skripsi makin deket, anxiety naik turun 😮‍💨', timestamp: Date.now() - 5000000, reactions: { skull:12, cry:23, fire:5, upside:3 } },
        { id: 'spill_002', author: 'agak.koplak', mood: 'chaotic', content: 'client minta revisi jam 11 malem, this is fine 🔥', timestamp: Date.now() - 4900000, reactions: { skull:18, cry:31, fire:9, upside:7 } },
    ];

    function init() {
        console.log('[SpillGen] 🚀 Initializing...');
        fullPool = [...INITIAL_SPILLS];
        windowStart = 0;
        renderSpills();
        setInterval(addNewEntry, CONFIG.BREW_INTERVAL);
    }

    async function addNewEntry() {
        console.log('[SpillGen] 🆕 Brewing...');
        try {
            const response = await fetch('/api/brew', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ count: 1 })
            });
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            if (data.success && data.spills && data.spills[0]) {
                const apiSpill = data.spills[0];
                const newSpill = {
                    id: `api_${Date.now()}`,
                    author: apiSpill.author || 'ai.generator',
                    mood: apiSpill.mood || 'surviving',
                    content: apiSpill.content,
                    timestamp: Date.now()
                };
                fullPool = [newSpill, ...fullPool.slice(0, CONFIG.POOL_SIZE - 1)];
                renderSpills();
            }
        } catch (error) {
            console.warn('[SpillGen] API error, using fallback');
            addOfflineEntry();
        }
    }

    function addOfflineEntry() {
        const newSpill = {
            id: `offline_${Date.now()}`,
            author: 'beby.manis',
            mood: 'surviving',
            content: 'capek ah hari ini, pengen rebahan aja 🥲',
            timestamp: Date.now()
        };
        fullPool = [newSpill, ...fullPool.slice(0, CONFIG.POOL_SIZE - 1)];
        renderSpills();
    }

    function renderSpills() {
        const container = document.getElementById('spillsList');
        if (!container) return;
        
        let toShow = fullPool.slice(0, CONFIG.WINDOW_SIZE);
        
        container.innerHTML = toShow.map(s => `
            <div class="spill-card">
                <div class="spill-head">
                    <span class="spill-user">@${escapeHtml(s.author)}</span>
                    <span class="spill-mood ${s.mood}">${s.mood.toUpperCase()}</span>
                </div>
                <div class="spill-body">${escapeHtml(s.content)}</div>
            </div>
        `).join('');
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    window.seduhTehBaru = function() {
        windowStart = (windowStart + 1) % CONFIG.POOL_SIZE;
        renderSpills();
    };

    window.filterMood = function(mood) {
        activeMood = mood;
        document.querySelectorAll('.mood-chip').forEach(chip => {
            chip.classList.toggle('active', chip.dataset.mood === mood);
        });
        renderSpills();
    };

    setTimeout(init, 1000);
    // EXPOSE FUNGSI PENTING
window.renderSpills = renderSpills;
window.getPool = () => fullPool;
window.reactToSpill = reactToSpill;
})();
