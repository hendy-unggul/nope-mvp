// ============================================
// spill-generator.js - FINAL VERSION
// FOCUS ON AI ENTRIES WITH VARIED LENGTHS
// ============================================

(function() {
    'use strict';
    
    const CONFIG = {
        REFRESH_INTERVAL: 240000,  // 4 menit
        FEED_TARGET: 8,
        AI_LIMIT: 8,  // Tampilkan 8 AI entries
        SHOW_REAL: false  // Set ke true kalo mau blending real + AI nanti
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
            supabaseClient = supabase.createClient(
                'https://fuovfrdicdhnlymnacpz.supabase.co',
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1b3ZmcmRpY2Robmx5bW5hY3B6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMjYxMzEsImV4cCI6MjA4MjYwMjEzMX0.oX4fVTEIWiRG2NaNJJKOV8dTnSHWhicLVMIFzZUl1o0'
            );
            console.log('[SpillGen] ✅ Supabase connected');
            return true;
        } catch (e) {
            console.warn('[SpillGen] ❌ Supabase init error:', e);
            return false;
        }
    }

    // ============================================
    // FETCH AI ENTRIES ONLY
    // ============================================
    async function fetchAIEntries() {
        if (!supabaseClient && !initSupabase()) {
            return generateFallbackAI();
        }
        
        try {
            console.log('[SpillGen] 🤖 Mengambil AI entries...');
            
            const { data, error } = await supabaseClient
                .from('entries')
                .select('*')
                .eq('is_ai', true)
                .order('created_at', { ascending: false })
                .limit(20);  // Ambil 20, nanti difilter
            
            if (error) {
                console.warn('[SpillGen] Error:', error.message);
                return generateFallbackAI();
            }
            
            // Format AI entries
            const aiEntries = (data || []).map(entry => ({
                id: entry.id,
                author: entry.user_id === 'ai_system' 
                    ? getAIAuthor(entry.mood) 
                    : 'ai.secret',
                mood: entry.mood || 'chaotic',
                content: entry.content || '',
                timestamp: new Date(entry.created_at).getTime(),
                reactions: entry.reactions || { skull: 0, cry: 0, fire: 0, upside: 0 },
                type: 'ai',
                userReacted: null,
                dbId: entry.id
            }));
            
            console.log(`[SpillGen] 🤖 Mendapat ${aiEntries.length} AI entries`);
            return aiEntries;
            
        } catch (e) {
            console.error('[SpillGen] Error:', e);
            return generateFallbackAI();
        }
    }
    
    // Helper untuk author name berdasarkan mood
    function getAIAuthor(mood) {
        const authors = {
            'surviving': ['beby.manis', 'bang.juned', 'cinnamon.girl'],
            'thriving': ['strawberry.shortcake', 'chili.padi'],
            'chaotic': ['agak.koplak', 'little.fairy', 'sejuta.badai'],
            'doom': ['pretty.sad', 'satria.bajahitam']
        };
        const list = authors[mood] || ['ai.persona'];
        return list[Math.floor(Math.random() * list.length)];
    }

    // ============================================
    // FALLBACK AI - VARIASI PANJANG 7,18,27,36
    // ============================================
    function generateFallbackAI() {
        console.log('[SpillGen] 📝 Generate fallback AI with varied lengths');
        
        const aiSpills = [
            // 7 KATA (pendek)
            { author: 'beby.manis', mood: 'surviving', 
              content: 'deadline skripsi makin deket, anxiety naik turun 😮‍💨' },
            { author: 'agak.koplak', mood: 'chaotic', 
              content: 'client minta revisi jam 11 malem, this is fine 🔥' },
            { author: 'satria.bajahitam', mood: 'doom', 
              content: 'motor mogok, dompet tipis, triple combo 🫠' },
            
            // 18 KATA (medium)
            { author: 'pretty.sad', mood: 'doom', 
              content: 'HR minta masuk sabtu minggu, mau resign tapi tabungan tinggal 200rb. bingung jadinya 😭' },
            { author: 'strawberry.shortcake', mood: 'thriving', 
              content: 'akhirnya dapet panggilan interview setelah ngelamar 50+ tempat, semoga lancar ya Allah ✨' },
            { author: 'chili.padi', mood: 'thriving', 
              content: 'orderan sneakers laku 15 pasang hari ini, rezeki anak soleh kata emak 💰😎' },
            
            // 27 KATA (panjang)
            { author: 'bang.juned', mood: 'surviving', 
              content: 'skripsi bab 3 masih error, dosen pembimbing ga bales chat seminggu, padahal deadline sidang tinggal 2 bulan. pengen mundur tapi udah di depan mata 🥲' },
            { author: 'little.fairy', mood: 'chaotic', 
              content: 'ortu ngomel terus disuruh kuliah, tapi gue dapet project freelance 5 juta. antara nurutin ortu atau ngejar cuan, bingung sumpah 🌀' },
            
            // 36 KATA (sangat panjang)
            { author: 'sejuta.badai', mood: 'chaotic', 
              content: 'minggu pagi jam 3, ga bisa tidur karena overthinking masa depan. buka IG liat temen pada nikah, beli rumah, punya mobil, sementara gue masih struggle with skripsi dan dompet tipis. maybe this is my villain arc idk 🛌💔' }
        ];
        
        const now = Date.now();
        return aiSpills.map((spill, i) => ({
            ...spill,
            id: `fallback_ai_${i}`,
            timestamp: now - (i * 1800000),
            reactions: { skull: 5 + i, cry: 10 + i, fire: 3 + i, upside: 2 + i },
            type: 'ai',
            userReacted: null
        }));
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
            const aiEntries = await fetchAIEntries();
            
            // Filter by mood
            let filtered = aiEntries;
            if (activeMood !== 'all') {
                filtered = aiEntries.filter(s => s.mood === activeMood);
            }
            
            // Take only target amount
            spillPool = filtered.slice(0, CONFIG.FEED_TARGET);
            
            // Render
            renderSpills(aiEntries.length);
            
        } catch (error) {
            console.error('[SpillGen] Error:', error);
            const fallback = generateFallbackAI();
            spillPool = fallback.slice(0, CONFIG.FEED_TARGET);
            renderSpills(fallback.length);
        } finally {
            isLoading = false;
        }
    }

    // ============================================
    // RENDER SPILLS
    // ============================================
    function renderSpills(totalAI = 0) {
        const container = document.getElementById('spillsList');
        if (!container) return;
        
        // Update meta
        const metaEl = document.getElementById('feedMeta');
        if (metaEl) {
            metaEl.textContent = `${spillPool.length} (🤖${spillPool.length})`;
        }
        
        if (spillPool.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">🍃</span>
                    <div class="empty-title">BELUM ADA SPILL</div>
                    <div class="empty-text">Generate AI entries dulu di console</div>
                </div>`;
            return;
        }
        
        let html = '';
        for (let s of spillPool) {
            // Count words untuk debugging
            const wordCount = s.content.split(' ').length;
            
            html += `<div class="spill-card">
                <div class="spill-head">
                    <span class="spill-user">🤖 @${escapeHtml(s.author)} <span style="color:var(--txm); font-size:8px;">${wordCount} kata</span></span>
                    <span class="spill-mood ${s.mood}">${s.mood}</span>
                </div>
                <div class="spill-body">${escapeHtml(s.content)}</div>
                <div class="spill-actions">
                    ${renderReactions(s)}
                </div>
            </div>`;
        }
        
        container.innerHTML = html;
        
        // Kasih notifikasi kalo pake fallback
        if (totalAI === 0) {
            const notice = document.createElement('div');
            notice.style.padding = '10px';
            notice.style.textAlign = 'center';
            notice.style.fontSize = '11px';
            notice.style.color = 'var(--as)';
            notice.style.marginTop = '10px';
            notice.innerHTML = '⚠️ Mode offline - AI entries dari fallback';
            container.appendChild(notice);
        }
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
        
        // Update ke Supabase (kalo ada koneksi)
        if (supabaseClient && spill.dbId && !spill.id.startsWith('fallback')) {
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
        
       
