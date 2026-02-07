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
  container.innerHTML = '';
  const limitedPosts = posts.slice(0, 4); // Max 4 posts per zone

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
    const [rantsData, artefakData] = await Promise.all([
      supabaseFetch('rants', 'GET', null, '?order=created_at.desc&limit=100'),
      loadArtefak()
    ]);

    const hype = [], ngusahain = [], spill = [];
    rantsData.forEach(r => {
      const zone = detectZone(r.content);
      if (zone === 'hype') hype.push(r);
      else if (zone === 'ngusahain') ngusahain.push(r);
      else spill.push(r);
    });

    // Inject random artefak into one zone
    if (artefakData.length > 0) {
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

    renderZone(hype, 'zone-hype-content');
    renderZone(ngusahain, 'zone-ngusahain-content');
    renderZone(spill, 'zone-spill-content');
  } catch (e) {
    console.error('💥 Gagal muat feed:', e);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadFeed();
  window.addEventListener('scroll', updateZoneIndicator);
  setTimeout(triggerPulse, 300);
});
