// ============================================================
// JEJAK — shared-utils.js
// Include setelah shared-constants.js di semua halaman:
// <script src="/shared-utils.js"></script>
//
// Fix #7: Input sanitization (XSS prevention)
// Fix #1: Per-user reaction tracking
// Fix #8: Parallel upload dengan progress
// Fix #6: Graceful error handling + offline detection
// ============================================================

// ── FIX #7: SANITIZATION ────────────────────────────────────
// Lightweight XSS sanitizer tanpa dependency eksternal.
// Untuk konten yang di-render via innerHTML.
const JEJAK_SANITIZE = {

  // Escape HTML entities — untuk text content
  // Selalu pakai ini untuk data dari DB/user input
  escape(str) {
    if (!str || typeof str !== 'string') return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  },

  // Strip semua HTML tags — untuk display di context tertentu
  stripTags(str) {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/<[^>]*>/g, '').trim();
  },

  // Sanitize untuk innerHTML yang butuh subset HTML terbatas
  // Hanya allow: b, i, em, strong, br — block semua yang lain
  sanitizeHtml(str) {
    if (!str || typeof str !== 'string') return '';
    // Escape semua dulu
    let escaped = this.escape(str);
    // Re-allow safe tags saja
    escaped = escaped
      .replace(/&lt;(b|i|em|strong|br)&gt;/gi, '<$1>')
      .replace(/&lt;\/(b|i|em|strong)&gt;/gi, '</$1>');
    return escaped;
  },

  // Validasi URL — cegah javascript: dan data: URLs
  safeUrl(url) {
    if (!url || typeof url !== 'string') return '';
    try {
      const u = new URL(url);
      // Hanya allow http/https
      if (!['http:', 'https:'].includes(u.protocol)) return '';
      return url;
    } catch {
      return '';
    }
  },

  // Sanitize username — hanya allow alphanumeric, dot, underscore, dash
  sanitizeUsername(str) {
    if (!str || typeof str !== 'string') return 'anon';
    return str.replace(/[^a-zA-Z0-9._\-]/g, '').substring(0, 30) || 'anon';
  },

  // Sanitize content untuk spill/chat — strip tags, trim, max length
  sanitizeContent(str, maxLen = 500) {
    if (!str || typeof str !== 'string') return '';
    return this.stripTags(str).trim().substring(0, maxLen);
  },
};

// Expose globally
window.JEJAKSanitize = JEJAK_SANITIZE;

// ── FIX #1: PER-USER REACTION TRACKING ──────────────────────
// Simpan reaksi user per entry di localStorage
// Format: { [entryId]: 'skull' | 'cry' | 'fire' | 'upside' | null }
const JEJAK_REACTIONS = {
  _key: 'jejak_reactions_v1',

  _load() {
    try {
      return JSON.parse(localStorage.getItem(this._key) || '{}');
    } catch {
      return {};
    }
  },

  _save(data) {
    try {
      localStorage.setItem(this._key, JSON.stringify(data));
    } catch (e) {
      console.warn('[REACT] localStorage save failed:', e);
    }
  },

  // Ambil reaksi user untuk satu entry
  get(entryId) {
    return this._load()[entryId] || null;
  },

  // Set reaksi user untuk satu entry
  // Returns: { key: string|null, prevKey: string|null }
  set(entryId, key) {
    const data = this._load();
    const prev = data[entryId] || null;

    if (prev === key) {
      // Toggle off
      delete data[entryId];
      this._save(data);
      return { key: null, prevKey: prev };
    } else {
      data[entryId] = key;
      this._save(data);
      return { key, prevKey: prev };
    }
  },

  // Cek apakah user sudah react dengan key tertentu
  has(entryId, key) {
    return this.get(entryId) === key;
  },

  // Restore reaksi ke semua entries yang di-render
  // Panggil setelah renderSpills() / renderEntries()
  restoreAll(entries) {
    const data = this._load();
    entries.forEach(entry => {
      const userReaction = data[entry.id] || null;
      if (userReaction) {
        entry.userReacted = userReaction;
      }
    });
    return entries;
  },
};

window.JEJAKReactions = JEJAK_REACTIONS;

// ── FIX #8: PARALLEL UPLOAD WITH PROGRESS ───────────────────
const JEJAK_UPLOAD = {

  // Upload multiple files secara parallel (max batch 3 sekaligus)
  // untuk menghindari rate limit Supabase Storage
  async uploadParallel(files, supabaseClient, userId, options = {}) {
    const {
      bucket = 'artefacts',
      onProgress = () => {},    // callback(percent, current, total)
      onFileSuccess = () => {}, // callback(result, index)
      onFileError = () => {},   // callback(error, index)
      batchSize = 3,            // max concurrent uploads
    } = options;

    const total = files.length;
    let completed = 0;
    const results = [];

    // Bagi files ke batches
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);

      // Upload batch secara parallel
      const batchResults = await Promise.allSettled(
        batch.map((item, batchIdx) => {
          const globalIdx = i + batchIdx;
          return this._uploadSingle(item, supabaseClient, userId, bucket)
            .then(result => {
              completed++;
              onProgress(Math.round((completed / total) * 100), completed, total);
              onFileSuccess(result, globalIdx);
              return result;
            })
            .catch(err => {
              completed++;
              onProgress(Math.round((completed / total) * 100), completed, total);
              onFileError(err, globalIdx);
              throw err;
            });
        })
      );

      results.push(...batchResults);
    }

    return results;
  },

  async _uploadSingle(item, supabaseClient, userId, bucket) {
    const file = item.file;
    const rawExt = file.name.includes('.')
      ? file.name.split('.').pop().toLowerCase()
      : '';
    const ext = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(rawExt)
      ? rawExt
      : 'jpg';
    const mimeType = file.type || ('image/' + ext);
    const timestamp = Date.now() + Math.random(); // avoid collision in parallel
    const storagePath = `${Math.floor(timestamp)}_${userId.substring(0, 8)}_${Math.random().toString(36).substring(2, 7)}.${ext}`;

    const uploadResult = await supabaseClient
      .storage
      .from(bucket)
      .upload(storagePath, file, { contentType: mimeType, upsert: false });

    if (uploadResult.error) throw uploadResult.error;

    const urlResult = supabaseClient.storage.from(bucket).getPublicUrl(storagePath);

    return {
      url: urlResult.data.publicUrl,
      path: storagePath,
      note: item.note || 'memory',
      hasFace: item.hasFace || false,
      theme: item.theme || 'fm',
    };
  },
};

