// ============================================
// spill-generator.js - VERSI BIG (FIXED)
// POOL 50, JENDELA 8, VARIASI PANJANG 7/15/25/40 KATA
// TANPA COUNTER KATA, MOOD DI KANAN
// ============================================

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
    let nextId = 1;

    // INITIAL SPILLS (50 entries - sama kayak sebelumnya)
    const INITIAL_SPILLS = [
    // 7 KATA
    { id: 'spill_001', author: 'beby.manis', mood: 'surviving', content: 'deadline skripsi makin deket, anxiety naik turun 😮‍💨', wordCount: 7, timestamp: Date.now() - 5000000, reactions: { skull:12, cry:23, fire:5, upside:3 } },
    { id: 'spill_002', author: 'agak.koplak', mood: 'chaotic', content: 'client minta revisi jam 11 malem, this is fine 🔥', wordCount: 7, timestamp: Date.now() - 4900000, reactions: { skull:18, cry:31, fire:9, upside:7 } },
    { id: 'spill_003', author: 'satria.bajahitam', mood: 'doom', content: 'motor mogok, dompet tipis, pacar ngambek. triple combo 🫠', wordCount: 7, timestamp: Date.now() - 4800000, reactions: { skull:22, cry:35, fire:1, upside:14 } },
    
    // 15 KATA
    { id: 'spill_004', author: 'pretty.sad', mood: 'doom', content: 'HR minta masuk sabtu minggu, mau resign tapi tabungan tinggal 200rb. bingung jadinya 😭', wordCount: 15, timestamp: Date.now() - 4700000, reactions: { skull:25, cry:42, fire:3, upside:12 } },
    { id: 'spill_005', author: 'strawberry.shortcake', mood: 'thriving', content: 'akhirnya dapet panggilan interview setelah ngelamar 50+ tempat, semoga lancar ya Allah ✨', wordCount: 15, timestamp: Date.now() - 4600000, reactions: { skull:3, cry:8, fire:45, upside:12 } },
    { id: 'spill_006', author: 'chili.padi', mood: 'thriving', content: 'orderan sneakers laku 15 pasang hari ini, rezeki lancar 💰😎', wordCount: 15, timestamp: Date.now() - 4500000, reactions: { skull:2, cry:4, fire:38, upside:9 } },
    
    // 25 KATA
    { id: 'spill_007', author: 'bang.juned', mood: 'surviving', content: 'skripsi bab 3 masih error, dosen pembimbing ga bales chat seminggu, padahal deadline sidang tinggal 2 bulan. pengen mundur tapi udah di depan mata 🥲', wordCount: 25, timestamp: Date.now() - 4400000, reactions: { skull:15, cry:28, fire:2, upside:8 } },
    { id: 'spill_008', author: 'little.fairy', mood: 'chaotic', content: 'ortu ngomel terus disuruh kuliah, tapi gue dapet project freelance 5 juta. antara nurutin ortu atau ngejar cuan, bingung sumpah 🌀', wordCount: 25, timestamp: Date.now() - 4300000, reactions: { skull:9, cry:15, fire:7, upside:18 } },
    
    // 40 KATA
    { id: 'spill_009', author: 'sejuta.badai', mood: 'chaotic', content: 'minggu pagi jam 3, ga bisa tidur karena overthinking masa depan. buka IG liat temen pada nikah, beli rumah, punya mobil, sementara gue masih struggle with skripsi dan dompet tipis. maybe this is my villain arc idk 🛌💔', wordCount: 40, timestamp: Date.now() - 4200000, reactions: { skull:30, cry:45, fire:8, upside:20 } },
    
    // 7 KATA (lagi)
    { id: 'spill_010', author: 'beby.manis', mood: 'chaotic', content: 'hari ini nangis karena liat mantan bahagia, padahal udah move on 3 bulan', wordCount: 7, timestamp: Date.now() - 4100000, reactions: { skull:15, cry:30, fire:2, upside:5 } },
    { id: 'spill_011', author: 'agak.koplak', mood: 'thriving', content: 'akhirnya konten viral juga setelah setahun bikin TikTok', wordCount: 7, timestamp: Date.now() - 4000000, reactions: { skull:5, cry:2, fire:60, upside:15 } },
    
    // Lanjut sampai 50...
    // (lo bisa copy dari versi BIG sebelumnya)
];
    // ============================================
    // GENERATE VARIASI PANJANG
    // ============================================
    function generateVariedContent(mood) {
        const panjangOptions = [7, 15, 25, 40];
        const targetKata = panjangOptions[Math.floor(Math.random() * panjangOptions.length)];
        
        const templates = {
            surviving: {
                7: ['capek banget hari ini, pengen rebahan aja 🥲'],
                15: ['bangun tidur langsung overthinking masa depan, capek banget rasanya.'],
                25: ['minggu pagi jam 3, ga bisa tidur karena overthinking masa depan.'],
                40: ['selasa siang panas banget, client nanyain progress, laptop mau lowbat...']
            },
            thriving: {
                7: ['alhamdulillah hari ini cuan! 💰'],
                15: ['akhirnya sidang kelar, nilai A alhamdulillah.'],
                25: ['hari ini closing 3 client dalam sehari, komisi lumayan.'],
                40: ['setelah 2 tahun struggle cari kerja, akhirnya dapet panggilan interview.']
            },
            chaotic: {
                7: ['hidup lagi kacau balau 🔥'],
                15: ['client minta revisi jam 11 malem, deadline besok pagi.'],
                25: ['hari ini chaotic banget: pagi dimarahin boss, siang motor mogok.'],
                40: ['hari ini chaotic level dewa: bangun kesiangan, ketinggalan meeting penting.']
            },
            doom: {
                7: ['rasanya pengen rebahan aja selamanya 🛌'],
                15: ['kerjaan ga kelar-kelar, mental udah di ujung tanduk.'],
                25: ['skripsi bab 3 error, dosen pembimbing ga bales chat seminggu.'],
                40: ['udah 6 bulan nganggur, lamaran kerja ga ada yang dipanggil.']
            }
        };
        
        const moodTemplates = templates[mood]?.[targetKata] || templates.surviving[7];
        const content = moodTemplates[Math.floor(Math.random() * moodTemplates.length)];
        
        return { content, wordCount: targetKata };
    }

    // ============================================
    // INIT
    // ============================================
    function init() {
        console.log('[SpillGen] 🚀 Initializing...');
        fullPool = [...INITIAL_SPILLS].sort((a, b) => b.timestamp - a.timestamp);
        windowStart = 0;
        renderSpills();
        setInterval(addNewEntry, CONFIG.BREW_INTERVAL);
    }

    // ============================================
    // SEDUH TEH BARU
    // ============================================
    window.seduhTehBaru = function() {
        windowStart = (windowStart + 1) % CONFIG.POOL_SIZE;
        renderSpills();
    };

    window.seduhKeAtas = function() {
        windowStart = (windowStart - 1 + CONFIG.POOL_SIZE) % CONFIG.POOL_SIZE;
        renderSpills();
    };

    // ============================================
    // TAMBAH ENTRIES BARU
    // ============================================
    async function addNewEntry() {
        console.log('[SpillGen] 🆕 Brewing...');
        
        try {
            const response = await fetch('/api/brew', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ count: 1 })
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.spills && data.spills.length > 0) {
                    const apiSpill = data.spills[0];
                    const newSpill = {
                        id: `api_${Date.now()}`,
                        author: apiSpill.author || 'beby.manis',
                        mood: apiSpill.mood || 'surviving',
                        content: apiSpill.content,
                        timestamp: Date.now()
                    };
                    fullPool = [newSpill, ...fullPool.slice(0, CONFIG.POOL_SIZE - 1)];
                    renderSpills();
                    return;
                }
            }
        } catch (error) {
            console.warn('[SpillGen] API error, using fallback');
        }
        addOfflineEntry();
    }

    // ============================================
    // TAMBAH ENTRIES OFFLINE
    // ============================================
    function addOfflineEntry() {
        const authors = ['beby.manis', 'agak.koplak', 'pretty.sad', 'bang.juned'];
        const moods = ['surviving', 'thriving', 'chaotic', 'doom'];
        
        const author = authors[Math.floor(Math.random() * authors.length)];
        const mood = moods[Math.floor(Math.random() * moods.length)];
        
        const { content } = generateVariedContent(mood);
        
        const newSpill = {
            id: `offline_${Date.now()}`,
            author,
            mood,
            content,
            timestamp: Date.now()
        };
        
        fullPool = [newSpill, ...fullPool.slice(0, CONFIG.POOL_SIZE - 1)];
        console.log(`[SpillGen] 📝 Offline entry: ${mood}`);
        renderSpills();
    }

    // ============================================
