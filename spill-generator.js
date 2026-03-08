// ============================================
// spill-generator.js - FINAL VERSION
// BLENDING 3 REAL + 5 AI UNTUK FEED
// ============================================

(function() {
    'use strict';
    
    const SPILL_CONFIG = {
        REFRESH_INTERVAL: 240000,  // 4 menit
        FEED_TARGET: 8,
        REAL_LIMIT: 3,    // 3 real entries di feed
        AI_LIMIT: 5       // 5 AI entries di feed
    };

    let spillPool = [];
    let activeMood = 'all';
    let isLoading = false;
    let supabaseClient = null;

    // ============================================
    // INIT SUPABASE
    // ============================================
    function initSupabase() {
        try {
            const SUPABASE_URL = 'https://fuovfrdicdhnlymnacpz.supabase.co';
            const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1b3ZmcmRpY2Robmx5bW5hY3B6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMjYxMzEsImV4cCI6MjA4MjYwMjEzMX0.oX4fVTEIWiRG2NaNJJKOV8dTnSHWhicLVMIFzZUl1o0';
            
            supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            console.log('[SpillGen] ✅ Supabase connected');
            return true;
        } catch (e) {
            console.warn('[SpillGen] ⚠️ Supabase init error:', e);
            return false;
        }
    }

    // ============================================
    // GET CURRENT USER ID
    // ============================================
    function getCurrentUserId() {
        try {
            if (typeof JEJAK !== 'undefined' && JEJAK.getSession) {
                const session = JEJAK.getSession();
                return session?.uid;
            }
            return localStorage.getItem('user_id') || 
                   localStorage.getItem('jejak_user_id');
        } catch (e) {
            return null;
        }
    }

    // ============================================
    // FETCH FEED ENTRIES (3 REAL + 5 AI)
    // ============================================
    async function fetchFeedEntries() {
        if (!supabaseClient && !initSupabase()) {
            console.log('[SpillGen] ⚠️ Pakai fallback feed');
            return generateFallbackFeed();
        }
        
        try {
            console.log('[SpillGen] 📡 Mengambil entries untuk feed...');
            
            // Ambil 3 REAL entries terbaru (dari semua user)
            const { data: realEntries, error: realError } = await supabaseClient
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
                .eq('is_ai', false)
                .order('created_at', { ascending: false })
                .limit(SPILL_CONFIG.REAL_LIMIT);
            
            if (realError) {
                console.warn('[SpillGen] Error real:', realError.message);
            }
            
            // Ambil 5 AI entries terbaru
            const { data: aiEntries, error: aiError } = await supabaseClient
                .from('entries')
                .select('*')
                .eq('is_ai', true)
                .order('created_at', { ascending: false })
                .limit(SPILL_CONFIG.AI_LIMIT);
            
            if (aiError) {
                console.warn('[SpillGen] Error AI:', aiError.message);
            }
            
            const currentUserId = getCurrentUserId();
            
            // Format real entries
            const formattedReal = (realEntries || []).map(entry => ({
                id: entry.id,
                author: entry.profiles?.username || 'anonymous',
                mood: entry.mood || 'chaotic',
                content: entry.content || '',
                timestamp: new Date(entry.created_at).getTime(),
                reactions: entry.reactions || { skull: 0, cry: 0, fire: 0, upside: 0 },
                type: 'real',
                isOwn: currentUserId ? entry.user_id === currentUserId : false,
                userReacted: null,
                dbId: entry.id
            }));
            
            // Format AI entries
            const formattedAI = (aiEntries || []).map(entry => ({
                id: entry.id,
                author: 'ai.' + (entry.mood || 'secret'),
                mood: entry.mood || 'chaotic',
                content: entry.content || '',
                timestamp: new Date(entry.created_at).getTime(),
                reactions: entry.reactions || { skull: 0, cry: 0, fire: 0, upside: 0 },
                type: 'ai',
                isOwn: false,
                userReacted: null,
                dbId: entry.id
            }));
            
            // Gabung dan urutkan berdasarkan timestamp
            const blended = [...formattedReal, ...formattedAI]
                .sort((a, b) => b.timestamp - a.timestamp);
            
            console.log(`[SpillGen] ✅ Feed: ${formattedReal.length} real + ${formattedAI.length} AI = ${blended.length} entries`);
            
            return blended;
            
        } catch (error) {
            console.error('[SpillGen] Error fetch:', error);
            return generateFallbackFeed();
        }
    }

    // ============================================
    // FALLBACK FEED (KALO SUPABASE ERROR)
    // ============================================
    function generateFallbackFeed() {
        console.log('[SpillGen] 🔄 Generate fallback feed...');
        
        const fallbackReal = [
            { author: 'real.user1', mood: 'surviving', content: 'hari ini lagi berat, tapi harus kuat 😮‍💨' },
            { author: 'real.user2', mood: 'thriving', content: 'akhirnya dapet kerja setelah 3 bulan nganggur! ✨' },
            { author: 'real.user3', mood: 'chaotic', content: 'hidup emang ga pernah tebak-tebakan buah 🫠' }
        ];
        
        const fallbackAI = [
            { author: 'beby.manis', mood: 'surviving', content: 'deadline skripsi makin deket, anxiety naik turun 😮‍💨' },
            { author: 'agak.koplak', mood: 'chaotic', content: 'client minta revisi jam 11 malem, this is fine 🔥' },
            { author: 'pretty.sad', mood: 'doom', content: 'HR minta masuk sabtu minggu, mau resign tapi tabungan tipis 🛌' },
            { author: 'bang.juned', mood: 'surviving', content: 'skripsi bab 3 masih error, dosen ga bales email seminggu 😭' },
            { author: 'strawberry.shortcake', mood: 'thriving', content: 'akhirnya dapet panggilan interview setelah ngelamar 50+ tempat ✨' }
        ];
        
        const now = Date.now();
        const formattedReal = fallbackReal.map((item, i) => ({
            ...item,
            id: `fallback_real_${i}`,
            timestamp: now - (i * 3600000),
            reactions: { skull: 5, cry: 10, fire: 3, upside: 2 },
            type: 'real',
            userReacted: null
        }));
        
        const formattedAI = fallbackAI.map((item, i) => ({
            ...item,
            id: `fallback_ai_${i}`,
            timestamp: now - (i * 1800000) - 900000,
            reactions: { skull: 8, cry: 15, fire: 5, upside: 3 },
            type: 'ai',
            userReacted: null
        }));
        
        return [...formattedReal, ...formattedAI]
            .sort((a, b) => b.timestamp - a.timestamp);
    }

    // ============================================
    // REFRESH FEED
    // ============================================
    async function refreshFeed() {
        if (isLoading) {
            console.log('[SpillGen] ⏳ Masih loading...');
            return;
        }
        
        isLoading = true;
        console.log('[SpillGen] 🔄 Refresh feed...');
        
        try {
            spillPool = await fetchFeedEntries();
            renderSpills();
        } catch (error) {
            console.error('[SpillGen] Error:', error);
        } finally {
            isLoading = false;
        }
    }

    // ============================================
    // RENDER SPILLS KE HTML
    // ============================================
    function renderSpills() {
        const container = document.getElementById('spillsList');
        if (!container) return;
        
        // Filter by mood
        let filtered = spillPool;
        if (activeMood !== 'all') {
            filtered = spillPool.filter(s => s.mood === activeMood);
        }
        
        const toShow = filtered.slice(0, SPILL_CONFIG.FEED_TARGET);
        
        // Update meta
        const metaEl = document.getElementById('feedMeta');
        if (metaEl) {
            const realCount = toShow.filter(s => s.type === 'real').length;
            const aiCount = toShow.filter(s => s.type === 'ai').length;
            metaEl.textContent = `${toShow.length} (👤${realCount} 🤖${aiCount})`;
        }
        
        if (toShow.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">🍃</span>
                    <div class="empty-title">BELUM ADA SPILL</div>
                    <div class="empty-text">Sedang memuat...</div>
                </div>`;
            return;
        }
        
        let html = '';
        for (let s of toShow) {
            const icon = s.type === 'real' ? '👤' : '🤖';
            const ownClass = s.isOwn ? ' own-spill' : '';
            
            html += `<div class="spill-card${ownClass}">
                <div class="spill-head">
                    <span class="spill-user">${icon} @${escapeHtml(s.author)}</span>
                    <span class="spill-mood ${s.mood}">${s.mood}</span>
                </div>
                <div class="spill-body">${escapeHtml(s.content)}</div>
                <div class="spill-actions">
                    ${renderReactions(s)}
                </div>
            </div>`;
        }
        
        container.innerHTML = html;
    }

    function renderReactions(spill) {
        const emojis = { skull: '💀', cry: '😭', fire: '🔥', upside: '🙃' };
        return Object.entries(spill.reactions).map(([key, val]) => 
            `<button class="react-btn ${spill.userReacted === key ? 'active' : ''}" 
                    onclick="window.reactToSpill('${spill.id}', '${key}')">
                ${emojis[key]} <span class="react-count">${val}</span>
            </button>`
        ).join('');
    }

    // ============================================
    // REACTION HANDLER
    // ============================================
    window.reactToSpill = async function(spillId, reactionType) {
        const spill = spillPool.find(s => s.id === spillId);
        if (!spill) return;
        
        // Update local
        if (spill.userReacted === reactionType) {
            spill.reactions[reactionType] = Math.max(0, (spill.reactions[reactionType] || 0) - 1);
            spill.userReacted = null;
        } else {
            if (spill.userReacted) {
                spill.reactions[spill.userReacted] = Math.max(0, (spill.reactions[spill.userReacted] || 0) - 1);
            }
            spill.reactions[reactionType] = (spill.reactions[reactionType] || 0) + 1;
            spill.userReacted = reactionType;
        }
        
        renderSpills();
        
        // Update ke Supabase (kalo real entry)
        if (spill.type === 'real' && supabaseClient && spill.dbId) {
            try {
                await supabaseClient
                    .from('entries')
                    .update({ reactions: spill.reactions })
                    .eq('id', spill.dbId);
            } catch (e) {
                console.warn('[SpillGen] Gagal update reaction:', e);
            }
        }
    };

    // ============================================
    // FILTER MOOD
    // ============================================
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

    // ============================================
    // INIT
    // ============================================
    function init() {
        console.log('[SpillGen] 🚀 Initializing...');
        initSupabase();
        refreshFeed();
        setInterval(refreshFeed, SPILL_CONFIG.REFRESH_INTERVAL);
    }

    // ============================================
    // EXPOSE TO WINDOW
    // ============================================
    window.initSpillGenerator = init;
    window.refreshFeed = refreshFeed;
    window.filterMood = filterMood;
    window.getSpillPool = () => spillPool;

    // Auto start
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(init, 1000));
    } else {
        setTimeout(init, 1000);
    }

})();
