// JEJAK Service Worker v2
// PENTING: HTML pages = network-only (tidak pernah di-cache)
// Mencegah session user A muncul di device B

const CACHE = 'jejak-assets-v2';

// Hanya static assets yang di-cache — BUKAN HTML
const STATIC_ASSETS = [
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/shared-constants.js',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // 1. HTML — SELALU network, tidak pernah cache (session safety)
  if(e.request.destination === 'document' ||
     url.pathname.endsWith('.html') ||
     url.pathname === '/') {
    e.respondWith(
      fetch(e.request).catch(() => new Response(
        '<html><body style="background:#080808;color:#555;font-family:monospace;display:flex;align-items:center;justify-content:center;height:100vh;margin:0"><div style="text-align:center"><div style="font-size:32px;margin-bottom:16px">📡</div><div>JEJAK offline</div><div style="font-size:12px;margin-top:8px;color:#333">sambungkan internet dan refresh</div></div></body></html>',
        { headers: { 'Content-Type': 'text/html' } }
      ))
    );
    return;
  }

  // 2. Supabase API — selalu network, jangan cache data user
  if(url.hostname.includes('supabase.co')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // 3. Static assets (icons, js) — cache first
  if(STATIC_ASSETS.some(a => url.pathname === a)) {
    e.respondWith(
      caches.match(e.request).then(cached => cached ||
        fetch(e.request).then(res => {
          caches.open(CACHE).then(c => c.put(e.request, res.clone()));
          return res;
        })
      )
    );
    return;
  }

  // 4. Lainnya — network only
  e.respondWith(fetch(e.request));
});