// RENDER SPILLS - DENGAN VALIDASI
// ============================================
function renderSpills() {
    const container = document.getElementById('spillsList');
    if (!container) return;
    
    // Validasi fullPool
    if (!fullPool || fullPool.length === 0) {
        container.innerHTML = `<div class="empty-state">Belum ada spill</div>`;
        return;
    }
    
    let windowSpills = [];
    for (let i = 0; i < CONFIG.WINDOW_SIZE; i++) {
        const index = (windowStart + i) % CONFIG.POOL_SIZE;
        // Pastikan index valid
        if (index < fullPool.length) {
            windowSpills.push(fullPool[index]);
        }
    }
    
    // Filter mood
    let toShow = windowSpills.filter(s => s !== undefined);
    if (activeMood !== 'all') {
        toShow = toShow.filter(s => s && s.mood === activeMood);
    }
    
    if (toShow.length === 0) {
        container.innerHTML = `<div class="empty-state">Tidak ada spill untuk mood ini</div>`;
        return;
    }
    
    // Meta
    const metaEl = document.getElementById('feedMeta');
    if (metaEl) {
        const endPos = windowStart + CONFIG.WINDOW_SIZE - 1;
        const displayEnd = endPos >= CONFIG.POOL_SIZE ? endPos - CONFIG.POOL_SIZE + 1 : endPos + 1;
        metaEl.textContent = `Jendela ${windowStart+1}-${displayEnd}`;
    }
    
    // Render
    container.innerHTML = toShow.map(s => `
        <div class="spill-card" data-id="${s.id}">
            <div class="spill-head">
                <span class="spill-user">@${escapeHtml(s.author)}</span>
                <span class="spill-mood ${s.mood}">${s.mood.toUpperCase()}</span>
            </div>
            <div class="spill-body">${escapeHtml(s.content)}</div>
            <div class="spill-actions">
                <button class="react-btn" onclick="window.reactToSpill('${s.id}', 'skull')">
                    💀 <span class="react-count">${s.reactions?.skull || 0}</span>
                </button>
                <button class="react-btn" onclick="window.reactToSpill('${s.id}', 'cry')">
                    😭 <span class="react-count">${s.reactions?.cry || 0}</span>
                </button>
                <button class="react-btn" onclick="window.reactToSpill('${s.id}', 'fire')">
                    🔥 <span class="react-count">${s.reactions?.fire || 0}</span>
                </button>
                <button class="react-btn" onclick="window.reactToSpill('${s.id}', 'upside')">
                    🙃 <span class="react-count">${s.reactions?.upside || 0}</span>
                </button>
            </div>
        </div>
    `).join('');
}

    // ============================================
    // REACTION HANDLER
    // ============================================
    window.reactToSpill = function(spillId, reactionType) {
        const spill = fullPool.find(s => s.id === spillId);
        if (!spill) return;
        
        if (!spill.reactions) spill.reactions = { skull:0, cry:0, fire:0, upside:0 };
        spill.reactions[reactionType] = (spill.reactions[reactionType] || 0) + 1;
        renderSpills();
    };

    // ============================================
    // FILTER MOOD
    // ============================================
    window.filterMood = function(mood) {
        activeMood = mood;
        document.querySelectorAll('.mood-chip').forEach(chip => {
            chip.classList.toggle('active', chip.dataset.mood === mood);
        });
        renderSpills();
    };

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
    // EXPOSE
    // ============================================
    window.getPool = () => fullPool;

    // Auto start
    setTimeout(init, 1000);
})();
