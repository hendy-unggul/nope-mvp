// ============================================
// spill-generator.js - FINAL PROVEN VERSION
// WITH VARIED LENGTHS: 7, 18, 27, 36 KATA
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
    let supabaseClient = null;

    // ============================================
    // AI SPILLS DATABASE - VARIED LENGTHS
    // ============================================
    const AI_SPILLS = [
        // ===== 7-10 KATA (PENDEK) =====
        { 
            author: 'beby.manis', 
            mood: 'surviving', 
            content: 'deadline skripsi makin deket, anxiety naik turun 😮‍💨',
            words: 7,
            reactions: { skull: 12, cry: 23, fire: 5, upside: 3 }
        },
        { 
            author: 'agak.koplak', 
            mood: 'chaotic', 
            content: 'client minta revisi jam 11 malem, this is fine 🔥',
            words: 10,
            reactions: { skull: 18, cry: 31, fire: 9, upside: 7 }
        },
        { 
            author: 'satria.bajahitam', 
            mood: 'doom', 
            content: 'motor mogok, dompet tipis, pacar ngambek. triple combo 🫠',
            words: 9,
            reactions: { skull: 22, cry: 35, fire: 1, upside: 14 }
        },
        
        // ===== 15-20 KATA (MEDIUM) =====
        { 
            author: 'pretty.sad', 
            mood: 'doom', 
            content: 'HR minta masuk sabtu minggu, mau resign tapi tabungan tinggal 200rb. bingung jadinya 😭',
            words: 16,
            reactions: { skull: 25, cry: 42, fire: 3, upside: 12 }
        },
        { 
            author: 'strawberry.shortcake', 
            mood: 'thriving', 
            content: 'akhirnya dapet panggilan interview setelah ngelamar 50+ tempat, semoga lancar ya Allah ✨',
            words: 14,
            reactions: { skull: 3, cry: 8, fire: 45, upside: 12 }
        },
        { 
            author: 'chili.padi', 
            mood: 'thriving', 
            content: 'orderan sneakers laku 15 pasang hari ini, rezeki anak soleh kata emak 💰😎',
            words: 15,
            reactions: { skull: 2, cry: 4, fire: 38, upside: 9 }
        },
        
        // ===== 25-30 KATA (PANJANG) =====
        { 
            author: 'bang.juned', 
            mood: 'surviving', 
            content: 'skripsi bab 3 masih error, dosen pembimbing ga bales chat seminggu, padahal deadline sidang tinggal 2 bulan. pengen mundur tapi udah di depan mata 🥲',
            words: 28,
            reactions: { skull: 15, cry: 28, fire: 2, upside: 8 }
        },
        { 
            author: 'little.fairy', 
            mood: 'chaotic', 
            content: 'ortu ngomel terus disuruh kuliah, tapi gue dapet project freelance 5 juta. antara nurutin ortu atau ngejar cuan, bingung sumpah 🌀',
            words: 24,
            reactions: { skull: 9, cry: 15, fire: 7, upside: 18 }
        },
        
        // ===== 35-40 KATA (SANGAT PANJANG) =====
        { 
            author: 'sejuta.badai', 
            mood: 'chaotic', 
            content: 'minggu pagi jam 3, ga bisa tidur karena overthinking masa depan. buka IG liat temen pada nikah, beli rumah, punya mobil, sementara gue masih struggle with skripsi dan dompet tipis. maybe this is my villain arc idk 🛌💔',
            words: 38,
            reactions: { skull: 30, cry: 45, fire: 8, upside: 20 }
        }
    ];

    // ============================================
    // INIT SUPABASE (OPTIONAL, UNTUK FUTURE USE)
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
            console.warn('[SpillGen] ⚠️ Supabase init error:', e);
            return false;
        }
    }

    // ============================================
    // GET AI ENTRIES (LANGSUNG DARI MEMORY)
    // ============================================
    function getAIEntries() {
        // Randomize urutan biar ga monoton
        const shuffled = [...AI_SPILLS].sort(() => Math.random() - 0.5);
        return shuffled;
    }

    // ============================================
    // REFRESH FEED
    // ============================================
    function refreshFeed() {
        if (isLoading) {
            console.log('[SpillGen] ⏳ Masih loading...');
            return;
        }
        
        isLoading = true;
        console.log('[SpillGen] 🔄 Refresh feed...');
        
        try {
            // Ambil AI entries
            let entries = getAIEntries();
            
            // Filter by mood
            if (activeMood !== 'all') {
                entries = entries.filter(s => s.mood === activeMood);
            }
            
            // Ambil 8 entries untuk feed
            spillPool = entries.slice(0, CONFIG.FEED_TARGET);
            
            // Render
            renderSpills();
            
        } catch (error) {
            console.error('[SpillGen] Error:', error);
        } finally {
            isLoading = false;
        }
    }

    // ============================================
// RENDER SPILLS - HIDE WORD COUNTER
// ============================================
function renderSpills() {
    const container = document.getElementById('spillsList');
    if (!container) return;
    
    if (spillPool.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">🍃</span>
                <div class="empty-title">BELUM ADA SPILL</div>
            </div>`;
        return;
    }
    
    // Hitung statistik panjang (untuk meta aja, ga ditampilkan ke user)
    const wordGroups = spillPool.map(s => {
        if (s.words <= 10) return '7';
        if (s.words <= 20) return '18';
        if (s.words <= 30) return '27';
        return '36';
    });
    const stats = [...new Set(wordGroups)].sort().join(' | ');
    
    // Update meta (masih perlu buat dev, tapi ga terlalu mencolok)
    const metaEl = document.getElementById('feedMeta');
    if (metaEl) {
        metaEl.textContent = `${spillPool.length}`; // Hanya jumlah, tanpa stats
        metaEl.style.opacity = '0.6'; // Buat lebih subtle
    }
    
    let html = '';
    for (let s of spillPool) {
        html += `<div class="spill-card">
            <div class="spill-head">
                <span class="spill-user">
                    🤖 @${s.author}
                </span>
                <span class="spill-mood ${s.mood}">${s.mood}</span>
            </div>
            <div class="spill-body">${escapeHtml(s.content)}</div>
            <div class="spill-actions">
                <button class="react-btn" onclick="window.reactToSpill('${s.author}', 'skull')">
                    💀 <span class="react-count">${s.reactions.skull}</span>
                </button>
                <button class="react-btn" onclick="window.reactToSpill('${s.author}', 'cry')">
                    😭 <span class="react-count">${s.reactions.cry}</span>
                </button>
                <button class="react-btn" onclick="window.reactToSpill('${s.author}', 'fire')">
                    🔥 <span class="react-count">${s.reactions.fire}</span>
                </button>
                <button class="react-btn" onclick="window.reactToSpill('${s.author}', 'upside')">
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
    window.reactToSpill = function(author, reactionType) {
        console.log(`💬 React ${reactionType} to ${author}`);
        // Bisa ditambah logic untuk update reactions nanti
    };

    // ============================================
    // FILTER MOOD
    // ============================================
    function filterMood(mood) {
        activeMood = mood;
        
        // Update UI chips
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
        console.log('[SpillGen] 🚀 Initializing with proven AI entries...');
        initSupabase(); // Optional
        refreshFeed();
        setInterval(refreshFeed, CONFIG.REFRESH_INTERVAL);
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
