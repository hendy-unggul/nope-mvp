// ================================================
// FREKUENSI ZONES — SHARPENED CATEGORIZATION
// ================================================

// ==========================================
// ZONE IDENTIFIERS - SCORING BASED
// ==========================================

const HYPE_IDENTIFIERS = {
  strongSignals: ['comeback', 'debut', 'mv baru', 'teaser', 'lightstick', 'photocard', 'album', 'bias', 'bias wrecker', 'ult', 'stan', 'fancam', 'idol', 'member', 'episode', 'drakor', 'kdrama', 'drama korea', 'series', 'netflix', 'cliffhanger', 'plot twist', 'ending', 'villain', 'couple', 'anime', 'manga', 'chapter', 'arc', 'op', 'ed', 'waifu', 'husbando', 'au', 'fanfic', 'headcanon', 'otp', 'ship', 'canon', 'concert', 'konser', 'fanmeet', 'showcase', 'comeback stage', 'music show', 'award', 'mama', 'mma'],
  mediumSignals: ['nonton', 'dengerin', 'playlist', 'lagu', 'nge-binge', 'marathon', 'rewatch', 'replay', 'streaming'],
  excitementMarkers: ['v!', 'keren banget', 'gila', 'insane', 'legendary', 'masterpiece', 'iconic', 'slay', 'ate', 'serve'],
  exclusions: ['gagal', 'nangis karena', 'sedih', 'capek nonton', 'burnout', 'anxiety', 'overthinking', 'kenapa gue']
};

const NGUSAHAIN_IDENTIFIERS = {
  strongSignals: ['revisi', 'bab', 'skripsi', 'thesis', 'penelitian', 'data', 'dosen', 'bimbingan', 'sidang', 'lulus', 'wisuda', 'jualan', 'omzet', 'profit', 'untung', 'jual', 'beli', 'customer', 'orderan', 'closing', 'deal', 'belajar', 'kursus', 'bootcamp', 'sertifikat', 'portfolio', 'project', 'deploy', 'launch', 'rilis', 'figma', 'canva', 'notion', 'github', 'vercel', 'shopee', 'tokped', 'instagram', 'tiktok shop'],
  progressMarkers: ['hari ke-', 'udah', 'selesai', 'done', 'progress', 'tinggal', 'hampir', 'mulai', 'coba', 'nyoba', 'berhasil', 'sukses', 'lancar', 'jalan', 'running', 'target'],
  actionVerbs: ['ngerjain', 'bikin', 'buat', 'develop', 'design', 'coding', 'nulis', 'riset', 'analisis', 'setup', 'install', 'deploy', 'upload', 'posting', 'marketing'],
  exclusions: ['pengen doang', 'cuma pengen', 'ga tau mulai', 'ga jadi', 'menyerah', 'hopeless', 'capek banget', 'burnout parah', 'anxiety muncul', 'overthinking', 'ga bisa tidur']
};

const SPILL_IDENTIFIERS = {
  strongSignals: ['sedih', 'nangis', 'galau', 'bingung', 'takut', 'cemas', 'khawatir', 'panik', 'stress', 'burnout', 'anxiety', 'overthinking', 'insomnia', 'lelah', 'capek', 'exhausted', 'drained', 'sendiri', 'sendirian', 'kesepian', 'lonely', 'ditinggal', 'diabaikan', 'dilupakan', 'kenapa ya', 'kenapa gue', 'apa gunanya', 'buat apa', 'ga tau', 'gatau', 'bingung', 'lost', 'beban', 'berat', 'overwhelmed', 'terlalu banyak', 'ga kuat', 'ga sanggup'],
  ventingPatterns: ['rasanya', 'kok gue', 'kenapa harus gue', 'cape deh', 'udah coba', 'tetep aja', 'gitu gitu aja', 'ga ada yang', 'selalu', 'terus menerus'],
  questionMarkers: ['?', 'kenapa', 'gimana', 'kapan', 'apakah', 'apa iya', 'emang gue', 'salah gue'],
  negativeMarkers: ['ga', 'gak', 'nggak', 'enggak', 'bukan', 'jangan', 'stop', 'cukup', 'enough']
};