window.JEJAKUpload = JEJAK_UPLOAD;

// ── FIX #6: GRACEFUL ERROR HANDLING ─────────────────────────
const JEJAK_ERROR = {
  _offlineBanner: null,
  _retryQueue: [],
  _isOnline: navigator.onLine,

  init() {
    // Buat offline banner kalau belum ada
    if (!document.getElementById('jejak-offline-banner')) {
      const banner = document.createElement('div');
      banner.id = 'jejak-offline-banner';
      banner.className = 'offline-banner';
      banner.textContent = '⚡ Koneksi terputus — beberapa fitur mungkin tidak berfungsi';
      document.body.prepend(banner);
      this._offlineBanner = banner;
    } else {
      this._offlineBanner = document.getElementById('jejak-offline-banner');
    }

    // Listen untuk online/offline events
    window.addEventListener('online', () => {
      this._isOnline = true;
      if (this._offlineBanner) this._offlineBanner.classList.remove('show');
      this._flushRetryQueue();
    });

    window.addEventListener('offline', () => {
      this._isOnline = false;
      if (this._offlineBanner) this._offlineBanner.classList.add('show');
    });

    // Cek status awal
    if (!navigator.onLine && this._offlineBanner) {
      this._offlineBanner.classList.add('show');
    }
  },

  // Retry wrapper — coba ulang operasi async sampai maxRetries kali
  async withRetry(fn, options = {}) {
    const {
      maxRetries = 3,
      delay = 1000,       // ms antara retry
      backoff = 2,        // multiplier untuk exponential backoff
      onRetry = () => {}, // callback(attempt, error)
    } = options;

    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err;
        if (attempt < maxRetries) {
          onRetry(attempt, err);
          await new Promise(r => setTimeout(r, delay * Math.pow(backoff, attempt - 1)));
        }
      }
    }
    throw lastError;
  },

  // Handle Supabase error dengan pesan yang user-friendly
  handleSupabaseError(err, context = '') {
    const msg = err?.message || err?.error_description || 'Terjadi kesalahan';

    // Map error codes ke pesan Indonesia yang friendly
    const errorMap = {
      'JWT expired':                'Sesi kamu sudah habis, silakan login ulang',
      'Invalid API key':            'Konfigurasi error — hubungi admin',
      'relation does not exist':    'Database error — hubungi admin',
      'violates row-level security':'Kamu tidak punya akses ke data ini',
      'duplicate key value':        'Data ini sudah ada',
      'value too long':             'Teks terlalu panjang',
      'Failed to fetch':            'Gagal terhubung ke server',
      'NetworkError':               'Koneksi internet bermasalah',
    };

    for (const [key, friendly] of Object.entries(errorMap)) {
      if (msg.includes(key)) {
        console.warn(`[${context || 'SUPABASE'}]`, msg);
        return friendly;
      }
    }

    console.error(`[${context || 'SUPABASE'}] Unhandled error:`, err);
    return 'Terjadi kesalahan, coba lagi';
  },
};

// Auto-init error handler saat DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => JEJAK_ERROR.init());
} else {
  JEJAK_ERROR.init();
}

window.JEJAKError = JEJAK_ERROR;

// ── FIX #4: CLIENT-SIDE RATE LIMITING ───────────────────────
const JEJAK_RATE = {
  _limits: {},

  // Check apakah action boleh dilakukan
  // key: identifier unik, limit: max kali, windowMs: durasi window
  check(key, limit = 10, windowMs = 60000) {
    const now = Date.now();
    if (!this._limits[key]) {
      this._limits[key] = { count: 0, resetAt: now + windowMs };
    }

    const entry = this._limits[key];

    // Reset kalau window sudah lewat
    if (now > entry.resetAt) {
      entry.count = 0;
      entry.resetAt = now + windowMs;
    }

    if (entry.count >= limit) {
      const remaining = Math.ceil((entry.resetAt - now) / 1000);
      return { allowed: false, remaining, message: `Terlalu sering, coba lagi dalam ${remaining} detik` };
    }

    entry.count++;
    return { allowed: true, remaining: null, message: null };
  },

  // Preset limits untuk action-action umum
  presets: {
    spill:    { limit: 5,  windowMs: 60000  },  // 5 spill per menit
    upload:   { limit: 6,  windowMs: 300000 },  // 6 upload per 5 menit
    react:    { limit: 30, windowMs: 60000  },  // 30 reaksi per menit
    chat:     { limit: 20, windowMs: 60000  },  // 20 chat messages per menit
    whisper:  { limit: 10, windowMs: 300000 },  // 10 whisper per 5 menit
  },

  checkPreset(action) {
    const preset = this.presets[action];
    if (!preset) return { allowed: true };
    return this.check(`jejak_rl_${action}`, preset.limit, preset.windowMs);
  },
};

window.JEJAKRate = JEJAK_RATE;

console.log('%c[JEJAK] shared-utils.js loaded', 'color:#bfff00;font-weight:bold');
