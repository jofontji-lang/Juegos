const CACHE='mimizu-v2';
const ASSETS=['./','index.html','manifest.webmanifest','privacidad.html',
 'fonts/bricolage-grotesque-latin-400-normal.woff2','fonts/bricolage-grotesque-latin-600-normal.woff2','fonts/bricolage-grotesque-latin-800-normal.woff2',
 'icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(hit=>hit||fetch(r).then(res=>{
    const copy=res.clone();caches.open(CACHE).then(c=>c.put(r,copy));return res;
  }).catch(()=>caches.match('index.html'))));
});