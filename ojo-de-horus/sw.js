// Service worker: keeps the game playable offline. Bump CACHE when you publish changes.
const CACHE = "ojo-publica-1.0.2";
const ASSETS = ["./", "index.html", "manifest.webmanifest", "og.png", "fonts/marcellus-latin-400-normal.woff2", "fonts/outfit-latin-500-normal.woff2", "fonts/outfit-latin-700-normal.woff2", "fonts/outfit-latin-800-normal.woff2", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "icons/apple-touch-icon.png", "icons/favicon-32.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith("ojo-publica-") && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
// Same-origin files only (ads and other services always go to the network).
// Serve from cache at once and refresh the copy in the background.
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async cache => {
    const hit = await cache.match(req, { ignoreSearch: true });
    const net = fetch(req).then(res => { if (res.ok) cache.put(req, res.clone()); return res; }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    const res = await net;
    return res || (req.mode === "navigate" ? cache.match("index.html") : Response.error());
  }));
});
