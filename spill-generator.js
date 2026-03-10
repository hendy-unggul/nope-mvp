// ============================================
// spill-generator.js - POOL 50, JENDELA 8, LOOP
// ============================================

(function() {
    'use strict';
    
    const CONFIG = {
        POOL_SIZE: 50,          // 50 entries di pool
        WINDOW_SIZE: 8,          // 8 entries tampil
        BREW_INTERVAL: 240000,   // 4 menit
        LOOP_AFTER: 50           // loop setelah 50
    };

    let fullPool = [];           // 50 entries
    let windowStart = 0;          // posisi jendela (0-49)
    let activeMood = 'all';
    let isLoading = false;
    let nextId = 1;

    // ============================================
    // INITIAL POOL - 50 ENTRIES
    // ============================================
    const INITIAL_SPILLS = [
        // 50 entries dengan variasi author, mood, content
        { id: 'spill_001', author: 'beby.manis', mood: 'surviving', content: 'deadline skripsi makin deket, anxiety naik turun 😮‍💨', timestamp: Date.now() - 5000000, reactions: { skull:12, cry:23, fire:5, upside:3 } },
        { id: 'spill_002', author: 'agak.koplak', mood: 'chaotic', content: 'client minta revisi jam 11 malem, this is fine 🔥', timestamp: Date.now() - 4900000, reactions: { skull:18, cry:31, fire:9, upside:7 } },
        { id: 'spill_003', author: 'satria.bajahitam', mood: 'doom', content: 'motor mogok, dompet tipis, pacar ngambek. triple combo 🫠', timestamp: Date.now() - 4800000, reactions: { skull:22, cry:35, fire:1, upside:14 } },
        { id: 'spill_004', author: 'pretty.sad', mood: 'doom', content: 'HR minta masuk sabtu minggu, mau resign tapi tabungan tinggal 200rb. bingung jadinya 😭', timestamp: Date.now() - 4700000, reactions: { skull:25, cry:42, fire:3, upside:12 } },
        { id: 'spill_005', author: 'strawberry.shortcake', mood: 'thriving', content: 'akhirnya dapet panggilan interview setelah ngelamar 50+ tempat, semoga lancar ya Allah ✨', timestamp: Date.now() - 4600000, reactions: { skull:3, cry:8, fire:45, upside:12 } },
        { id: 'spill_006', author: 'chili.padi', mood: 'thriving', content: 'orderan sneakers laku 15 pasang hari ini, rezeki lancar 💰😎', timestamp: Date.now() - 4500000, reactions: { skull:2, cry:4, fire:38, upside:9 } },
        { id: 'spill_007', author: 'bang.juned', mood: 'surviving', content: 'skripsi bab 3 masih error, dosen pembimbing ga bales chat seminggu, padahal deadline sidang tinggal 2 bulan. pengen mundur tapi udah di depan mata 🥲', timestamp: Date.now() - 4400000, reactions: { skull:15, cry:28, fire:2, upside:8 } },
        { id: 'spill_008', author: 'little.fairy', mood: 'chaotic', content: 'ortu ngomel terus disuruh kuliah, tapi gue dapet project freelance 5 juta. antara nurutin ortu atau ngejar cuan, bingung sumpah 🌀', timestamp: Date.now() - 4300000, reactions: { skull:9, cry:15, fire:7, upside:18 } },
        { id: 'spill_009', author: 'sejuta.badai', mood: 'chaotic', content: 'minggu pagi jam 3, ga bisa tidur karena overthinking masa depan. buka IG liat temen pada nikah, beli rumah, punya mobil, sementara gue masih struggle with skripsi dan dompet tipis. maybe this is my villain arc idk 🛌💔', timestamp: Date.now() - 4200000, reactions: { skull:30, cry:45, fire:8, upside:20 } },
        { id: 'spill_010', author: 'beby.manis', mood: 'chaotic', content: 'hari ini nangis karena liat mantan bahagia, padahal udah move on 3 bulan', timestamp: Date.now() - 4100000, reactions: { skull:15, cry:30, fire:2, upside:5 } },
        { id: 'spill_011', author: 'agak.koplak', mood: 'thriving', content: 'akhirnya konten viral juga setelah setahun bikin TikTok', timestamp: Date.now() - 4000000, reactions: { skull:5, cry:2, fire:60, upside:15 } },
        { id: 'spill_012', author: 'pretty.sad', mood: 'surviving', content: 'hari ini selamat dari meeting tanpa dimarahin boss, progress dikit', timestamp: Date.now() - 3900000, reactions: { skull:8, cry:12, fire:15, upside:7 } },
        { id: 'spill_013', author: 'bang.juned', mood: 'doom', content: 'skripsi bab 4 error, debugging dari pagi ga ketemu', timestamp: Date.now() - 3800000, reactions: { skull:25, cry:30, fire:1, upside:3 } },
        { id: 'spill_014', author: 'strawberry.shortcake', mood: 'surviving', content: 'interview hari ini, semoga lolos ya Allah', timestamp: Date.now() - 3700000, reactions: { skull:2, cry:5, fire:20, upside:8 } },
        { id: 'spill_015', author: 'chili.padi', mood: 'chaotic', content: 'orderan batal, buyer ngilang. rugi waktu', timestamp: Date.now() - 3600000, reactions: { skull:20, cry:25, fire:2, upside:1 } },
        { id: 'spill_016', author: 'little.fairy', mood: 'thriving', content: 'project freelance selesai, dapet bonus', timestamp: Date.now() - 3500000, reactions: { skull:1, cry:3, fire:35, upside:10 } },
        { id: 'spill_017', author: 'sejuta.badai', mood: 'surviving', content: 'lagu baru dirilis, cuma didenger 50 orang', timestamp: Date.now() - 3400000, reactions: { skull:10, cry:15, fire:8, upside:5 } },
        { id: 'spill_018', author: 'satria.bajahitam', mood: 'thriving', content: 'orderan bengkel rame, cuan lumayan', timestamp: Date.now() - 3300000, reactions: { skull:3, cry:2, fire:28, upside:7 } },
        { id: 'spill_019', author: 'beby.manis', mood: 'doom', content: 'skripsi revisi, dosen nyuruh ganti tema', timestamp: Date.now() - 3200000, reactions: { skull:35, cry:40, fire:1, upside:2 } },
        { id: 'spill_020', author: 'agak.koplak', mood: 'chaotic', content: 'boss minta kerja lembur tapi gaji masih sama, bodo amat ah', timestamp: Date.now() - 3100000, reactions: { skull:22, cry:15, fire:8, upside:12 } },
        { id: 'spill_021', author: 'pretty.sad', mood: 'thriving', content: 'kerjaan kelar, weekend healing', timestamp: Date.now() - 3000000, reactions: { skull:2, cry:5, fire:30, upside:15 } },
        { id: 'spill_022', author: 'bang.juned', mood: 'chaotic', content: 'coding error, minta tolong temen', timestamp: Date.now() - 2900000, reactions: { skull:12, cry:18, fire:5, upside:8 } },
        { id: 'spill_023', author: 'strawberry.shortcake', mood: 'doom', content: 'interview ditolak lagi, ke-51 kalinya', timestamp: Date.now() - 2800000, reactions: { skull:30, cry:45, fire:1, upside:4 } },
        { id: 'spill_024', author: 'chili.padi', mood: 'surviving', content: 'modal habis, orderan sepi', timestamp: Date.now() - 2700000, reactions: { skull:25, cry:30, fire:2, upside:3 } },
        { id: 'spill_025', author: 'little.fairy', mood: 'doom', content: 'client kabur ga bayar', timestamp: Date.now() - 2600000, reactions: { skull:28, cry:35, fire:1, upside:2 } },
        { id: 'spill_026', author: 'sejuta.badai', mood: 'thriving', content: 'gig kecil-kecilan, lumayan buat makan', timestamp: Date.now() - 2500000, reactions: { skull:5, cry:8, fire:20, upside:12 } },
        { id: 'spill_027', author: 'satria.bajahitam', mood: 'chaotic', content: 'pelanggan komplain, harus garansi', timestamp: Date.now() - 2400000, reactions: { skull:18, cry:22, fire:3, upside:6 } },
        { id: 'spill_028', author: 'beby.manis', mood: 'thriving', content: 'alhamdulillah skripsi ACC, sidang bulan depan', timestamp: Date.now() - 2300000, reactions: { skull:2, cry:5, fire:42, upside:15 } },
        { id: 'spill_029', author: 'agak.koplak', mood: 'surviving', content: 'kerjaan numpuk, deadline mepet, bawaannya pengen resign', timestamp: Date.now() - 2200000, reactions: { skull:25, cry:30, fire:2, upside:5 } },
        { id: 'spill_030', author: 'pretty.sad', mood: 'chaotic', content: 'lagi fase bucin, padahal baru kenal seminggu. gila bener', timestamp: Date.now() - 2100000, reactions: { skull:15, cry:20, fire:5, upside:12 } },
        { id: 'spill_031', author: 'bang.juned', mood: 'thriving', content: 'akhirnya sidang, nilai A alhamdulillah', timestamp: Date.now() - 2000000, reactions: { skull:1, cry:2, fire:55, upside:20 } },
        { id: 'spill_032', author: 'strawberry.shortcake', mood: 'chaotic', content: 'pacar ngambek karena lupa beli kado anniversary', timestamp: Date.now() - 1900000, reactions: { skull:15, cry:25, fire:3, upside:8 } },
        { id: 'spill_033', author: 'chili.padi', mood: 'doom', content: 'orderan sepi, modal habis, galau', timestamp: Date.now() - 1800000, reactions: { skull:30, cry:35, fire:1, upside:2 } },
        { id: 'spill_034', author: 'little.fairy', mood: 'surviving', content: 'client baru minta revisi, lagi-lagi deadline', timestamp: Date.now() - 1700000, reactions: { skull:12, cry:18, fire:5, upside:7 } },
        { id: 'spill_035', author: 'sejuta.badai', mood: 'chaotic', content: 'inspirasi lagu dateng pas mau tidur, harus bangun buat nulis', timestamp: Date.now() - 1600000, reactions: { skull:8, cry:5, fire:25, upside:10 } },
        { id: 'spill_036', author: 'satria.bajahitam', mood: 'surviving', content: 'bengkel lagi sepi, mikir buka usaha sampingan', timestamp: Date.now() - 1500000, reactions: { skull:10, cry:12, fire:15, upside:8 } },
        { id: 'spill_037', author: 'beby.manis', mood: 'chaotic', content: 'bentar lagi sidang, deg-degan campur bahagia', timestamp: Date.now() - 1400000, reactions: { skull:8, cry:12, fire:25, upside:10 } },
        { id: 'spill_038', author: 'agak.koplak', mood: 'thriving', content: 'promosi jabatan, gaji naik 30%', timestamp: Date.now() - 1300000, reactions: { skull:1, cry:2, fire:65, upside:18 } },
        { id: 'spill_039', author: 'pretty.sad', mood: 'doom', content: 'ditolak investor lagi, usaha hampir bangkrut', timestamp: Date.now() - 1200000, reactions: { skull:35, cry:45, fire:1, upside:3 } },
        { id: 'spill_040', author: 'bang.juned', mood: 'chaotic', content: 'ngoding seharian, error masih banyak', timestamp: Date.now() - 1100000, reactions: { skull:20, cry:25, fire:5, upside:5 } },
        { id: 'spill_041', author: 'strawberry.shortcake', mood: 'surviving', content: 'kerjaan numpuk, pengen cuti tapi ga enak', timestamp: Date.now() - 1000000, reactions: { skull:15, cry:20, fire:8, upside:10 } },
        { id: 'spill_042', author: 'chili.padi', mood: 'thriving', content: 'buka cabang baru, orderan makin banyak', timestamp: Date.now() - 900000, reactions: { skull:2, cry:3, fire:45, upside:12 } },
        { id: 'spill_043', author: 'little.fairy', mood: 'doom', content: 'project deadline besok, client minta revisi', timestamp: Date.now() - 800000, reactions: { skull:28, cry:30, fire:2, upside:4 } },
        { id: 'spill_044', author: 'sejuta.badai', mood: 'surviving', content: 'gig malem minggu, sepi pengunjung', timestamp: Date.now() - 700000, reactions: { skull:12, cry:15, fire:8, upside:7 } },
        { id: 'spill_045', author: 'satria.bajahitam', mood: 'chaotic', content: 'bengkel rame, tapi banyak komplain', timestamp: Date.now() - 600000, reactions: { skull:18, cry:20, fire:5, upside:8 } },
        { id: 'spill_046', author: 'beby.manis', mood: 'thriving', content: 'sidang kelar, lulus!', timestamp: Date.now() - 500000, reactions: { skull:0, cry:10, fire:70, upside:25 } },
        { id: 'spill_047', author: 'agak.koplak', mood: 'doom', content: 'tiktok kena shadowban, engagement turun drastis', timestamp: Date.now() - 400000, reactions: { skull:30, cry:35, fire:2, upside:5 } },
        { id: 'spill_048', author: 'pretty.sad', mood: 'thriving', content: 'dapet investor baru, bisnis selamat', timestamp: Date.now() - 300000, reactions: { skull:1, cry:3, fire:50, upside:15 } },
        { id: 'spill_049', author: 'bang.juned', mood: 'chaotic', content: 'coding error, stress, tapi akhirnya nemu solusi', timestamp: Date.now() - 200000, reactions: { skull:15, cry:18, fire:12, upside:10 } },
        { id: 'spill_050', author: 'strawberry.shortcake', mood: 'surviving', content: 'akhirnya dapet kerja, tapi gaji kecil', timestamp: Date.now() - 100000, reactions: { skull:8, cry:12, fire:20, upside:8 } }
    ];

    // ============================================
    // INIT - SETUP POOL 50
    // ============================================
    function init() {
        console.log('[SpillGen] 🚀 Initializing pool 50, window 8...');
        
        // Urutin berdasarkan timestamp (terbaru dulu)
        fullPool = [...INITIAL_SPILLS].sort((a, b) => b.timestamp - a.timestamp);
        nextId = 51;
        
        // Mulai dari jendela pertama (1-8)
        windowStart = 0;
        
        renderSpills();
        
        // Entries baru setiap 4 menit
        setInterval(() => {
            addNewEntry();
        }, CONFIG.BREW_INTERVAL);
    }

    // ============================================
    // SEDUH TEH BARU = GESER JENDELA 1 LANGKAH
    // ============================================
    function seduhTehBaru() {
        console.log('[SpillGen] 🍵 Seduh: geser jendela ke bawah...');
        
        // Geser jendela 1 langkah
        windowStart = (windowStart + 1) % CONFIG.POOL_SIZE;
        
        renderSpills();
        
        // Log posisi jendela
        const endPos = windowStart + CONFIG.WINDOW_SIZE - 1;
        const displayEnd = endPos >= CONFIG.POOL_SIZE ? endPos - CONFIG.POOL_SIZE + 1 : endPos + 1;
        console.log(`[SpillGen] 📍 Jendela: ${windowStart+1}-${displayEnd}`);
    }

    // ============================================
    // SEDUH KE ATAS (OPTIONAL)
    // ============================================
    function seduhKeAtas() {
        console.log('[SpillGen] ⬆️ Seduh: geser jendela ke atas...');
        
        windowStart = windowStart - 1;
        if (windowStart < 0) {
            windowStart = CONFIG.POOL_SIZE - 1;
        }
        
        renderSpills();
        
        const endPos = windowStart + CONFIG.WINDOW_SIZE - 1;
        const displayEnd = endPos >= CONFIG.POOL_SIZE ? endPos - CONFIG.POOL_SIZE + 1 : endPos + 1;
        console.log(`[SpillGen] 📍 Jendela: ${windowStart+1}-${displayEnd}`);
    }

    // ============================================
    // TAMBAH ENTRIES BARU (SETIAP 4 MENIT)
    // ============================================
    async function addNewEntry() {
        console.log('[SpillGen] 🆕 Menambah entries baru ke pool...');
        
        try {
            // Coba ambil dari API
            const response = await fetch('/api/brew', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ count: 1 })
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.spills && data.spills.length > 0) {
                    const newSpill = {
                        id: `spill_${nextId++}`,
                        author: data.spills[0].author,
                        mood: data.spills[0].mood,
                        content: data.spills[0].content,
                        timestamp: Date.now(),
                        reactions: data.spills[0].reactions || {
                            skull: Math.floor(Math.random() * 20) + 5,
                            cry: Math.floor(Math.random() * 30) + 10,
                            fire: Math.floor(Math.random() * 15) + 2,
                            upside: Math.floor(Math.random() * 10) + 1
                        }
                    };
                    
                    // FIFO: tambah di depan, buang yang paling lama (index 49)
                    fullPool = [newSpill, ...fullPool.slice(0, CONFIG.POOL_SIZE - 1)];
                    
                    console.log(`[SpillGen] ✅ Entries baru ditambahkan. Pool: ${fullPool.length}`);
                    renderSpills();
                    return;
                }
            }
            
            // Fallback offline
            addOfflineEntry();
            
        } catch (error) {
            console.warn('[SpillGen] Gagal ambil dari API, pakai offline');
            addOfflineEntry();
        }
    }

    // ============================================
    // TAMBAH ENTRIES OFFLINE (FALLBACK)
    // ============================================
    function addOfflineEntry() {
        const authors = ['beby.manis', 'agak.koplak', 'pretty.sad', 'bang.juned', 
                         'strawberry.shortcake', 'chili.padi', 'little.fairy', 'sejuta.badai', 'satria.bajahitam'];
        const moods = ['surviving', 'thriving', 'chaotic', 'doom'];
        const templates = [
            'capek banget hari ini, {mood} mode on 😮‍💨',
            'lagi fase {mood}, gatau harus gimana',
            'hari ini {mood}, semoga besok better',
            'pengen cerita tapi bingung mulai dari mana',
            'deadline makin deket, mental makin chaos',
            'stress ngerjain {mood}, butuh healing',
            'hidup lagi {mood}, semoga cepet reda'
        ];
        
        const author = authors[Math.floor(Math.random() * authors.length)];
        const mood = moods[Math.floor(Math.random() * moods.length)];
        const template = templates[Math.floor(Math.random() * templates.length)];
        const content = template.replace('{mood}', mood);
        
        const newSpill = {
            id: `offline_${nextId++}`,
            author: author,
            mood: mood,
            content: content,
            timestamp: Date.now(),
            reactions: {
                skull: Math.floor(Math.random() * 10) + 2,
                cry: Math.floor(Math.random() * 15) + 5,
                fire: Math.floor(Math.random() * 8) + 1,
                upside: Math.floor(Math.random() * 5) + 1
            }
        };
        
        // FIFO: tambah di depan, buang yang paling lama
        fullPool = [newSpill, ...fullPool.slice(0, CONFIG.POOL_SIZE - 1)];
        
        console.log(`[SpillGen] 📝 Offline entry added. Pool: ${fullPool.length}`);
        renderSpills();
    }

    // ============================================
    // RENDER SPILLS (BERDASARKAN POSISI JENDELA)
    // ============================================
    function renderSpills() {
        const container = document.getElementById('spillsList');
        if (!container) return;
        
        // Ambil 8 entries berdasarkan posisi jendela (dengan loop)
        let windowSpills = [];
        for (let i = 0; i < CONFIG.WINDOW_SIZE; i++) {
            const index = (windowStart + i) % CONFIG.POOL_SIZE;
            windowSpills.push(fullPool[index]);
        }
        
        // Filter mood (opsional)
        let toShow = windowSpills;
        if (activeMood !== 'all') {
            toShow = windowSpills.filter(s => s.mood === activeMood);
            if (toShow.length === 0) {
                toShow = windowSpills; // fallback
            }
        }
        
        // Update meta
        const metaEl = document.getElementById('feedMeta');
        if (metaEl) {
            const endPos = windowStart + CONFIG.WINDOW_SIZE - 1;
            const displayEnd = endPos >= CONFIG.POOL_SIZE ? endPos - CONFIG.POOL_SIZE + 1 : endPos + 1;
            metaEl.textContent = `Jendela ${windowStart+1}-${displayEnd} dari ${CONFIG.POOL_SIZE}`;
        }
        
        // Render HTML
        let html = '';
        for (let s of toShow) {
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
        const spill = fullPool.find(s => s.id === spillId);
        if (!spill) return;
        
        spill.reactions[reactionType] = (spill.reactions[reactionType] || 0) + 1;
        renderSpills();
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
    // EXPOSE KE WINDOW
    // ============================================
    window.initSpillGenerator = init;
    window.seduhTehBaru = seduhTehBaru;
    window.seduhKeAtas = seduhKeAtas;
    window.filterMood = filterMood;
    window.getPool = () => fullPool;
    window.getWindowStart = () => windowStart;

    // Auto start
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(init, 1000));
    } else {
        setTimeout(init, 1000);
    }

})();
