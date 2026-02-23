// ================================================
// COCOMEO HANGOUTS — Location recommendations
// ================================================

async function loadHangouts() {
  try {
    const data = await supabaseFetch('hangouts', 'GET', null, '?order=created_at.desc');
    const gems = data.filter(h => h.category === 'gems');
    const wfh = data.filter(h => h.category === 'wfh');
    const food = data.filter(h => h.category === 'food');

    renderHangouts('gems', gems);
    renderHangouts('wfh', wfh);
    renderHangouts('food', food);
  } catch (e) {
    console.error('Gagal muat hangouts:', e);
  }
}

function renderHangouts(category, items) {
  const container = document.getElementById(`hangouts-${category}`);

  // Default gem if none exist
  if (category === 'gems' && items.length === 0) {
    items = [{
      name: "CoffeeBeerian Ciragil",
      location: "Ciragil, Bandung",
      notes: "Naik Alphard atau sepeda lipat? Di sini, semua level sama. CoffeeBeerian bukan cuma kafe—ini social lab yang berhasil. Solo flyer duduk di bar jadi magnet obrolan, barista cerita passion kayak ngobrol sahabat lama, dan nggak ada yang judge lo dari cara lo parkir.",
      username: "nope.admin",
      is_admin_curated: true
    }];
  }

  if (items.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📍</div>
        <div class="empty-state-text">Belum ada rekomendasi</div>
      </div>
    `;
  } else {
    container.innerHTML = items.map(item => `
      <div class="hangout-item">
        <div class="hangout-header">
          <div class="hangout-title">
            <div class="hangout-name">${item.name}</div>
            <div class="hangout-location">📍 ${item.location}</div>
          </div>
          ${item.is_admin_curated ? '<span class="hangout-badge">Admin</span>' : ''}
        </div>
        ${item.notes ? `<div class="hangout-notes">${item.notes}</div>` : ''}
        <div class="hangout-footer">
          <span class="hangout-author">oleh @${item.username}</span>
        </div>
      </div>
    `).join('');
  }
}

function openAddHangout(category) {
  document.getElementById('input-category').value = category;
  document.getElementById('modal-add').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal-add').classList.remove('active');
  document.getElementById('form-hangout').reset();
  document.body.style.overflow = 'auto';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadHangouts();
  setTimeout(triggerPulse, 300);

  // Form submit handler
  document.getElementById('form-hangout').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await supabaseFetch('hangouts', 'POST', {
        name: document.getElementById('input-name').value,
        location: document.getElementById('input-location').value,
        category: document.getElementById('input-category').value,
        notes: document.getElementById('input-notes').value,
        username: currentUser,
        is_admin_curated: false
      });
      closeModal();
      loadHangouts();
      triggerPulse();
    } catch (e) {
      alert('Gagal menambahkan: ' + e.message);
    }
  });

  // Close modal on backdrop click
  document.getElementById('modal-add').addEventListener('click', (e) => {
    if (e.target.id === 'modal-add') closeModal();
  });
});

// Make functions globally available
window.openAddHangout = openAddHangout;
window.closeModal = closeModal;
