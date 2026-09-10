// Service worker del juego Mondrian.
//
// Estrategia elegida a propósito:
//   - La página: primero la red, y solo si no hay conexión se usa la copia.
//     Así una versión nueva subida a GitHub se ve al instante, sin que haya
//     que borrar la caché del navegador.
//   - Iconos y manifiesto: primero la copia, que no cambian.
//   - Clasificación y contadores: nunca se guardan. Son datos vivos.

const VERSION = 'mondrian-v1';
const ESTATICOS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable.png'
];

self.addEventListener('install', evento => {
  evento.waitUntil(
    caches.open(VERSION)
      .then(c => c.addAll(ESTATICOS))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener('activate', evento => {
  evento.waitUntil(
    caches.keys()
      .then(claves => Promise.all(
        claves.filter(k => k !== VERSION).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', evento => {
  const peticion = evento.request;
  if (peticion.method !== 'GET') return;

  const url = new URL(peticion.url);

  // Datos vivos: que pasen de largo. Nunca se guardan en caché.
  if (url.hostname.indexOf('script.google.com') >= 0 ||
      url.hostname.indexOf('ipwho.is') >= 0 ||
      url.hostname.indexOf('ipapi.co') >= 0 ||
      url.hostname.indexOf('geojs.io') >= 0) {
    return;
  }

  // La página: red primero, copia como respaldo.
  if (peticion.mode === 'navigate' || url.pathname.endsWith('/') ||
      url.pathname.endsWith('index.html')) {
    evento.respondWith(
      fetch(peticion)
        .then(res => {
          const copia = res.clone();
          caches.open(VERSION).then(c => c.put('./index.html', copia)).catch(() => {});
          return res;
        })
        .catch(() => caches.match('./index.html').then(r => r || caches.match('./')))
    );
    return;
  }

  // Lo demás: copia primero.
  evento.respondWith(
    caches.match(peticion).then(guardada => {
      if (guardada) return guardada;
      return fetch(peticion).then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copia = res.clone();
          caches.open(VERSION).then(c => c.put(peticion, copia)).catch(() => {});
        }
        return res;
      });
    })
  );
});
