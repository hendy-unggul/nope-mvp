// api/brew.js - VERSI DENGAN VARIASI PANJANG
module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET /test
  if (req.method === 'GET' && req.url.endsWith('/test')) {
    return res.json({ 
      success: true, 
      message: 'Brew API OK',
      timestamp: Date.now()
    });
  }

  // POST /brew - GENERATE SPILLS
  if (req.method === 'POST') {
    try {
      const { count = 1 } = req.body;
      
      const authors = [
        'beby.manis', 'agak.koplak', 'pretty.sad', 'bang.juned', 
        'strawberry.shortcake', 'chili.padi', 'little.fairy', 'sejuta.badai',
        'satria.bajahitam', 'cinnamon.girl'
      ];
      
      const moods = ['surviving', 'thriving', 'chaotic', 'doom'];
      
      // Variasi panjang (7, 15, 25, 40 kata)
      const panjangOptions = [7, 15, 25, 40];
      
      const spills = [];
      
      for (let i = 0; i < count; i++) {
        const author = authors[Math.floor(Math.random() * authors.length)];
        const mood = moods[Math.floor(Math.random() * moods.length)];
        const targetKata = panjangOptions[Math.floor(Math.random() * panjangOptions.length)];
        
        // Generate content dengan panjang tertentu
        let content = generateContent(author, mood, targetKata);
        
        spills.push({
          id: `spill_${Date.now()}_${i}`,
          author,
          mood,
          content,
          timestamp: Date.now() - (i * 60000),
          reactions: {
            skull: Math.floor(Math.random() * 20) + 5,
            cry: Math.floor(Math.random() * 30) + 10,
            fire: Math.floor(Math.random() * 25) + 3,
            upside: Math.floor(Math.random() * 15) + 2
          }
        });
      }
      
      return res.json({
        success: true,
        spills,
        count: spills.length
      });
      
    } catch (error) {
      console.error('[Brew] Error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(404).json({ error: 'Not found' });
};

// Fungsi generate content (sementara pake template)
function generateContent(author, mood, wordCount) {
  const templates = {
    surviving: {
      7: [
        'capek banget hari ini, pengen rebahan aja',
        'deadline makin deket, anxiety naik turun',
        'kerjaan numpuk, bawaannya pengen resign',
        'hari ini selamat, besok belum tau'
      ],
      15: [
        'bangun tidur langsung overthinking masa depan, capek banget rasanya. semoga hari ini lebih baik',
        'kerja lembur sampe malem, tapi gapapa demi masa depan. yang penting sehat',
        'stress ngerjain skripsi bab 3, dosennya ga pernah bales chat. pengen nangis',
        'hari ini lumayan produktif, kerjaan kelar 5 task. proud of myself'
      ],
      25: [
        'minggu pagi jam 3, ga bisa tidur karena overthinking masa depan. buka IG liat temen pada nikah, beli rumah, punya mobil, sementara gue masih struggle with skripsi dan dompet tipis',
        'kerjaan numpuk, deadline mepet, client minta revisi mulu. capek fisik dan mental, tapi kalo berenti ga bisa makan. hidup keras banget',
        'hari ini nangis di toilet kantor gara-gara dimarahin boss. rasanya pengen resign aja tapi takut ga dapet kerjaan lain'
      ],
      40: [
        'selasa siang panas banget, client nanyain progress, laptop mau lowbat, listrik mati, mental lagi chaos. ditambah inget kalo semalem lupa sholat isya. hidup emang kadang suka bikin kita nanya: ini ujian atau lagi di-prank sama takdir sih',
        'minggu malem anxiety attack, mikirin minggu depan ada meeting penting, presentasi, deadline. ditambah hubungan sama keluarga lagi ga baik. rasanya pengen lari dari semua ini, tapi ga tau mau lari kemana'
      ]
    },
    thriving: {
      7: [
        'alhamdulillah hari ini cuan',
        'akhirnya sidang ACC, lulus',
        'promosi jabatan, gaji naik',
        'project kelar, client puas'
      ],
      15: [
        'akhirnya sidang kelar, nilai A alhamdulillah. perjuangan 4 tahun ga sia-sia',
        'promosi jabatan, gaji naik 30% plus bonus. kerja keras akhirnya dihargai',
        'project freelance selesai, dapet bonus 2 juta. rezeki anak soleh kata emak',
        'tiktok konten viral, followers nambah 10k dalam seminggu'
      ],
      25: [
        'hari ini closing 3 client dalam sehari, komisi lumayan buat bulan depan. rasanya seneng banget, kerja keras selama ini ga sia-sia',
        'alhamdulillah dapet beasiswa S2 ke luar negeri. perjuangan ngurus berkas, ikut tes, wawancara, akhirnya berbuah manis',
        'akhirnya bisa beli mobil hasil jerih payah sendiri. inget dulu naik angkot tiap hari, sekarang udah punya kendaraan sendiri'
      ],
      40: [
        'setelah 2 tahun struggle cari kerja, akhirnya dapet panggilan interview dan langsung diterima di perusahaan impian. gaji 2x lipat dari sebelumnya, kerjaannya juga sesuai passion. rasaya campur aduk antara seneng, haru, dan ga percaya',
        'bisa beli rumah pertama buat orang tua di usia 25. inget dulu mereka selalu ngontrak, pindah-pindah terus. sekarang udah punya tempat sendiri yang bisa ditempatin sampe tua. rasanya ga bisa diungkapin pake kata-kata'
      ]
    },
    chaotic: {
      7: [
        'hidup lagi kacau balau',
        'hari ini nangis, besok ketawa sendiri',
        'antara resign atau bertahan, bingung',
        'pacar ngambek, kerjaan deadline'
      ],
      15: [
        'client minta revisi jam 11 malem, deadline besok pagi. this is fine 🔥',
        'pacar ngambek karena lupa anniversary, kerjaan deadline, ortu nanyain nikah. triple combo',
        'boss minta kerja lembur tapi gaji masih sama. bodo amat ah',
        'tiktok kena shadowban, engagement turun, follower berkurang'
      ],
      25: [
        'hari ini chaotic banget: pagi dimarahin boss, siang motor mogok di jalan, malem pacar minta putus. sumpah ini hari apa coba',
        'hidup lagi absurd: semalem nangis mikirin masa depan, paginya dapet kabar baik. naik turun terus rasanya',
        'kadang semangat, kadang males. hari ini lagi males tapi kerjaan numpuk. bawaannya pengen rebahan terus tapi ga bisa'
      ],
      40: [
        'hari ini chaotic level dewa: bangun kesiangan, ketinggalan meeting penting, dimarahin boss di depan semua orang. pas mau balas dendam makan siang, e-wallet error, duit ga cukup. pulangnya motor mogok lagi, harus ngedorong sampe bengkel',
        'lagi fase dimana semua hal dateng bersamaan: kerjaan deadline, keluarga lagi konflik, hubungan sama pasangan lagi ga baik, temen pada sibuk sendiri. rasanya sendirian banget di dunia ini'
      ]
    },
    doom: {
      7: [
        'rasanya pengen rebahan aja selamanya',
        'capek fisik dan mental',
        'hidup keras banget',
        'ga semangat ngapa-ngapain'
      ],
      15: [
        'kerjaan ga kelar-kelar, mental udah di ujung tanduk. pengen resign tapi ga punya tabungan',
        'skripsi bab 4 error, debugging dari pagi ga ketemu. maybe this is the end',
        'orderan sepi, modal habis, bingung mau gimana',
        'ditolak investor lagi, usaha hampir bangkrut'
      ],
      25: [
        'skripsi bab 3 error, dosen pembimbing ga bales chat seminggu, deadline sidang tinggal 2 bulan. pengen mundur tapi udah di depan mata',
        'HR minta masuk sabtu minggu, mau resign tapi tabungan tinggal 200rb. bingung jadinya',
        'kerja lembur tiap hari, weekend juga, tapi gaji ga naik-naik. mental udah ga karuan'
      ],
      40: [
        'udah 6 bulan nganggur, lamaran kerja ga ada yang dipanggil. tabungan habis, mulai jualin barang-barang. orang tua makin sering nanyain "kapan kerja?" rasanya pengen lari dari rumah tapi ga tau mau kemana',
        'terjebak di hubungan toxic selama 3 tahun, tapi susah banget buat keluar. takut sendiri, takut ga dapet yang lebih baik, takut nyakitin dia. padahal tau kalo ini ga sehat. mental makin drop tiap hari'
      ]
    }
  };
  
  const moodTemplates = templates[mood]?.[wordCount] || templates.surviving[7];
  return moodTemplates[Math.floor(Math.random() * moodTemplates.length)] + getRandomEmoji(mood);
}

function getRandomEmoji(mood) {
  const emojis = {
    surviving: [' 😮‍💨', ' 😅', ' 🤔', ' 😬'],
    thriving: [' ✨', ' 🔥', ' 💯', ' 🎉'],
    chaotic: [' 🔥', ' 🌀', ' 🤪', ' 😵‍💫'],
    doom: [' 🥲', ' 😭', ' 🛌', ' 💔']
  };
  const list = emojis[mood] || emojis.surviving;
  return list[Math.floor(Math.random() * list.length)];
}
