// ============================================
// spill-generator.js - FINAL VERSION
// NO AI LABELS - PURE ANONYMOUS USER EXPERIENCE
// ============================================

(function() {
    'use strict';
    
    const CONFIG = {
        REFRESH_INTERVAL: 240000,  // 4 menit
        FEED_TARGET: 8
    };

    let spillPool = [];
    let activeMood = 'all';
    let isLoading = false;

    // ============================================
    // AI SPILLS DATABASE - INTERNAL ONLY
    // GA ADA LABEL AI YANG KELIATAN
    // ============================================
    const now = Date.now();
    const AI_SPILLS = [
        // 7-10 KATA
        { 
            id: 'spill_001',  // ID netral
            author: 'beby.manis', 
            mood: 'surviving', 
            content: 'deadline skripsi makin deket, anxiety naik turun 😮‍💨',
            timestamp: now - 3600000,
            reactions: { skull: 12, cry: 23, fire: 5, upside: 3 }
        },
        { 
            id: 'spill_002',
            author: 'agak.koplak', 
            mood: 'chaotic', 
            content: 'client minta revisi jam 11 malem, this is fine 🔥',
            timestamp: now - 7200000,
            reactions: { skull: 18, cry: 31, fire: 9, upside: 7 }
        },
        { 
            id: 'spill_003',
            author: 'satria.bajahitam', 
            mood: 'doom', 
            content: 'motor mogok, dompet tipis, pacar ngambek. triple combo 🫠',
            timestamp: now - 10800000,
            reactions: { skull: 22, cry: 35, fire: 1, upside: 14 }
        },
        
        // 15-20 KATA
        { 
            id: 'spill_004',
            author: 'pretty.sad', 
            mood: 'doom', 
            content: 'HR minta masuk sabtu minggu, mau resign tapi tabungan tinggal 200rb. bingung jadinya 😭',
            timestamp: now - 14400000,
            reactions: { skull: 25, cry: 42, fire: 3, upside: 12 }
        },
        { 
            id: 'spill_005',
            author: 'strawberry.shortcake', 
            mood: 'thriving', 
            content: 'akhirnya dapet panggilan interview setelah ngelamar 50+ tempat, semoga lancar ya Allah ✨',
            timestamp: now - 18000000,
            reactions: { skull: 3, cry: 8, fire: 45, upside: 12 }
        },
        { 
            id: 'spill_006',
            author: 'chili.padi', 
            mood: 'thriving', 
            content: 'orderan sneakers laku 15 pasang hari ini, rezeki lancar 💰😎',
            timestamp: now - 21600000,
            reactions: { skull: 2, cry: 4, fire: 38, upside: 9 }
        },
        
        // 25-30 KATA
        { 
            id: 'spill_007',
            author: 'bang.juned', 
            mood: 'surviving', 
            content: 'skripsi bab 3 masih error, dosen pembimbing ga bales chat seminggu, padahal deadline sidang tinggal 2 bulan. pengen mundur tapi udah di depan mata 🥲',
            timestamp: now - 25200000,
            reactions: { skull: 15, cry: 28, fire: 2, upside: 8 }
        },
        { 
            id: 'spill_008',
            author: 'little.fairy', 
            mood: 'chaotic', 
            content: 'ortu ngomel terus disuruh kuliah, tapi gue dapet project freelance 5 juta. antara nurutin ortu atau ngejar cuan, bingung sumpah 🌀',
            timestamp: now - 28800000,
            reactions: { skull: 9, cry: 15, fire: 7, upside: 18 }
        },
        
        // 35-40 KATA
        { 
            id: 'spill_009',
            author: 'sejuta.badai', 
            mood: 'chaotic', 
            content: 'minggu pagi jam 3, ga bisa tidur karena overthinking masa depan. buka IG liat temen pada nikah, beli rumah, punya mobil, sementara gue masih struggle with skripsi dan dompet tipis. maybe this is my villain arc idk 🛌💔',
            timestamp: now - 32400000,
            reactions: { skull: 30, cry: 45, fire: 8, upside: 20 }
        }
    ];

    // ============================================
    // GET FRESH SPILLS (RANDOMIZED)
    // ============================================
    function getFreshSpills(count = 8) {
        // Shuffle biar variatif
        const shuffled = [...AI_SPILLS].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }

    // ============================================
    // REFRESH FEED
    // ============================================
    function refreshFeed() {
        if (isLoading) return;
        
        isLoading = true;
        console.log('[SpillGen] 🔄 Refreshing feed...');
        
        try {
            // Ambil fresh spills
            let freshSpills = getFreshSpills(CONFIG.FEED_TARGET);
            
            // Gabung dengan real entries kalau ada
            const realEntries = window.realEntries || [];
            let allEntries = [...realEntries, ...freshSpills];
            
            // Filter mood
            if (activeMood !== 'all') {
                allEntries = allEntries.filter(s => s.mood === activeMood);
            }
            
            // Urutin by timestamp (terbaru dulu)
            allEntries.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
            
            spillPool = allEntries.slice(0, CONFIG.FEED_TARGET);
            renderSpills();
            
        } catch (error) {
            console.error('[SpillGen] Error:', error);
        } finally {
            isLoading = false;
        }
    }

    // ============================================
    // RENDER SPILLS - NO AI LABELS!
    // ============================================
    function renderSpills() {
        const container = document.getElementById('spillsList');
        if (!container) return;
        
        if (spillPool.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">🍃</span>
                    <div class="empty-title">BELUM ADA SPILL</div>
                    <div class="empty-text">Jadi yang pertama spill!</div>
                </div>`;
            return;
        }
        
        // Update meta - HANYA JUMLAH, TANPA LABEL
        const metaEl = document.getElementById('feedMeta');
        if (metaEl) {
            metaEl.textContent = `${spillPool.length} spill`;
        }
        
        let html = '';
        for (let s of spillPool) {
            html += `<div class="spill-card" data-id="${s.id}">
                <div class="spill-head">
                    <span class="spill-user">@${escapeHtml(s.author)}</span>
                    <span class="spill-mood ${s.mood}">${s.mood.toUpperCase()}</span>
                </div>
                <div class="spill-body">${escapeHtml(s.content)}</div>
                <div class="spill-actions">
                    <button class="react-btn" onclick="window.reactToSpill('${s.id}', 'skull')">
                        💀 <span class="react-count">${s.reactions.skull}</span>
                    </button>
                    <button class="react-btn" onclick="window.reactToSpill('${s.id}', 'cry')">
                        😭 <span class="react-count">${s.reactions.cry}</span>
                    </button>
                    <button class="react-btn" onclick="window.reactToSpill('${s.id}', 'fire')">
                        🔥 <span class="react-count">${s.reactions.fire}</span>
                    </button>
                    <button class="react-btn" onclick="window.reactToSpill('${s.id}', 'upside')">
                        🙃 <span class="react-count">${s.reactions.upside}</span>
                    </button>
                </div>
            </div>`;
        }
        
        container.innerHTML = html;
    }

    // ============================================
    // REACTION HANDLER
    // ============================================
    window.reactToSpill = function(spillId, reactionType) {
        const spill = spillPool.find(s => s.id === spillId);
        if (!spill) return;
        
        // Update reaction
        spill.reactions[reactionType] = (spill.reactions[reactionType] || 0) + 1;
        
        // Re-render
        renderSpills();
        
        console.log(`👍 Reaction: ${reactionType} on ${spill.author}`);
    };

    // ============================================
    // FILTER MOOD
    // ============================================
    function filterMood(mood) {
        activeMood = mood;
        
        document.querySelectorAll('.mood-chip').forEach(chip => {
            chip.classList.toggle('active', chip.dataset.mood === mood);
        });
        
        refreshFeed();
    }

    // ============================================
    // ESCAPE HTML
    // ============================================
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ============================================
    // INIT
    // ============================================
    function init() {
        console.log('[SpillGen] 🚀 Initializing...');
        refreshFeed();
        setInterval(refreshFeed, CONFIG.REFRESH_INTERVAL);
    }

    // ============================================
    // EXPOSE TO WINDOW
    // ============================================
    window.initSpillGenerator = init;
    window.refreshFeed = refreshFeed;
    window.filterMood = filterMood;

    // Auto start
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(init, 1000));
    } else {
        setTimeout(init, 1000);
    }

})();
