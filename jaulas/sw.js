// Jaulas: funciona sin conexión. Al cambiar cualquier archivo, sube la versión de CACHE.
const CACHE = 'jaulas-v2';
const ASSETS = ['./', 'index.html', 'manifest.webmanifest', 'fonts/shippori-mincho-latin-600-normal.woff2', 'fonts/shippori-mincho-latin-800-normal.woff2', 'fonts/zen-kaku-gothic-new-latin-500-normal.woff2', 'fonts/zen-kaku-gothic-new-latin-700-normal.woff2', 'fonts/shippori-mincho-kanji-600-0.woff2', 'fonts/shippori-mincho-kanji-600-1.woff2', 'fonts/shippori-mincho-kanji-600-2.woff2', 'fonts/shippori-mincho-kanji-800-0.woff2', 'fonts/shippori-mincho-kanji-800-1.woff2', 'fonts/shippori-mincho-kanji-800-2.woff2', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png', 'icons/favicon-64.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('jaulas-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(caches.match(r, { ignoreSearch: true }).then(hit => hit || fetch(r).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)); }
    return res;
  }).catch(() => caches.match('index.html'))));
});
