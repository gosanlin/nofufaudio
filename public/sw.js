/* ═══════════════════════════════════════════════
   NOFUFAUDIO — Service Worker (PWA)
   Cache-first para assets estáticos,
   network-first para peticiones de API.
═══════════════════════════════════════════════ */

const CACHE_NAME   = 'nofufaudio-v1';
const API_PREFIX   = '/api/';

// Assets que se precargan en el install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/electron-api-adapter.js',
  '/manifest.json',
];

// ── INSTALL ──────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // addAll falla silenciosamente si algún recurso no existe aún
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('[SW] Precache parcial:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// ── ACTIVATE ─────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Limpiar cachés antiguas
      caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      ),
      // FIX: Habilitar navigation preload para evitar el warning
      // "preloadResponse settled before respondWith" en el fetch handler
      self.registration.navigationPreload?.enable?.(),
    ]).then(() => self.clients.claim())
  );
});

// ── FETCH ─────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo interceptamos same-origin
  if (url.origin !== self.location.origin) return;

  // API → network-first (sin cachear)
  if (url.pathname.startsWith(API_PREFIX)) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(JSON.stringify({ error: 'Sin conexión' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    );
    return;
  }

  // Navegación → usar preloadResponse si está disponible, luego cache, luego red
  // FIX: envolver preloadResponse en waitUntil+respondWith para evitar el warning
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // Intentar navigation preload primero (más rápido)
          const preloaded = await event.preloadResponse;
          if (preloaded) return preloaded;
        } catch (_) { /* ignorar */ }
        // Fallback: red → cache
        try {
          const networkRes = await fetch(request);
          if (networkRes && networkRes.status === 200) {
            const toCache = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, toCache));
          }
          return networkRes;
        } catch (_) {
          const cached = await caches.match('/index.html');
          return cached || new Response('Offline', { status: 503 });
        }
      })()
    );
    return;
  }

  // Assets estáticos → cache-first, fallback a network
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).then((response) => {
        // Solo cacheamos respuestas válidas y GET
        if (
          !response ||
          response.status !== 200 ||
          response.type === 'opaque' ||
          request.method !== 'GET'
        ) {
          return response;
        }

        const toCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, toCache));
        return response;
      });
    }).catch(() => {
      if (request.mode === 'navigate') {
        return caches.match('/index.html');
      }
    })
  );
});

// ── MENSAJES desde el cliente ─────────────────────
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});