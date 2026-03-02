// ============================================================
// JEJAK — shared-constants.js
// Satu sumber kebenaran untuk semua session keys & utils
// Include di semua halaman SEBELUM script lain:
// <script src="/shared-constants.js"></script>
// ============================================================

// ── SESSION KEYS — jangan ubah tanpa update semua halaman ──
const JEJAK = {
  // localStorage keys
  SK: {
    uid:      'jejak_uid',        // user UUID dari Supabase profiles.id
    username: 'jejak_username',   // display username e.g. "es.titi"
    loggedIn: 'jejak_logged_in',  // 'true' / null
    sessionId:'jejak_session_id', // device fingerprint / session sig
    vibe:     'jejak_vibe',       // tema warna: cyber/neon/retro/pastel
    sub:      'jejak_sub',        // JSON subscription object
  },

  // Supabase config — anon key aman di client, RLS yang jaga
  SUPABASE_URL: 'https://fuovfrdicdhnlymnacpz.supabase.co',
  SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1b3ZmcmRpY2Robmx5bW5hY3B6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMjYxMzEsImV4cCI6MjA4MjYwMjEzMX0.oX4fVTEIWiRG2NaNJJKOV8dTnSHWhicLVMIFzZUl1o0',

  // ── SESSION HELPERS ──────────────────────────────────────

  getSession() {
    return {
      uid:      localStorage.getItem(this.SK.uid),
      username: localStorage.getItem(this.SK.username),
      loggedIn: localStorage.getItem(this.SK.loggedIn) === 'true',
      sessionId:localStorage.getItem(this.SK.sessionId),
    };
  },

  saveSession(username, uid, fingerprint) {
    if(!uid || uid.length < 10) throw new Error('uid tidak valid: ' + uid);
    localStorage.setItem(this.SK.uid,      uid);
    localStorage.setItem(this.SK.username, username);
    localStorage.setItem(this.SK.loggedIn, 'true');
    if(fingerprint) localStorage.setItem(this.SK.sessionId, fingerprint);
    console.log('%c[JEJAK] Session saved', 'color:#bfff00;font-weight:bold',
      { username, uid: uid.substring(0,8)+'...' });
  },

  clearSession(reason) {
    Object.values(this.SK).forEach(k => {
      // jangan hapus vibe preference & sub
      if(k !== this.SK.vibe && k !== this.SK.sub) localStorage.removeItem(k);
    });
    // juga bersihkan key lama dari versi sebelumnya
    ['user_id','jejak_user_id','uid','sb_user_id',
     'username','user_name','uname','jejak_logged_in'].forEach(k =>
      localStorage.removeItem(k));
    if(reason) console.warn('[JEJAK] Session cleared:', reason);
  },

  isLoggedIn() {
    const s = this.getSession();
    return s.loggedIn && !!s.uid && !!s.username;
  },

  // ── AUTH GUARD — redirect ke index kalau belum login ────
  requireAuth() {
    if(!this.isLoggedIn()) {
      console.warn('[JEJAK] Auth guard — redirecting to index');
      window.location.replace('/index.html');
      return false;
    }
    return true;
  },

  // ── SUBSCRIPTION ────────────────────────────────────────
  getSub() {
    try {
      const s = JSON.parse(localStorage.getItem(this.SK.sub) || 'null');
      if(s && new Date(s.expiresAt) > new Date()) return s;
      localStorage.removeItem(this.SK.sub);
      return null;
    } catch(e) { return null; }
  },

  saveSub(subObj) {
    localStorage.setItem(this.SK.sub, JSON.stringify(subObj));
  },

  checkSub() {
    const s = this.getSub();
    return !!(s && s.isActive);
  },
};

// Freeze supaya tidak bisa di-overwrite dari luar
Object.freeze(JEJAK.SK);

// ── FORCE CLEAR SESSION LAMA — one-time wipe ──────────────
// Hapus semua key dari versi sebelumnya supaya tidak konflik
// User perlu login ulang — ini intentional untuk fresh start
(function forceClearLegacySessions(){
  const WIPE_VERSION = 'jejak_wipe_v2'; // naikkan versi ini kalau perlu wipe lagi
  if(localStorage.getItem(WIPE_VERSION)) return; // sudah pernah wipe, skip

  // Hapus semua key lama yang pernah dipakai
  const legacyKeys = [
    'user_id', 'jejak_user_id', 'uid', 'sb_user_id', 'supabase_uid',
    'username', 'user_name', 'uname',
    'jejak_logged_in',
    'jejak_session_id',
    // key baru juga di-clear supaya benar-benar fresh
    'jejak_uid', 'jejak_username',
  ];
  legacyKeys.forEach(k => localStorage.removeItem(k));

  // Tandai bahwa wipe sudah dilakukan
  localStorage.setItem(WIPE_VERSION, '1');
  console.log('%c[JEJAK] Session lama dihapus — silakan login ulang', 'color:#ff9f0a;font-weight:bold');
})();
