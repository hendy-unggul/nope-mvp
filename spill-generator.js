// ============================================
// spill-generator.js - FINAL VERSION
// BLENDS REAL USER ENTRIES + AI ENTRIES
// ============================================

(function() {
    'use strict';
    
    const SPILL_CONFIG = {
        API_BASE_URL: '/api/brew',
        BREW_INTERVAL: 240000,        // 4 menit
        POOL_MAX_SIZE: 27,             // Max total entries di pool
        BREW_COUNT: 9,                  // Jumlah AI baru setiap brew
        SPILL_TARGET: 8,                // Jumlah yang ditampilkan
        REAL_ENTRIES_LIMIT: 20          // Max real entries dari Supabase
    };

    // ✅ INTERNAL STATE
    let spillPool = [];
    let activeMood = 'all';
    let isLoading = false;
    let supabaseClient = null;

    // ✅ INITIALIZE SUPABASE
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

    // ✅ FETCH REAL ENTRIES FROM SUPABASE
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
            
            // Get current user ID from localStorage/JEJAK
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
            
            // Format real entries
            const realEntries = (data || [])
                .filter(entry => !(currentUserId && entry.user_id === currentUserId)) // Filter out current user's own posts
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
                    dbId: entry.id  // Keep original ID for reactions
                }));
            
            console.log(`[SpillGen] 📊 Fetched ${realEntries.length} real entries`);
            return realEntries;
            
        } catch (error) {
            console.warn('[SpillGen] ⚠️ Error fetching real entries:', error.message);
            return [];
        }
    }

    // ✅ FETCH AI ENTRIES FROM API
    async function fetchAISpills(count = SPILL_CONFIG.BREW_COUNT) {
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

    // ✅ BLEND REAL + AI ENTRIES
    async function blendEntries() {
        if (isLoading) {
            console.log('[SpillGen] ⏳ Already loading, skipping...');
            return;
        }
        
        isLoading = true;
        console.log('[SpillGen] 🔄 Blending real + AI entries...');
        
        try {
            // Fetch both sources in parallel
            const [realEntries, aiSpills] = await Promise.all([
                fetchRealEntries(),
                fetchAISpills(SPILL_CONFIG.BREW_COUNT)
            ]);
            
            // Combine and sort by timestamp (newest first)
            const allEntries = [...realEntries, ...aiSpills].sort((a, b) => b.timestamp - a.timestamp);
            
            // Take only up to POOL_MAX_SIZE
            spillPool = allEntries.slice(0, SPILL_CONFIG.POOL_MAX_SIZE);
            
            console.log(`[SpillGen] ✅ Blended: ${realEntries.length} real + ${aiSpills.length} AI = ${spillPool.length} total`);
            
            // Render
            renderSpills();
            
        } catch (error) {
            console.warn('[SpillGen] ⚠️ Blend error:', error.message);
            useFallbackData();
        } finally {
            isLoading = false;
        }
    }

    // ✅ ENHANCED FALLBACK DATA (with varied lengths)
    const FALLBACK_SPILLS = [
        // Pendek (7-10 kata)
        { author: 'beby.manis', mood: 'surviving', content: 'deadline skripsi makin deket, anxiety naik turun 😮‍💨' },
        { author: 'agak.koplak', mood: 'chaotic', content: 'client minta revisi jam 11 malem, this is fine 🔥' },
        { author: 'satria.bajahitam', mood: 'doom', content: 'motor mogok, dompet tipis, triple combo 🫠' },
        
        // Medium (15-20 kata)
        { author: 'pretty.sad', mood: 'surviving', content: 'HR minta masuk sabtu minggu, mau resign tapi tabungan tinggal 200rb. bingung jadinya 😭' },
        { author: 'strawberry.shortcake', mood: 'thriving', content: 'akhirnya dapet panggilan interview setelah ngelamar 50+ tempat, semoga lancar ya Allah ✨' },
        { author: 'chili.padi', mood: 'thriving', content: 'orderan sneakers laku 15 pasang hari ini, rezeki anak soleh kata emak 💰😎' },
        
        // Panjang (25-30 kata)
        { author: 'bang.juned', mood: 'doom', content: 'skripsi bab 3 masih error, dosen pembimbing ga bales chat seminggu, padahal deadline sidang tinggal 2 bulan. pengen mundur tapi udah di depan mata 🥲' },
        { author: 'little.fairy', mood: 'chaotic', content: 'ortu ngomel terus disuruh kuliah, tapi gue dapet project freelance 5 juta. antara nurutin ortu atau ngejar cuan, bingung sumpah 🌀' },
        
        // Sangat panjang (35-40 kata)
        { author: 'sejuta.badai', mood: 'chaotic', content: 'minggu pagi jam 3, ga bisa tidur karena overthinking masa depan. buka IG liat temen pada nikah, beli rumah, punya mobil, sementara gue masih struggle with skripsi dan dompet tipis. maybe this is my villain arc idk 🛌💔' }
    ];

    function useFallbackData() {
        console.log('[SpillGen] 🔄 Using enhanced fallback data...');
        
        // Shuffle and take BREW_COUNT
        const shuffled = [...FALLBACK_SPILLS].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, SPILL_CONFIG.BREW_COUNT);
        
        // Format with timestamps
        const now = Date.now();
        const newSpills = selected.map((spill, i) => ({
            id: `fallback_${now}_${i}_${Math.random().toString(36).slice(2)}`,
            author: spill.author,
            mood: spill.mood,
            content: spill.content,
            timestamp: now - (i * 300000), // 5 min apart
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
        
        // Add to pool
        spillPool = [...newSpills, ...spillPool].slice(0, SPILL_CONFIG.POOL_MAX_SIZE);
        
        console.log(`[SpillGen] ✅ Fallback loaded: ${spillPool.length}/${SPILL_CONFIG.POOL_MAX_SIZE}`);
        
        // Render
        renderSpills();
    }

    // ✅ RENDER SPILLS
    function renderSpills() {
        const spillsContainer = document.getElementById('spillsList');
        
        if (!spillsContainer) {
            console.warn('[SpillGen] ⚠️ spillsList not found');
            return;
        }
        
        // Filter by mood
        let filtered = spillPool;
        if (activeMood !== 'all') {
            filtered = spillPool.filter(s => s.mood === activeMood);
        }
        
        // Take only target amount
        const toShow = filtered.slice(0, SPILL_CONFIG.SPILL_TARGET);
        
        // Update meta
        const metaEl = document.getElementById('feedMeta');
        if (metaEl) {
            const realCount = toShow.filter(s => s.isReal).length;
            const aiCount = toShow.filter(s => s.isAI).length;
            metaEl.textContent = `${toShow.length} (👤${realCount} 🤖${aiCount})`;
        }
        
        // Render HTML
        if (toShow.length === 0) {
            spillsContainer.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">🍃</span>
                    <div class="empty-title">BELUM ADA SPILL</div>
                    <div class="empty-text">Sedang memuat...</div>
                </div>`;
            return;
        }
        
        spillsContainer.innerHTML = toShow.map(spill => `
            <div class="spill-card">
                <div class="spill-head">
                    <span class="spill-user">
                        ${spill.isReal ? '👤 ' : '🤖 '}@${escapeHtml(spill.author)}
                    </span>
                    <span class="spill-mood ${spill.mood}">${spill.mood}</span>
                </div>
                <div class="spill-body">${escapeHtml(spill.content)}</div>
                <div class="spill-actions">
                    ${Object.entries(spill.reactions).map(([key, val]) => `
                        <button class="react-btn ${spill.userReacted === key ? 'active' : ''}" 
                                onclick="window.reactToSpill('${spill.id}', '${key}')">
                            ${getReactionEmoji(key)} <span class="react-count">${val}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    // Helper untuk emoji reactions
    function getReactionEmoji(type) {
        const emojis = { skull: '💀', cry: '😭', fire: '🔥', upside: '🙃' };
        return emojis[type] || type;
    }

    // ✅ EXPOSE REACTION FUNCTION TO WINDOW
    window.reactToSpill = async function(spillId, reactionType) {
        // Cari spill di pool
        const spill = spillPool.find(s => s.id === spillId);
        if (!spill) return;
        
        // Handle reaction logic (toggle)
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
        
        // Re-render
        renderSpills();
        
        // If it's a real entry, update in Supabase
        if (spill.isReal && spill.dbId && supabaseClient) {
            try {
                await supabaseClient
                    .from('entries')
                    .update({ reactions: spill.reactions })
                    .eq('id', spill.dbId);
            } catch (e) {
                console.warn('[SpillGen] Failed to update reaction in Supabase:', e);
            }
        }
    };

    function filterMood(mood) {
        console.log('[SpillGen] 🎯 Filter mood:', mood);
        activeMood = mood;
        
        // Update UI chips
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

    // ✅ INITIALIZATION
    function initSpillGenerator() {
        console.log('[SpillGen] 🚀 Initializing...');
        
        // Initialize Supabase
        initSupabase();
        
        // Initial blend after 2 seconds
        setTimeout(() => blendEntries(), 2000);
        
        // Auto-blend every 4 minutes
        setInterval(() => blendEntries(), SPILL_CONFIG.BREW_INTERVAL);
    }

    // ✅ EXPOSE TO WINDOW
    window.initSpillGenerator = initSpillGenerator;
    window.blendEntries = blendEntries;
    window.filterMood = filterMood;
    window.getSpillPool = () => spillPool;
    window.refreshFeed = blendEntries;  // Alias for refresh button

    // ✅ AUTO INIT
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('[SpillGen] 📄 DOM ready, initializing...');
            setTimeout(initSpillGenerator, 1000);
        });
    } else {
        console.log('[SpillGen] 📄 DOM already ready, initializing...');
        setTimeout(initSpillGenerator, 1000);
    }

})();
