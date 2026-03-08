// ============================================
// spill-generator.js - FINAL CLEAN VERSION
// BLENDS REAL USER ENTRIES + AI ENTRIES
// ============================================

(function() {
    'use strict';
    
    const SPILL_CONFIG = {
        API_BASE_URL: '/api/brew',
        BREW_INTERVAL: 240000,
        POOL_MAX_SIZE: 27,
        BREW_COUNT: 9,
        SPILL_TARGET: 8,
        REAL_ENTRIES_LIMIT: 20
    };

    let spillPool = [];
    let activeMood = 'all';
    let isLoading = false;
    let supabaseClient = null;

    function initSupabase() {
        try {
            if (typeof supabase !== 'undefined' && supabase.createClient) {
                const SUPABASE_URL = 'https://fuovfrdicdhnlymnacpz.supabase.co';
                const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1b3ZmcmRpY2Robmx5bW5hY3B6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMjYxMzEsImV4cCI6MjA4MjYwMjEzMX0.oX4fVTEIWiRG2NaNJJKOV8dTnSHWhicLVMIFzZUl1o0';
                
                supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
                console.log('[SpillGen] ✅ Supabase client initialized');
                return true;
            }
            console.warn('[SpillGen] ⚠️ Supabase not available');
            return false;
        } catch (e) {
            console.warn('[SpillGen] ⚠️ Supabase init error:', e);
            return false;
        }
    }

    async function fetchRealEntries() {
        if (!supabaseClient) {
            if (!initSupabase()) return [];
        }
        
        try {
            const { data, error } = await supabaseClient
                .from('entries')
                .select(`
                    id,
                    user_id,
                    content,
                    mood,
                    reactions,
                    created_at,
                    profiles!inner(username)
                `)
                .order('created_at', { ascending: false })
                .limit(SPILL_CONFIG.REAL_ENTRIES_LIMIT);
            
            if (error) {
                console.warn('[SpillGen] ⚠️ Supabase query error:', error.message);
                return [];
            }
            
            let currentUserId = null;
            try {
                if (typeof JEJAK !== 'undefined' && JEJAK.getSession) {
                    const session = JEJAK.getSession();
                    currentUserId = session?.uid;
                } else {
                    currentUserId = localStorage.getItem('user_id') || localStorage.getItem('jejak_user_id');
                }
            } catch (e) {
                console.warn('[SpillGen] ⚠️ Could not get current user ID');
            }
            
            const realEntries = (data || [])
                .filter(entry => !(currentUserId && entry.user_id === currentUserId))
                .map(entry => ({
                    id: entry.id,
                    author: entry.profiles?.username || 'anonymous',
                    mood: entry.mood || 'chaotic',
                    content: entry.content || '',
                    timestamp: new Date(entry.created_at).getTime(),
                    reactions: entry.reactions || { skull: 0, cry: 0, fire: 0, upside: 0 },
                    isAI: false,
                    isReal: true,
                    userReacted: null,
                    dbId: entry.id
                }));
            
            console.log(`[SpillGen] 📊 Fetched ${realEntries.length} real entries`);
            return realEntries;
            
        } catch (error) {
            console.warn('[SpillGen] ⚠️ Error fetching real entries:', error.message);
            return [];
        }
    }

    async function fetchAISpills(count = SPILL_CONFIG.BREW_COUNT) {
        try {
            const response = await fetch('/api/brew', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ count })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success && data.spills && data.spills.length > 0) {
                const aiSpills = data.spills.map(spill => ({
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
                
                console.log(`[SpillGen] 🤖 Fetched ${aiSpills.length} AI spills`);
                return aiSpills;
            }
            
            throw new Error('Invalid response format');
            
        } catch (error) {
            console.warn('[SpillGen] ⚠️ API failed:', error.message);
            return [];
        }
    }

    async function blendEntries() {
        if (isLoading) {
            console.log('[SpillGen] ⏳ Already loading, skipping...');
            return;
        }
        
        isLoading = true;
        console.log('[SpillGen] 🔄 Blending real + AI entries...');
        
        try {
            const [realEntries, aiSpills] = await Promise.all([
                fetchRealEntries(),
                fetchAISpills(SPILL_CONFIG.BREW_COUNT)
            ]);
            
            const allEntries = [...realEntries, ...aiSpills].sort((a, b) => b.timestamp - a.timestamp);
            
            spillPool = allEntries.slice(0, SPILL_CONFIG.POOL_MAX_SIZE);
            
            console.log(`[SpillGen] ✅ Blended: ${realEntries.length} real + ${aiSpills.length} AI = ${spillPool.length} total`);
            
            renderSpills();
            
        } catch (error) {
            console.warn('[SpillGen] ⚠️ Blend error:', error.message);
            useFallbackData();
        } finally {
            isLoading = false;
        }
    }

    const FALLBACK_SPILLS = [
        { author: 'beby.manis', mood: 'surviving', content: 'deadline skripsi makin deket, anxiety naik turun 😮‍💨' },
        { author: 'agak.koplak', mood: 'chaotic', content: 'client minta revisi jam 11 malem, this is fine 🔥' },
        { author: 'satria.bajahitam', mood: 'doom', content: 'motor mogok, dompet tipis, triple combo 🫠' },
        { author: 'pretty.sad', mood: 'surviving', content: 'HR minta masuk sabtu minggu, mau resign tapi tabungan tinggal 200rb. bingung jadinya 😭' },
        { author: 'strawberry.shortcake', mood: 'thriving', content: 'akhirnya dapet panggilan interview setelah ngelamar 50+ tempat, semoga lancar ya Allah ✨' },
        { author: 'chili.padi', mood: 'thriving', content: 'orderan sneakers laku 15 pasang hari ini, rezeki anak soleh kata emak 💰😎' },
        { author: 'bang.juned', mood: 'doom', content: 'skripsi bab 3 masih error, dosen pembimbing ga bales chat seminggu, padahal deadline sidang tinggal 2 bulan. pengen mundur tapi udah di depan mata 🥲' },
        { author: 'little.fairy', mood: 'chaotic', content: 'ortu ngomel terus disuruh kuliah, tapi gue dapet project freelance 5 juta. antara nurutin ortu atau ngejar cuan, bingung sumpah 🌀' },
        { author: 'sejuta.badai', mood: 'chaotic', content: 'minggu pagi jam 3, ga bisa tidur karena overthinking masa depan. buka IG liat temen pada nikah, beli rumah, punya mobil, sementara gue masih struggle with skripsi dan dompet tipis. maybe this is my villain arc idk 🛌💔' }
    ];

    function useFallbackData() {
        console.log('[SpillGen] 🔄 Using enhanced fallback data...');
        
        const shuffled = [...FALLBACK_SPILLS].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, SPILL_CONFIG.BREW_COUNT);
        
        const now = Date.now();
        const newSpills = selected.map((spill, i) => ({
            id: 'fallback_' + now + '_' + i + '_' + Math.random().toString(36).slice(2),
            author: spill.author,
            mood: spill.mood,
            content: spill.content,
            timestamp: now - (i * 300000),
            reactions: {
                skull: Math.floor(Math.random() * 30),
                cry: Math.floor(Math.random() * 50),
                fire: Math.floor(Math.random() * 25),
                upside: Math.floor(Math.random() * 20)
            },
            isAI: true,
            isReal: false,
            userReacted: null
        }));
        
        spillPool = [...newSpills, ...spillPool].slice(0, SPILL_CONFIG.POOL_MAX_SIZE);
        
        console.log('[SpillGen] ✅ Fallback loaded: ' + spillPool.length + '/' + SPILL_CONFIG.POOL_MAX_SIZE);
        
        renderSpills();
    }

    function renderSpills() {
        const spillsContainer = document.getElementById('spillsList');
        
        if (!spillsContainer) {
            console.warn('[SpillGen] ⚠️ spillsList not found');
            return;
        }
        
        let filtered = spillPool;
        if (activeMood !== 'all') {
            filtered = spillPool.filter(s => s.mood === activeMood);
        }
        
        const toShow = filtered.slice(0, SPILL_CONFIG.SPILL_TARGET);
        
        const metaEl = document.getElementById('feedMeta');
        if (metaEl) {
            const realCount = toShow.filter(s => s.isReal).length;
            const aiCount = toShow.filter(s => s.isAI).length;
            metaEl.textContent = toShow.length + ' (👤' + realCount + ' 🤖' + aiCount + ')';
        }
        
        if (toShow.length === 0) {
            spillsContainer.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">🍃</span>
                    <div class="empty-title">BELUM ADA SPILL</div>
                    <div class="empty-text">Sedang memuat...</div>
                </div>`;
            return;
        }
        
        let html = '';
        for (let i = 0; i < toShow.length; i++) {
            const spill = toShow[i];
            let reactionsHtml = '';
            
            const reactionTypes = ['skull', 'cry', 'fire', 'upside'];
            for (let j = 0; j < reactionTypes.length; j++) {
                const key = reactionTypes[j];
                const val = spill.reactions[key] || 0;
                const activeClass = (spill.userReacted === key) ? 'active' : '';
                const emoji = key === 'skull' ? '💀' : key === 'cry' ? '😭' : key === 'fire' ? '🔥' : '🙃';
                
                reactionsHtml += '<button class="react-btn ' + activeClass + '" onclick="window.reactToSpill(\'' + spill.id + '\', \'' + key + '\')">' + emoji + ' <span class="react-count">' + val + '</span></button>';
            }
            
            const userIcon = spill.isReal ? '👤' : '🤖';
            
            html += '<div class="spill-card">' +
                '<div class="spill-head">' +
                '<span class="spill-user">' + userIcon + ' @' + escapeHtml(spill.author) + '</span>' +
                '<span class="spill-mood ' + spill.mood + '">' + spill.mood + '</span>' +
                '</div>' +
                '<div class="spill-body">' + escapeHtml(spill.content) + '</div>' +
                '<div class="spill-actions">' + reactionsHtml + '</div>' +
                '</div>';
        }
        
        spillsContainer.innerHTML = html;
    }

    window.reactToSpill = function(spillId, reactionType) {
        const spill = spillPool.find(s => s.id === spillId);
        if (!spill) return;
        
        const wasActive = spill.userReacted === reactionType;
        
        if (wasActive) {
            spill.reactions[reactionType] = Math.max(0, (spill.reactions[reactionType] || 0) - 1);
            spill.userReacted = null;
        } else {
            if (spill.userReacted) {
                const old = spill.userReacted;
                spill.reactions[old] = Math.max(0, (spill.reactions[old] || 0) - 1);
            }
            spill.reactions[reactionType] = (spill.reactions[reactionType] || 0) + 1;
            spill.userReacted = reactionType;
        }
        
        renderSpills();
        
        if (spill.isReal && spill.dbId && supabaseClient) {
            supabaseClient
                .from('entries')
                .update({ reactions: spill.reactions })
                .eq('id', spill.dbId)
                .then()
                .catch(e => console.warn('[SpillGen] Failed to update reaction:', e));
        }
    };

    function filterMood(mood) {
        activeMood = mood;
        
        const chips = document.querySelectorAll('.mood-chip');
        for (let i = 0; i < chips.length; i++) {
            const chip = chips[i];
            if (chip.dataset.mood === mood) {
                chip.classList.add('active');
            } else {
                chip.classList.remove('active');
            }
        }
        
        renderSpills();
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function initSpillGenerator() {
        console.log('[SpillGen] 🚀 Initializing...');
        
        initSupabase();
        
        setTimeout(function() { blendEntries(); }, 2000);
        
        setInterval(function() { blendEntries(); }, SPILL_CONFIG.BREW_INTERVAL);
    }

    window.initSpillGenerator = initSpillGenerator;
    window.blendEntries = blendEntries;
    window.filterMood = filterMood;
    window.getSpillPool = function() { return spillPool; };
    window.refreshFeed = blendEntries;

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
