// Cuatro Colores: funciona sin conexión. Al cambiar cualquier archivo, sube la versión de CACHE.
const CACHE = 'cuatro-colores-v1';
const ASSETS = ["./", "index.html", "manifest.webmanifest", "css/fonts.css", "css/style.css", "js/app.js", "js/d3-array.min.js", "js/d3-geo.min.js", "js/i18n.js", "js/topojson-client.min.js", "data/muni.json.gz", "data/world.json.gz", "fonts/dm-mono-latin-400-normal.woff2", "fonts/dm-mono-latin-500-normal.woff2", "fonts/dm-mono-latin-ext-400-normal.woff2", "fonts/dm-mono-latin-ext-500-normal.woff2", "fonts/figtree-latin-400-normal.woff2", "fonts/figtree-latin-500-normal.woff2", "fonts/figtree-latin-600-normal.woff2", "fonts/figtree-latin-700-normal.woff2", "fonts/figtree-latin-ext-400-normal.woff2", "fonts/figtree-latin-ext-500-normal.woff2", "fonts/figtree-latin-ext-600-normal.woff2", "fonts/figtree-latin-ext-700-normal.woff2", "fonts/im-fell-english-latin-400-italic.woff2", "fonts/im-fell-english-sc-latin-400-normal.woff2", "fonts/pt-serif-cyrillic-400-italic.woff2", "fonts/pt-serif-cyrillic-400-normal.woff2", "fonts/pt-serif-cyrillic-ext-400-italic.woff2", "fonts/pt-serif-cyrillic-ext-400-normal.woff2", "fonts/pt-serif-latin-400-italic.woff2", "fonts/pt-serif-latin-400-normal.woff2", "fonts/pt-serif-latin-ext-400-italic.woff2", "fonts/pt-serif-latin-ext-400-normal.woff2", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png", "icons/favicon-64.png"];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('cuatro-colores-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(caches.match(r, { ignoreSearch: true }).then(hit => hit || fetch(r).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)); }
    return res;
  }).catch(() => caches.match('index.html'))));
});