function detectZone(content) {
  const lower = content.toLowerCase();
  const scores = { hype: 0, ngusahain: 0, spill: 0 };
  
  // HYPE SCORING
  HYPE_IDENTIFIERS.strongSignals.forEach(s => { if (lower.includes(s)) scores.hype += 10; });
  HYPE_IDENTIFIERS.mediumSignals.forEach(s => { if (lower.includes(s)) scores.hype += 3; });
  HYPE_IDENTIFIERS.excitementMarkers.forEach(s => { if (lower.includes(s)) scores.hype += 5; });
  if (HYPE_IDENTIFIERS.exclusions.some(ex => lower.includes(ex))) scores.hype = 0;
  
  // NGUSAHAIN SCORING
  NGUSAHAIN_IDENTIFIERS.strongSignals.forEach(s => { if (lower.includes(s)) scores.ngusahain += 8; });
  const hasProgress = NGUSAHAIN_IDENTIFIERS.progressMarkers.some(pm => lower.includes(pm));
  if (hasProgress) scores.ngusahain *= 2;
  NGUSAHAIN_IDENTIFIERS.actionVerbs.forEach(v => { if (lower.includes(v)) scores.ngusahain += 5; });
  if (NGUSAHAIN_IDENTIFIERS.exclusions.some(ex => lower.includes(ex))) scores.ngusahain *= 0.2;
  
  // SPILL SCORING
  SPILL_IDENTIFIERS.strongSignals.forEach(s => { if (lower.includes(s)) scores.spill += 7; });
  SPILL_IDENTIFIERS.ventingPatterns.forEach(p => { if (lower.includes(p)) scores.spill += 6; });
  SPILL_IDENTIFIERS.questionMarkers.forEach(m => { if (lower.includes(m)) scores.spill += 3; });
  SPILL_IDENTIFIERS.negativeMarkers.forEach(m => { if (lower.includes(m)) scores.spill += 2; });
  
  // DECISION
  const MIN_THRESHOLD = 10;
  const maxScore = Math.max(scores.hype, scores.ngusahain, scores.spill);
  
  if (maxScore < MIN_THRESHOLD) return 'spill';
  if (scores.hype === maxScore) return 'hype';
  if (scores.ngusahain === maxScore) return 'ngusahain';
  return 'spill';
}

async function loadArtefak() {
  try {
    const data = await supabaseFetch('artefacts', 'GET', null, '?order=created_at.desc&limit=20');
    return data || [];
  } catch (e) {
    console.warn('⚠️ Gagal muat artefak:', e.message);
    return [];
  }
}

