// ============================================
// spill-generator.js - PRODUCTION VERSION
// POOL 50, JENDELA 8, VARIASI PANJANG 7/15/25/40 KATA
// WITH ENHANCED ERROR HANDLING
// ============================================

(function() {
    'use strict';
    
    const CONFIG = {
        POOL_SIZE: 50,
        WINDOW_SIZE: 8,
        BREW_INTERVAL: 240000,
        LOOP_AFTER: 50
    };

    let fullPool = [];
    let windowStart = 0;
    let activeMood = 'all';
    let isLoading = false;
    let nextId = 1;

    // ============================================
    // INITIAL POOL - 50 ENTRIES VARIATIF
    // ============================================
    const INITIAL_SPILLS = [
        // 7 KATA
        { id: 'spill_001', author: 'beby.manis', mood: 'surviving', content: 'deadline skripsi makin deket, anxiety naik turun 😮‍💨', wordCount: 7, timestamp: Date.now() - 5000000, reactions: { skull:12, cry:23, fire:5, upside:3 } },
        { id: 'spill_002', author: 'agak.koplak', mood: 'chaotic', content: 'client minta revisi jam 11 malem, this is fine 🔥', wordCount: 9, timestamp: Date.now() - 4900000, reactions: { skull:18, cry:31, fire:9, upside:7 } },
        { id: 'spill_003', author: 'satria.bajahitam', mood: 'doom', content: 'motor mogok, dompet tipis, pacar ngambek. triple combo 🫠', wordCount: 9, timestamp: Date.now() - 4800000, reactions: { skull:22, cry:35, fire:1, upside:14 } },
        
        // 15 KATA
        { id: 'spill_004', author: 'pretty.sad', mood: 'doom', content: 'HR minta masuk sabtu minggu, mau resign tapi tabungan tinggal 200rb. bingung jadinya 😭', wordCount: 15, timestamp: Date.now() - 4700000, reactions: { skull:25, cry:42, fire:3, upside:12 } },
        { id: 'spill_005', author: 'strawberry.shortcake', mood: 'thriving', content: 'akhirnya dapet panggilan interview setelah ngelamar 50+ tempat, semoga lancar ya Allah ✨', wordCount: 13, timestamp: Date.now() - 4600000, reactions: { skull:3, cry:8, fire:45, upside:12 } },
        { id: 'spill_006', author: 'chili.padi', mood: 'thriving', content: 'orderan sneakers laku 15 pasang hari ini, rezeki lancar 💰😎', wordCount: 11, timestamp: Date.now() - 4500000, reactions: { skull:2, cry:4, fire:38, upside:9 } },
        
        // 25 KATA
        { id: 'spill_007', author: 'bang.juned', mood: 'surviving', content: 'skripsi bab 3 masih error, dosen pembimbing ga bales chat seminggu, padahal deadline sidang tinggal 2 bulan. pengen mundur tapi udah di depan mata 🥲', wordCount: 27, timestamp: Date.now() - 4400000, reactions: { skull:15, cry:28, fire:2, upside:8 } },
        { id: 'spill_008', author: 'little.fairy', mood: 'chaotic', content: 'ortu ngomel terus disuruh kuliah, tapi gue dapet project freelance 5 juta. antara nurutin ortu atau ngejar cuan, bingung sumpah 🌀', wordCount: 23, timestamp: Date.now() - 4300000, reactions: { skull:9, cry:15, fire:7, upside:18 } },
        
        // 40 KATA
        { id: 'spill_009', author: 'sejuta.badai', mood: 'chaotic', content: 'minggu pagi jam 3, ga bisa tidur karena overthinking masa depan. buka IG liat temen pada nikah, beli rumah, punya mobil, sementara gue masih struggle with skripsi dan dompet tipis. maybe this is my villain arc idk 🛌💔', wordCount: 42, timestamp: Date.now() - 4200000, reactions: { skull:30, cry:45, fire:8, upside:20 } },
        
        // 7 KATA (lagi)
        { id: 'spill_010', author: 'beby.manis', mood: 'chaotic', content: 'hari ini nangis karena liat mantan bahagia 💔', wordCount: 8, timestamp: Date.now() - 4100000, reactions: { skull:15, cry:30, fire:2, upside:5 } },
        { id: 'spill_011', author: 'agak.koplak', mood: 'thriving', content: 'akhirnya konten viral juga setelah setahun bikin TikTok', wordCount: 9, timestamp: Date.now() - 4000000, reactions: { skull:5, cry:2, fire:60, upside:15 } },
        
        // 15 KATA (lagi)
        { id: 'spill_012', author: 'pretty.sad', mood: 'surviving', content: 'hari ini selamat dari meeting tanpa dimarahin boss, progress dikit', wordCount: 11, timestamp: Date.now() - 3900000, reactions: { skull:8, cry:12, fire:15, upside:7 } },
        { id: 'spill_013', author: 'bang.juned', mood: 'doom', content: 'skripsi bab 4 error, debugging dari pagi ga ketemu', wordCount: 10, timestamp: Date.now() - 3800000, reactions: { skull:25, cry:30, fire:1, upside:3 } },
        
        // 25 KATA (lagi)
        { id: 'spill_014', author: 'strawberry.shortcake', mood: 'surviving', content: 'interview hari ini, semoga lolos ya Allah. udah 50x ngelamar, maybe this is the one', wordCount: 16, timestamp: Date.now() - 3700000, reactions: { skull:2, cry:5, fire:20, upside:8 } },
        { id: 'spill_015', author: 'chili.padi', mood: 'chaotic', content: 'orderan batal, buyer ngilang. rugi waktu dan modal. dagang emang keras', wordCount: 12, timestamp: Date.now() - 3600000, reactions: { skull:20, cry:25, fire:2, upside:1 } },
        
        // 40 KATA (lagi)
        { id: 'spill_016', author: 'little.fairy', mood: 'thriving', content: 'project freelance selesai, dapet bonus 3 juta. rasanya seneng banget bisa ngehasilin uang sendiri tanpa harus ngemis ke ortu. semoga terus berkah', wordCount: 25, timestamp: Date.now() - 3500000, reactions: { skull:1, cry:3, fire:35, upside:10 } },
        { id: 'spill_017', author: 'sejuta.badai', mood: 'surviving', content: 'lagu baru dirilis, cuma didenger 50 orang. sedih sih tapi gapapa, yang penting berkarya. siapa tau next time bisa viral', wordCount: 21, timestamp: Date.now() - 3400000, reactions: { skull:10, cry:15, fire:8, upside:5 } },
        
        // Lanjut sampai 50
        { id: 'spill_018', author: 'satria.bajahitam', mood: 'thriving', content: 'orderan bengkel rame, cuan lumayan buat bulan ini', wordCount: 9, timestamp: Date.now() - 3300000, reactions: { skull:3, cry:2, fire:28, upside:7 } },
        { id: 'spill_019', author: 'beby.manis', mood: 'doom', content: 'skripsi revisi, dosen nyuruh ganti tema. semangat langsung drop', wordCount: 10, timestamp: Date.now() - 3200000, reactions: { skull:35, cry:40, fire:1, upside:2 } },
        { id: 'spill_020', author: 'agak.koplak', mood: 'chaotic', content: 'boss minta kerja lembur tapi gaji masih sama 😤', wordCount: 9, timestamp: Date.now() - 3100000, reactions: { skull:22, cry:15, fire:8, upside:12 } },
        { id: 'spill_021', author: 'pretty.sad', mood: 'thriving', content: 'kerjaan kelar, weekend healing ke pantai 🌊', wordCount: 7, timestamp: Date.now() - 3000000, reactions: { skull:2, cry:5, fire:30, upside:15 } },
        { id: 'spill_022', author: 'bang.juned', mood: 'chaotic', content: 'coding error, minta tolong temen. debugging rame-rame', wordCount: 8, timestamp: Date.now() - 2900000, reactions: { skull:12, cry:18, fire:5, upside:8 } },
        { id: 'spill_023', author: 'strawberry.shortcake', mood: 'doom', content: 'interview ditolak lagi, ke-51 kalinya. mental udah ancur', wordCount: 9, timestamp: Date.now() - 2800000, reactions: { skull:30, cry:45, fire:1, upside:4 } },
        { id: 'spill_024', author: 'chili.padi', mood: 'surviving', content: 'modal habis, orderan sepi. bingung mau usaha apa lagi', wordCount: 10, timestamp: Date.now() - 2700000, reactions: { skull:25, cry:30, fire:2, upside:3 } },
        { id: 'spill_025', author: 'little.fairy', mood: 'doom', content: 'client kabur ga bayar, rugi 5 juta 💸', wordCount: 8, timestamp: Date.now() - 2600000, reactions: { skull:28, cry:35, fire:1, upside:2 } },
        { id: 'spill_026', author: 'sejuta.badai', mood: 'thriving', content: 'gig kecil-kecilan, lumayan buat makan seminggu', wordCount: 7, timestamp: Date.now() - 2500000, reactions: { skull:5, cry:8, fire:20, upside:12 } },
        { id: 'spill_027', author: 'satria.bajahitam', mood: 'chaotic', content: 'pelanggan komplain, harus garansi. repot', wordCount: 6, timestamp: Date.now() - 2400000, reactions: { skull:18, cry:22, fire:3, upside:6 } },
        { id: 'spill_028', author: 'beby.manis', mood: 'thriving', content: 'alhamdulillah skripsi ACC, sidang bulan depan 🎓', wordCount: 7, timestamp: Date.now() - 2300000, reactions: { skull:2, cry:5, fire:42, upside:15 } },
        { id: 'spill_029', author: 'agak.koplak', mood: 'surviving', content: 'kerjaan numpuk, deadline mepet, bawaannya pengen resign', wordCount: 8, timestamp: Date.now() - 2200000, reactions: { skull:25, cry:30, fire:2, upside:5 } },
        { id: 'spill_030', author: 'pretty.sad', mood: 'chaotic', content: 'lagi fase bucin, padahal baru kenal seminggu 😵‍💫', wordCount: 8, timestamp: Date.now() - 2100000, reactions: { skull:15, cry:20, fire:5, upside:12 } },
        { id: 'spill_031', author: 'bang.juned', mood: 'thriving', content: 'akhirnya sidang, nilai A alhamdulillah', wordCount: 6, timestamp: Date.now() - 2000000, reactions: { skull:1, cry:2, fire:55, upside:20 } },
        { id: 'spill_032', author: 'strawberry.shortcake', mood: 'chaotic', content: 'pacar ngambek karena lupa beli kado anniversary', wordCount: 8, timestamp: Date.now() - 1900000, reactions: { skull:15, cry:25, fire:3, upside:8 } },
        { id: 'spill_033', author: 'chili.padi', mood: 'doom', content: 'orderan sepi, modal habis, galau', wordCount: 6, timestamp: Date.now() - 1800000, reactions: { skull:30, cry:35, fire:1, upside:2 } },
        { id: 'spill_034', author: 'little.fairy', mood: 'surviving', content: 'client baru minta revisi, lagi-lagi deadline', wordCount: 7, timestamp: Date.now() - 1700000, reactions: { skull:12, cry:18, fire:5, upside:7 } },
        { id: 'spill_035', author: 'sejuta.badai', mood: 'chaotic', content: 'inspirasi lagu dateng pas mau tidur, harus bangun buat nulis', wordCount: 11, timestamp: Date.now() - 1600000, reactions: { skull:8, cry:5, fire:25, upside:10 } },
        { id: 'spill_036', author: 'satria.bajahitam', mood: 'surviving', content: 'bengkel lagi sepi, mikir buka usaha sampingan', wordCount: 8, timestamp: Date.now() - 1500000, reactions: { skull:10, cry:12, fire:15, upside:8 } },
        { id: 'spill_037', author: 'beby.manis', mood: 'chaotic', content: 'bentar lagi sidang, deg-degan campur bahagia', wordCount: 7, timestamp: Date.now() - 1400000, reactions: { skull:8, cry:12, fire:25, upside:10 } },
        { id: 'spill_038', author: 'agak.koplak', mood: 'thriving', content: 'promosi jabatan, gaji naik 30%', wordCount: 6, timestamp: Date.now() - 1300000, reactions: { skull:1, cry:2, fire:65, upside:18 } },
        { id: 'spill_039', author: 'pretty.sad', mood: 'doom', content: 'ditolak investor lagi, usaha hampir bangkrut', wordCount: 7, timestamp: Date.now() - 1200000, reactions: { skull:35, cry:45, fire:1, upside:3 } },
        { id: 'spill_040', author: 'bang.juned', mood: 'chaotic', content: 'ngoding seharian, error masih banyak', wordCount: 6, timestamp: Date.now() - 1100000, reactions: { skull:20, cry:25, fire:5, upside:5 } },
        { id: 'spill_041', author: 'strawberry.shortcake', mood: 'surviving', content: 'kerjaan numpuk, pengen cuti tapi ga enak', wordCount: 8, timestamp: Date.now() - 1000000, reactions: { skull:15, cry:20, fire:8, upside:10 } },
        { id: 'spill_042', author: 'chili.padi', mood: 'thriving', content: 'buka cabang baru, orderan makin banyak', wordCount: 7, timestamp: Date.now() - 900000, reactions: { skull:2, cry:3, fire:45, upside:12 } },
        { id: 'spill_043', author: 'little.fairy', mood: 'doom', content: 'project deadline besok, client minta revisi', wordCount: 7, timestamp: Date.now() - 800000, reactions: { skull:28, cry:30, fire:2, upside:4 } },
        { id: 'spill_044', author: 'sejuta.badai', mood: 'surviving', content: 'gig malem minggu, sepi pengunjung', wordCount: 6, timestamp: Date.now() - 700000, reactions: { skull:12, cry:15, fire:8, upside:7 } },
        { id: 'spill_045', author: 'satria.bajahitam', mood: 'chaotic', content: 'bengkel rame, tapi banyak komplain', wordCount: 6, timestamp: Date.now() - 600000, reactions: { skull:18, cry:20, fire:5, upside:8 } },
        { id: 'spill_046', author: 'beby.manis', mood: 'thriving', content: 'sidang kelar, lulus! 🎉', wordCount: 4, timestamp: Date.now() - 500000, reactions: { skull:0, cry:10, fire:70, upside:25 } },
        { id: 'spill_047', author: 'agak.koplak', mood: 'doom', content: 'tiktok kena shadowban, engagement turun drastis', wordCount: 7, timestamp: Date.now() - 400000, reactions: { skull:30, cry:35, fire:2, upside:5 } },
        { id: 'spill_048', author: 'pretty.sad', mood: 'thriving', content: 'dapet investor baru, bisnis selamat', wordCount: 6, timestamp: Date.now() - 300000, reactions: { skull:1, cry:3, fire:50, upside:15 } },
        { id: 'spill_049', author: 'bang.juned', mood: 'chaotic', content: 'coding error, stress, tapi akhirnya nemu solusi', wordCount: 8, timestamp: Date.now() - 200000, reactions: { skull:15, cry:18, fire:12, upside:10 } },
        { id: 'spill_050', author: 'strawberry.shortcake', mood: 'surviving', content: 'akhirnya dapet kerja, tapi gaji kecil', wordCount: 7, timestamp: Date.now() - 100000, reactions: { skull:8, cry:12, fire:20, upside:8 } }
    ];

    // ============================================
    // GENERATE VARIASI PANJANG
    // ============================================
    function generateVariedContent(mood) {
        const panjangOptions = [7, 15, 25, 40];
        const targetKata = panjangOptions[Math.floor(Math.random() * panjangOptions.length)];
        
        const templates = {
            surviving: {
                7: [
                    'capek banget hari ini, pengen rebahan aja 🥲',
                    'deadline makin deket, anxiety naik turun 😮‍💨',
                    'kerjaan numpuk, bawaannya pengen resign',
                    'hari ini selamat, besok belum tau'
                ],
                15: [
                    'bangun tidur langsung overthinking masa depan, capek banget rasanya. semoga hari ini lebih baik',
                    'kerja lembur sampe malem, tapi gapapa demi masa depan. yang penting sehat',
                    'stress ngerjain skripsi bab 3, dosennya ga pernah bales chat. pengen nangis',
                    'hari ini lumayan produktif, kerjaan kelar 5 task. proud of myself ✨'
                ],
                25: [
                    'minggu pagi jam 3, ga bisa tidur karena overthinking masa depan. buka IG liat temen pada nikah, beli rumah, punya mobil, sementara gue masih struggle with skripsi dan dompet tipis',
                    'kerjaan numpuk, deadline mepet, client minta revisi mulu. capek fisik dan mental, tapi kalo berenti ga bisa makan. hidup keras banget sumpah',
                    'hari ini nangis di toilet kantor gara-gara dimarahin boss. rasanya pengen resign aja tapi takut ga dapet kerjaan lain. bingung jadinya'
                ],
                40: [
                    'selasa siang panas banget, client nanyain progress, laptop mau lowbat, listrik mati, mental lagi chaos. ditambah inget kalo semalem lupa sholat isya. hidup emang kadang suka bikin kita nanya: ini ujian atau lagi di-prank sama takdir sih 🫠',
                    'minggu malem anxiety attack, mikirin minggu depan ada meeting penting, presentasi, deadline. ditambah hubungan sama keluarga lagi ga baik. rasanya pengen lari dari semua ini, tapi ga tau mau lari kemana'
                ]
            },
            thriving: {
                7: [
                    'alhamdulillah hari ini cuan! 💰',
                    'akhirnya sidang ACC, lulus! 🎉',
                    'promosi jabatan, gaji naik!',
                    'project kelar, client puas'
                ],
                15: [
                    'akhirnya sidang kelar, nilai A alhamdulillah. perjuangan 4 tahun ga sia-sia',
                    'promosi jabatan, gaji naik 30% plus bonus. kerja keras akhirnya dihargai',
                    'project freelance selesai, dapet bonus 2 juta. rezeki anak soleh kata emak',
                    'tiktok konten viral, followers nambah 10k dalam seminggu'
                ],
                25: [
                    'hari ini closing 3 client dalam sehari, komisi lumayan buat bulan depan. rasanya seneng banget, kerja keras selama ini ga sia-sia. makasih buat diri sendiri yang ga pernah nyerah',
                    'alhamdulillah dapet beasiswa S2 ke luar negeri. perjuangan ngurus berkas, ikut tes, wawancara, akhirnya berbuah manis. doain lancar ya semuanya',
                    'akhirnya bisa beli mobil hasil jerih payah sendiri. inget dulu naik angkot tiap hari, sekarang udah punya kendaraan sendiri. bersyukur banget'
                ],
                40: [
                    'setelah 2 tahun struggle cari kerja, akhirnya dapet panggilan interview dan langsung diterima di perusahaan impian. gaji 2x lipat dari sebelumnya, kerjaannya juga sesuai passion. rasaya campur aduk antara seneng, haru, dan ga percaya',
                    'bisa beli rumah pertama buat orang tua di usia 25. inget dulu mereka selalu ngontrak, pindah-pindah terus. sekarang udah punya tempat sendiri yang bisa ditempatin sampe tua. rasanya ga bisa diungkapin pake kata-kata'
                ]
            },
            chaotic: {
                7: [
                    'hidup lagi kacau balau 🔥',
                    'hari ini nangis, besok ketawa sendiri',
                    'antara resign atau bertahan, bingung',
                    'pacar ngambek, kerjaan deadline'
                ],
                15: [
                    'client minta revisi jam 11 malem, deadline besok pagi. this is fine 🔥',
                    'pacar ngambek karena lupa anniversary, kerjaan deadline, ortu nanyain nikah. triple combo',
                    'boss minta kerja lembur tapi gaji masih sama. bodo amat ah, yolo',
                    'tiktok kena shadowban, engagement turun, follower berkurang. pusing'
                ],
                25: [
                    'hari ini chaotic banget: pagi dimarahin boss, siang motor mogok di jalan, malem pacar minta putus. sumpah ini hari apa coba. pengen marah-marah tapi ga ada yang salah',
                    'hidup lagi absurd: semalem nangis mikirin masa depan, paginya dapet kabar baik. naik turun terus rasanya. maybe this is just how life works',
                    'kadang semangat, kadang males. hari ini lagi males tapi kerjaan numpuk. bawaannya pengen rebahan terus tapi ga bisa. bingung jadinya'
                ],
                40: [
                    'hari ini chaotic level dewa: bangun kesiangan, ketinggalan meeting penting, dimarahin boss di depan semua orang. pas mau balas dendam makan siang, e-wallet error, duit ga cukup. pulangnya motor mogok lagi, harus ngedorong sampe bengkel',
                    'lagi fase dimana semua hal dateng bersamaan: kerjaan deadline, keluarga lagi konflik, hubungan sama pasangan lagi ga baik, temen pada sibuk sendiri. rasanya sendirian banget di dunia ini'
                ]
            },
            doom: {
                7: [
                    'rasanya pengen rebahan aja selamanya 🛌',
                    'capek fisik dan mental',
                    'hidup keras banget sumpah',
                    'ga semangat ngapa-ngapain'
                ],
                15: [
                    'kerjaan ga kelar-kelar, mental udah di ujung tanduk. pengen resign tapi ga punya tabungan',
                    'skripsi bab 4 error, debugging dari pagi ga ketemu. maybe this is the end',
                    'orderan sepi, modal habis, bingung mau gimana. dagang kok susah',
                    'ditolak investor lagi, usaha hampir bangkrut. capek'
                ],
                25: [
                    'skripsi bab 3 error, dosen pembimbing ga bales chat seminggu, deadline sidang tinggal 2 bulan. pengen mundur tapi udah di depan mata. rasanya hopeless banget',
                    'HR minta masuk sabtu minggu, mau resign tapi tabungan tinggal 200rb. bingung jadinya. hidup kok keras',
                    'kerja lembur tiap hari, weekend juga, tapi gaji ga naik-naik. mental udah ga karuan. mau ngeluh takut dianggap ga bersyukur'
                ],
                40: [
                    'udah 6 bulan nganggur, lamaran kerja ga ada yang dipanggil. tabungan habis, mulai jualin barang-barang. orang tua makin sering nanyain kapan kerja. rasanya pengen lari dari rumah tapi ga tau mau kemana',
                    'terjebak di hubungan toxic selama 3 tahun, tapi susah banget buat keluar. takut sendiri, takut ga dapet yang lebih baik, takut nyakitin dia. padahal tau kalo ini ga sehat. mental makin drop tiap hari'
                ]
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
        console.log('[SpillGen] 🚀 Initializing pool 50, window 8...');
        
        fullPool = [...INITIAL_SPILLS].sort((a, b) => b.timestamp - a.timestamp);
        nextId = 51;
        windowStart = 0;
        
        renderSpills();
        
        setInterval(() => {
            addNewEntry();
        }, CONFIG.BREW_INTERVAL);
    }

    // ============================================
    // TAMBAH ENTRIES BARU - ENHANCED
    // ============================================
    async function addNewEntry() {
        console.log('[SpillGen] 🆕 Menambah entries baru ke pool...');
        
        try {
            const response = await fetch('/api/brew', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ count: 1 })
            });
            
            // CEK: Response OK?
            if (!response.ok) {
                const errorText = await response.text();
                console.warn('[SpillGen] API error:', response.status, errorText);
                addOfflineEntry();
                return;
            }
            
            // CEK: Content-Type JSON?
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const textResponse = await response.text();
                console.warn('[SpillGen] Response bukan JSON:', textResponse);
                addOfflineEntry();
                return;
            }
            
            // PARSE JSON
            let data;
            try {
                data = await response.json();
            } catch (parseError) {
                console.error('[SpillGen] JSON parse error:', parseError);
                addOfflineEntry();
                return;
            }
            
            // VALIDASI structure
            if (data.success && data.spills && Array.isArray(data.spills) && data.spills.length > 0) {
                const apiSpill = data.spills[0];
                
                if (!apiSpill.content) {
                    console.warn('[SpillGen] Spill tidak ada content');
                    addOfflineEntry();
                    return;
                }
                
                const wordCount = apiSpill.content.split(/\s+/).filter(w => w.length > 0).length;
                
                const newSpill = {
                    id: `api_${nextId++}`,
                    author: apiSpill.author || 'ai.generator',
                    mood: apiSpill.mood || 'surviving',
                    content: apiSpill.content,
                    wordCount: wordCount,
                    timestamp: Date.now(),
                    reactions: apiSpill.reactions || {
                        skull: Math.floor(Math.random() * 20) + 5,
                        cry: Math.floor(Math.random() * 30) + 10,
                        fire: Math.floor(Math.random() * 25) + 3,
                        upside: Math.floor(Math.random() * 15) + 2
                    }
                };
                
                console.log(`[SpillGen] ✅ API entry: ${wordCount} kata (${newSpill.mood})`);
                
                fullPool = [newSpill, ...fullPool.slice(0, CONFIG.POOL_SIZE - 1)];
                renderSpills();
                return;
            }
            
            // Fallback jika struktur tidak valid
            console.warn('[SpillGen] Data tidak valid, pakai offline');
            addOfflineEntry();
            
        } catch (error) {
            console.error('[SpillGen] Error:', error);
            addOfflineEntry();
        }
    }

    // ============================================
    // TAMBAH ENTRIES OFFLINE
    // ============================================
    function addOfflineEntry() {
        const authors = ['beby.manis', 'agak.koplak', 'pretty.sad', 'bang.juned', 
                         'strawberry.shortcake', 'chili.padi', 'little.fairy', 'sejuta.badai', 
                         'satria.bajahitam', 'cinnamon.girl'];
        
        const moods = ['surviving', 'thriving', 'chaotic', 'doom'];
        
        const author = authors[Math.floor(Math.random() * authors.length)];
        const mood = moods[Math.floor(Math.random() * moods.length)];
        
        const { content, wordCount } = generateVariedContent(mood);
        
        const newSpill = {
            id: `offline_${nextId++}`,
            author: author,
            mood: mood,
            content: content,
            wordCount: wordCount,
            timestamp: Date.now(),
            reactions: {
                skull: Math.floor(Math.random() * 20) + 5,
                cry: Math.floor(Math.random() * 30) + 10,
                fire: Math.floor(Math.random() * 25) + 3,
                upside: Math.floor(Math.random() * 15) + 2
            }
        };
        
        fullPool = [newSpill, ...fullPool.slice(0, CONFIG.POOL_SIZE - 1)];
        
        console.log(`[SpillGen] 📝 Offline entry: ${wordCount} kata (${mood})`);
        renderSpills();
    }

    // ============================================
    // SEDUH TEH BARU
    // ============================================
    function seduhTehBaru() {
        console.log('[SpillGen] 🍵 Seduh: geser jendela ke bawah...');
        windowStart = (windowStart + 1) % CONFIG.POOL_SIZE;
        renderSpills();
    }

    function seduhKeAtas() {
        console.log('[SpillGen] ⬆️ Seduh: geser jendela ke atas...');
        windowStart = windowStart - 1;
        if (windowStart < 0) {
            windowStart = CONFIG.POOL_SIZE - 1;
        }
        renderSpills();
    }

    // ============================================
    // RENDER SPILLS
    // ============================================
    function renderSpills() {
        const container = document.getElementById('spillsList');
        if (!container) return;
        
        let windowSpills = [];
        for (let i = 0; i < CONFIG.WINDOW_SIZE; i++) {
            const index = (windowStart + i) % CONFIG.POOL_SIZE;
            windowSpills.push(fullPool[index]);
        }
        
        let toShow = windowSpills;
        if (activeMood !== 'all') {
            toShow = windowSpills.filter(s => s.mood === activeMood);
            if (toShow.length === 0) {
                toShow = windowSpills;
            }
        }
        
        const metaEl = document.getElementById('feedMeta');
        if (metaEl) {
            const endPos = windowStart + CONFIG.WINDOW_SIZE - 1;
            const displayEnd = endPos >= CONFIG.POOL_SIZE ? endPos - CONFIG.POOL_SIZE + 1 : endPos + 1;
            
            const wordCounts = toShow.map(s => s.wordCount || s.content.split(/\s+/).length);
            const avgWords = Math.round(wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length);
            const minWords = Math.min(...wordCounts);
            const maxWords = Math.max(...wordCounts);
            
            metaEl.textContent = `Jendela ${windowStart+1}-${displayEnd} | ${minWords}-${maxWords} kata (avg ${avgWords})`;
        }
        
        let html = '';
        for (let s of toShow) {
            const wordCount = s.wordCount || s.content.split(/\s+/).length;
            
            html += `<div class="spill-card" data-id="${s.id}">
                <div class="spill-head">
                    <span class="spill-user">@${escapeHtml(s.author)}</span>
                    <span class="spill-mood ${s.mood}">${s.mood.toUpperCase()}</span>
                    <span class="spill-words" style="font-size:9px; color:var(--txm); margin-left:8px;">${wordCount} kata</span>
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
    // HELPERS
    // ============================================
    window.reactToSpill = function(spillId, reactionType) {
        const spill = fullPool.find(s => s.id === spillId);
        if (!spill) return;
        
        spill.reactions[reactionType] = (spill.reactions[reactionType] || 0) + 1;
        renderSpills();
    };

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
    // EXPOSE
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
