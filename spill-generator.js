// ============================================
// spill-generator.js - FIXED FOR BROWSER
// NO ES6 MODULES - PURE BROWSER COMPATIBLE
// ============================================

(function() {
    'use strict';
    
    const SPILL_CONFIG = {
        API_BASE_URL: '/api/brew',
        BREW_INTERVAL: 240000,
        POOL_MAX_SIZE: 27,
        BREW_COUNT: 9,
        SPILL_TARGET: 8
    };

    // ✅ INTERNAL STATE
    let spillPool = [];
    let activeMood = 'all';
    let isLoading = false;

    // ✅ FALLBACK DATA - Jika API gagal
    const FALLBACK_SPILLS = [
        {
            id: 'fallback_1',
            author: 'beby.manis',
            mood: 'surviving',
            content: 'deadline tugas akhir makin deket, anxiety meningkat drastis 😮‍💨',
            timestamp: Date.now() - 300000,
            reactions: { skull: 12, cry: 23, fire: 5, upside: 3 },
            isAI: true,
            isReal: false,
            userReacted: null
        },
        {
            id: 'fallback_2',
            author: 'agak.koplak',
            mood: 'chaotic',
            content: 'client minta revisi jam 11 malem, deadline besok pagi. this is fine 🔥',
            timestamp: Date.now() - 600000,
            reactions: { skull: 18, cry: 31, fire: 9, upside: 7 },
            isAI: true,
            isReal: false,
            userReacted: null
        },
        {
            id: 'fallback_3',
            author: 'pretty.sad',
            mood: 'doom',
            content: 'HR minta masuk sabtu minggu. mau resign tapi tabungan tipis 🛌',
            timestamp: Date.now() - 900000,
            reactions: { skull: 25, cry: 42, fire: 3, upside: 12 },
            isAI: true,
            isReal: false,
            userReacted: null
        },
        {
            id: 'fallback_4',
            author: 'bang.juned',
            mood: 'surviving',
            content: 'skripsi bab 3 masih error, dosen ga bales email seminggu 😭',
            timestamp: Date.now() - 1200000,
            reactions: { skull: 15, cry: 28, fire: 2, upside: 8 },
            isAI: true,
            isReal: false,
            userReacted: null
        },
        {
            id: 'fallback_5',
            author: 'strawberry.shortcake',
            mood: 'thriving',
            content: 'akhirnya dapet panggilan interview setelah ngelamar 50+ tempat ✨',
            timestamp: Date.now() - 1500000,
            reactions: { skull: 3, cry: 8, fire: 45, upside: 12 },
            isAI: true,
            isReal: false,
            userReacted: null
        },
        {
            id: 'fallback_6',
            author: 'little.fairy',
            mood: 'chaotic',
            content: 'ortu ngomel terus disuruh kuliah, tapi gue lebih seneng freelance 🌀',
            timestamp: Date.now() - 1800000,
            reactions: { skull: 9, cry: 15, fire: 7, upside: 18 },
            isAI: true,
            isReal: false,
            userReacted: null
        },
        {
            id: 'fallback_7',
            author: 'chili.padi',
            mood: 'thriving',
            content: 'orderan sneakers laku 15 pasang hari ini, rezeki lancar 💰😎',
            timestamp: Date.now() - 2100000,
            reactions: { skull: 2, cry: 4, fire: 38, upside: 9 },
            isAI: true,
            isReal: false,
            userReacted: null
        },
        {
            id: 'fallback_8',
            author: 'satria.bajahitam',
            mood: 'doom',
            content: 'motor mogok, dompet tipis, pacar ngambek. triple combo 🫠',
            timestamp: Date.now() - 2400000,
            reactions: { skull: 22, cry: 35, fire: 1, upside: 14 },
            isAI: true,
            isReal: false,
            userReacted: null
        }
    ];

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
            
            if (data.success && data.spills && data.spills.length > 0) {
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
                
                console.log(`[SpillGen] ✅ API Success: ${spillPool.length}/${SPILL_CONFIG.POOL_MAX_SIZE}`);
                
                // Render
                renderSpills();
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.warn('[SpillGen] ⚠️ API failed:', error.message);
            console.log('[SpillGen] 🔄 Using fallback data...');
            
            // Use fallback data
            useFallbackData();
        } finally {
            isLoading = false;
        }
    }

    function useFallbackData() {
        // Randomize fallback data
        const shuffled = [...FALLBACK_SPILLS].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, SPILL_CONFIG.BREW_COUNT);
        
        // Update timestamps to be recent
        const now = Date.now();
        selected.forEach((spill, i) => {
            spill.timestamp = now - (i * 300000); // 5 min apart
            spill.id = 'fallback_' + now + '_' + i;
        });
        
        // Add to pool
        spillPool = [...selected, ...spillPool].slice(0, SPILL_CONFIG.POOL_MAX_SIZE);
        
        console.log(`[SpillGen] ✅ Fallback loaded: ${spillPool.length}/${SPILL_CONFIG.POOL_MAX_SIZE}`);
        
        // Render
        renderSpills();
    }

    function renderSpills() {
        const spillsContainer = document.getElementById('spillsList');
        
        if (!spillsContainer) {
            console.warn('[SpillGen] ⚠️ spillsList not found');
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
            metaEl.textContent = `${toShow.length} (${spillPool.length} pool)`;
        }
        
        // Render HTML
        if (toShow.length === 0) {
            spillsContainer.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">🍃</span>
                    <div class="empty-title">BELUM ADA SPILL</div>
                    <div class="empty-text">Sedang memuat...</div>
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
    window.getSpillPool = function() { return spillPool; };

    // ============================================
    // AUTO INIT
    // ============================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log('[SpillGen] 📄 DOM ready, initializing...');
            setTimeout(initSpillGenerator, 1000);
        });
    } else {
        console.log('[SpillGen] 📄 DOM already ready, initializing...');
        setTimeout(initSpillGenerator, 1000);
    }

})();