function renderZone(posts, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Container ${containerId} not found`);
    return;
  }
  
  container.innerHTML = '';
  const limitedPosts = posts.slice(0, 4); // Max 4 posts per zone

  // Show empty state if no posts
  if (limitedPosts.length === 0) {
    container.innerHTML = `
      <div class="post-item" style="text-align: center; padding: 40px 20px; color: var(--muted);">
        <div style="font-size: 32px; margin-bottom: 12px; opacity: 0.5;">💭</div>
        <div style="font-size: 14px;">Belum ada post di zone ini</div>
      </div>
    `;
    return;
  }

  limitedPosts.forEach(post => {
    const el = document.createElement('div');
    el.className = 'post-item';

    if (post.is_artefak) {
      el.innerHTML = `
        <div class="artefak-container">
          <div class="notasi-with-reactions">
            <span class="post-notasi">${post.content || 'Tanpa keterangan'}</span>
            <div class="inline-reactions">
              <span>👍</span><span>😢</span><span>🤗</span><span>🔥</span>
            </div>
          </div>
          <div class="image-wrapper">
            <img src="${post.image_url}" class="artefak-image" alt="Artefak"/>
            <span class="subtle-username">@${post.username}</span>
          </div>
        </div>
      `;
    } else {
      el.innerHTML = `
        <div class="post-header">
          <span class="post-username">@${post.username}</span>
          <div class="post-reactions">
            <span>👍</span><span>😢</span><span>🤗</span><span>🔥</span>
          </div>
        </div>
        <div class="post-content">${post.content}</div>
      `;
    }
    container.appendChild(el);
  });
}

// Zone scroll indicator
let currentZone = '';
function updateZoneIndicator() {
  const zones = [
    { id: 'zone-hype', label: 'Hype Haus' },
    { id: 'zone-ngusahain', label: 'Ngusahain' },
    { id: 'zone-spill', label: 'Spill Zone' }
  ];
  let newZone = '';
  let newLabel = '';

  for (const zone of zones) {
    const el = document.getElementById(zone.id);
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    if (rect.top <= 200 && rect.bottom >= 100) {
      newZone = zone.id;
      newLabel = zone.label;
      break;
    }
  }

  if (newZone && newZone !== currentZone) {
    currentZone = newZone;
    const indicator = document.getElementById('zone-indicator');
    if (indicator) {
      indicator.textContent = newLabel;
      indicator.style.opacity = '1';
      setTimeout(() => indicator.style.opacity = '0', 1500);
    }
  }
}

async function loadFeed() {
  try {
    // Show loading state
    ['zone-hype-content', 'zone-ngusahain-content', 'zone-spill-content'].forEach(id => {
      const container = document.getElementById(id);
      if (container) {
        container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--muted);">Loading...</div>';
      }
    });

    const [rantsData, artefakData] = await Promise.all([
      supabaseFetch('rants', 'GET', null, '?order=created_at.desc&limit=100'),
      loadArtefak()
    ]);

    const hype = [], ngusahain = [], spill = [];
    
    // Safely handle rantsData
    if (rantsData && Array.isArray(rantsData)) {
      rantsData.forEach(r => {
        const zone = detectZone(r.content);
        if (zone === 'hype') hype.push(r);
        else if (zone === 'ngusahain') ngusahain.push(r);
        else spill.push(r);
      });
    }

    // Inject random artefak into one zone
    if (artefakData && artefakData.length > 0) {
      const randomArtefak = artefakData[Math.floor(Math.random() * artefakData.length)];
      const artefakPost = {
        id: `artefak-${randomArtefak.id}`,
        username: randomArtefak.username,
        content: randomArtefak.notation || 'Tanpa keterangan',
        created_at: randomArtefak.created_at,
        is_artefak: true,
        image_url: randomArtefak.image_url
      };
      const targetZone = ['hype', 'ngusahain', 'spill'][Math.floor(Math.random() * 3)];
      if (targetZone === 'hype') hype.unshift(artefakPost);
      else if (targetZone === 'ngusahain') ngusahain.unshift(artefakPost);
      else spill.unshift(artefakPost);
    }

    // If no data, add dummy posts
    if (hype.length === 0 && ngusahain.length === 0 && spill.length === 0) {
      console.log('📝 No data from Supabase, adding dummy posts');
      
      // Add dummy posts for each zone
      hype.push(
        { id: 'dummy1', username: 'kpopper99', content: 'Comeback baru seventeen keren banget! Choreo nya insane 🔥 v!', created_at: new Date().toISOString() },
        { id: 'dummy2', username: 'drakormania', content: 'Baru nonton squid game 2, plot twist nya bikin nangis 😭', created_at: new Date().toISOString() }
      );
      
      ngusahain.push(
        { id: 'dummy3', username: 'mahasiswa_sibuk', content: 'Hari ke-30 ngerjain skripsi, tinggal revisi dari dosen 💪', created_at: new Date().toISOString() },
        { id: 'dummy4', username: 'thrifter_jkt', content: 'Jualan thrifting bulan ini untung 2jt! Side hustle works 📈', created_at: new Date().toISOString() }
      );
      
      spill.push(
        { id: 'dummy5', username: 'anon_capek', content: 'Capek banget rasanya jadi versi diri orang lain terus...', created_at: new Date().toISOString() },
        { id: 'dummy6', username: 'overthinker', content: 'Kenapa ya rasanya selalu overthinking tiap malem 😔', created_at: new Date().toISOString() }
      );
    }

    renderZone(hype, 'zone-hype-content');
    renderZone(ngusahain, 'zone-ngusahain-content');
    renderZone(spill, 'zone-spill-content');
    
    console.log('✅ Feed loaded:', { hype: hype.length, ngusahain: ngusahain.length, spill: spill.length });
    
  } catch (e) {
    console.error('💥 Gagal muat feed:', e);
    
    // Show error state with dummy data
    const errorHype = [
      { id: 'err1', username: 'kpopper99', content: 'Comeback baru seventeen keren banget! v!', created_at: new Date().toISOString() }
    ];
    const errorNgusahain = [
      { id: 'err2', username: 'mahasiswa_sibuk', content: 'Hari ke-30 ngerjain skripsi 💪', created_at: new Date().toISOString() }
    ];
    const errorSpill = [
      { id: 'err3', username: 'anon_capek', content: 'Capek banget rasanya...', created_at: new Date().toISOString() }
    ];
    
    renderZone(errorHype, 'zone-hype-content');
    renderZone(errorNgusahain, 'zone-ngusahain-content');
    renderZone(errorSpill, 'zone-spill-content');
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 NOPE Zones initializing...');
  
  // Check if containers exist
  const containers = ['zone-hype-content', 'zone-ngusahain-content', 'zone-spill-content'];
  containers.forEach(id => {
    const el = document.getElementById(id);
    if (!el) console.error(`❌ Container ${id} not found!`);
    else console.log(`✅ Container ${id} found`);
  });
  
  // Load feed
  loadFeed().then(() => {
    console.log('✅ Feed loaded successfully');
  }).catch(err => {
    console.error('❌ Feed load failed:', err);
  });
  
  // Setup scroll indicator
  window.addEventListener('scroll', updateZoneIndicator);
  
  // Trigger pulse animation if available
  if (typeof triggerPulse === 'function') {
    setTimeout(triggerPulse, 300);
  } else {
    console.warn('⚠️ triggerPulse function not available');
  }
  
  console.log('✅ NOPE Zones initialized');
});
