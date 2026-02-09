// ================================================
// FREKUENSI ZONES — Mood-based feed categorization
// ================================================

const HYPE_KEYWORDS = ['v!', 'kpop', 'skz', 'txt', 'bts', 'seventeen', 'enhypen', 'drakor', 'squid game', 'anime', 'naruto', 'au', 'ship', 'bias', 'comeback', 'concert'];
const NGUSAHAIN_KEYWORDS = ['skripsi', 'tugas', 'deadline', 'jualan', 'thrifting', 'crypto', 'freelance', 'coding', 'side hustle', 'figma', 'canva'];
const SPILL_KEYWORDS = ['capek', 'lelah', 'sendiri', 'nangis', 'sedih', 'anxiety', 'burnout', 'overthinking', 'gatau', 'kenapa ya', 'beban'];

function detectZone(content) {
  const lower = content.toLowerCase();
  if (HYPE_KEYWORDS.some(kw => lower.includes(kw))) return 'hype';
  if (NGUSAHAIN_KEYWORDS.some(kw => lower.includes(kw))) return 'ngusahain';
  if (SPILL_KEYWORDS.some(kw => lower.includes(kw))) return 'spill';
  return 'spill'; // Default
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
