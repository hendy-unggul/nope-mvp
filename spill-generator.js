// ============================================
// spill-generator.js - SMART AI FILLER
// Max 10% AI ketika native user sudah memadai
// Seamless blend - no AI badge
// ============================================

(function() {
    'use strict';
    
    const SPILL_CONFIG = {
        API_BASE_URL: '/api/rants',
        BREW_INTERVAL: 300000,      // 5 menit
        POOL_MAX_SIZE: 50,          // Pool besar untuk seleksi
        BREW_COUNT: 9,              // Fetch 9 per brew
        AI_MAX_PERCENTAGE: 0.1,     // Max 10% AI entries
        MIN_NATIVE_THRESHOLD: 20    // Threshold: jika native >= 20, AI cuma 10%
    };

    // ✅ INTERNAL STATE
    let spillPool = [];
    let isLoading = false;

    // ✅ FALLBACK DATA - Pakai username asli, bukan "AI"
    const FALLBACK_SPILLS = [
        {
            id: 'ai_1',
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
            id: 'ai_2',
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
            id: 'ai_3',
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
            id: 'ai_4',
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
            id: 'ai_5',
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
            id: 'ai_6',
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
            id: 'ai_7',
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
            id: 'ai_8',
            author: 'satria.bajahitam',
            mood: 'doom',
            content: 'motor mogok, dompet tipis, pacar ngambek. triple combo 🫠',
            timestamp: Date.now() - 2400000,
            reactions: { skull: 22, cry: 35, fire: 1, upside: 14 },
            isAI: true,
            isReal: false,
            userReacted: null
        },
        {
            id: 'ai_9',
            author: 'cinnamon.girl',
            mood: 'surviving',
            content: 'murid TK nangis semua, pulang kepala pusing banget 😮‍💨',
            timestamp: Date.now() - 2700000,
            reactions: { skull: 8, cry: 19, fire: 2, upside: 11 },
            isAI: true,
            isReal: false,
            userReacted: null
        },
        {
            id: 'ai_10',
            author: 'sejuta.badai',
            mood: 'doom',
            content: 'lagu baru gue dengerin sendiri doang. mungkin musik bukan jalan hidupku 🛌',
            timestamp: Date.now() - 3000000,
            reactions: { skull: 14, cry: 27, fire: 3, upside: 9 },
            isAI: true,
            isReal: false,
            userReacted: null
        }
    ];

    function initSpillGenerator() {
        console.log('[AI Filler] 🚀 Initializing smart AI filler...');
        
        // Initial brew after 2 seconds
        setTimeout(() => brewNewSpills(), 2000);
        
        // Auto-brew every 5 minutes
        setInterval(() => brewNewSpills(), SPILL_CONFIG.BREW_INTERVAL);
    }

    async function brewNewSpills(count = SPILL_CONFIG.BREW_COUNT) {
        if (isLoading) {
            console.log('[AI Filler] ⏳ Already loading, skipping...');
            return;
        }
        
        isLoading = true;
        console.log(`[AI Filler] 🍵 Brewing ${count} AI entries...`);
        
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
            
            if (data.success && data.spills && data.spills.length > 0) {
                const newSpills = data.spills.map(spill => ({
                    id: spill.id,
                    author: spill.author,           // Username asli dari persona
                    mood: spill.mood,
                    content: spill.content,
                    timestamp: spill.timestamp,
                    reactions: spill.reactions || { skull: 0, cry: 0, fire: 0, upside: 0 },
                    isAI: true,                     // Flag internal
                    isReal: false,
                    userReacted: null
                }));
                
                // FIFO
                spillPool = [...newSpills, ...spillPool].slice(0, SPILL_CONFIG.POOL_MAX_SIZE);
                
                console.log(`[AI Filler] ✅ API Success: ${spillPool.length}/${SPILL_CONFIG.POOL_MAX_SIZE}`);
                
                // Trigger render
                triggerRender();
            } else {
                throw new Error('Invalid response');
            }
        } catch (error) {
            console.warn('[AI Filler] ⚠️ API failed:', error.message);
            console.log('[AI Filler] 🔄 Using fallback data...');
            
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
            spill.id = 'ai_fb_' + now + '_' + i;
        });
        
        spillPool = [...selected, ...spillPool].slice(0, SPILL_CONFIG.POOL_MAX_SIZE);
        
        console.log(`[AI Filler] ✅ Fallback loaded: ${spillPool.length}`);
        
        triggerRender();
    }

    function triggerRender() {
        if (typeof window.renderMixedSpills === 'function') {
            window.renderMixedSpills();
        }
    }

    // ============================================
    // PUBLIC API
    // ============================================
    window.initSpillGenerator = initSpillGenerator;
    window.brewNewSpills = brewNewSpills;
    window.getSpillPool = function() { return spillPool; };

    // ============================================
    // AUTO INIT
    // ============================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log('[AI Filler] 📄 DOM ready');
            setTimeout(initSpillGenerator, 1000);
        });
    } else {
        console.log('[AI Filler] 📄 DOM already ready');
        setTimeout(initSpillGenerator, 1000);
    }

})();
