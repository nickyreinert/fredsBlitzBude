/* ================================================================
   Freds Blitz-Bude – Service Worker
  Strategie: Network-First für HTML/CSS/JS, Cache-First für Rest
   Cache-Name: freds-blitz-bude-v2
   ================================================================ */

'use strict';

// Cache-Name und Version – bei Updates hier hochzählen
const CACHE_NAME = 'freds-blitz-bude-v5';

// Basis-Pfad der App ermitteln, damit die PWA auch unter Unterpfaden funktioniert
const APP_PREFIX = self.location.pathname.replace(/service-worker\.js$/, '');

// Alle Dateien die beim Install gecacht werden sollen
const ASSETS_ZU_CACHEN = [
  `${APP_PREFIX}`,
  `${APP_PREFIX}index.html`,
  `${APP_PREFIX}style.css`,
  `${APP_PREFIX}manifest.json`,
  `${APP_PREFIX}icon-192.png`,
  `${APP_PREFIX}icon-512.png`,
  // Konfiguration und Grundlagen
  `${APP_PREFIX}js/config.js`,
  `${APP_PREFIX}js/state.js`,
  `${APP_PREFIX}js/utils.js`,
  // Canvas
  `${APP_PREFIX}js/canvas/setup.js`,
  `${APP_PREFIX}js/canvas/himmel.js`,
  `${APP_PREFIX}js/canvas/boden.js`,
  `${APP_PREFIX}js/canvas/stand.js`,
  `${APP_PREFIX}js/canvas/produkte.js`,
  `${APP_PREFIX}js/canvas/figuren.js`,
  `${APP_PREFIX}js/canvas/spielwelt.js`,
  `${APP_PREFIX}js/canvas/uhr.js`,
  // UI
  `${APP_PREFIX}js/ui/screens.js`,
  `${APP_PREFIX}js/ui/meldung.js`,
  `${APP_PREFIX}js/ui/hud.js`,
  `${APP_PREFIX}js/ui/inventar.js`,
  `${APP_PREFIX}js/ui/intro.js`,
  `${APP_PREFIX}js/ui/preispopup.js`,
  `${APP_PREFIX}js/ui/wechselgeld.js`,
  `${APP_PREFIX}js/ui/grossmarkt.js`,
  `${APP_PREFIX}js/ui/einstellungen.js`,
  `${APP_PREFIX}js/ui/zubehoer.js`,
  // Logik
  `${APP_PREFIX}js/logik/bewertung.js`,
  `${APP_PREFIX}js/logik/trinkgeld.js`,
  `${APP_PREFIX}js/logik/verderb.js`,
  `${APP_PREFIX}js/logik/zeit.js`,
  `${APP_PREFIX}js/logik/speichern.js`,
  `${APP_PREFIX}js/logik/kunden.js`,
  `${APP_PREFIX}js/logik/passanten.js`,
  `${APP_PREFIX}js/logik/tag.js`,
  // Erfahrung, Animation, Init
  `${APP_PREFIX}js/erfahrung.js`,
  `${APP_PREFIX}js/animation.js`,
  `${APP_PREFIX}js/init.js`,
];

/* ── Install-Event: Assets vorab cachen ─────────────────────── */
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Install – Cache wird befüllt');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[ServiceWorker] Caching Assets...');
        return cache.addAll(ASSETS_ZU_CACHEN);
      })
      .then(() => {
        // Sofort aktivieren, nicht auf alten SW warten
        return self.skipWaiting();
      })
      .catch(err => {
        console.error('[ServiceWorker] Fehler beim Caching:', err);
      })
  );
});

/* ── Activate-Event: Alten Cache aufräumen ──────────────────── */
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activate – Alte Caches werden entfernt');

  event.waitUntil(
    caches.keys()
      .then(cacheNamen => {
        // Alle Caches löschen, die nicht dem aktuellen Namen entsprechen
        return Promise.all(
          cacheNamen
            .filter(name => name !== CACHE_NAME)
            .map(name => {
              console.log('[ServiceWorker] Lösche alten Cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        // Sofort alle Clients übernehmen
        return self.clients.claim();
      })
  );
});

/* ── Fetch-Event: Cache-First Strategie ─────────────────────── */
self.addEventListener('fetch', event => {
  // Nur GET-Anfragen cachen
  if (event.request.method !== 'GET') return;

  // Nur lokale Anfragen behandeln (keine externen APIs)
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  const istKritischeDatei =
    event.request.mode === 'navigate' ||
    event.request.destination === 'document' ||
    event.request.destination === 'style' ||
    event.request.destination === 'script';

  if (istKritischeDatei) {
    // Für HTML/CSS/JS immer zuerst Netzwerk versuchen,
    // damit normale Reloads sofort neue UI bekommen.
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          const responseZumCachen = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseZumCachen));
          return networkResponse;
        })
        .catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match(`${APP_PREFIX}index.html`);
          }
          return caches.match(event.request);
        })
    );
    return;
  }

  // Für restliche Assets: Cache-First (schnell/offline-freundlich)
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) return cachedResponse;

        return fetch(event.request)
          .then(networkResponse => {
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            const responseZumCachen = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseZumCachen));
            return networkResponse;
          })
          .catch(() => {
            if (event.request.mode === 'navigate') {
              return caches.match(`${APP_PREFIX}index.html`);
            }
            return caches.match(event.request);
          });
      })
  );
});

/* ── Message-Event: Manuelles Cache-Update ermöglichen ──────── */
self.addEventListener('message', event => {
  if (event.data && event.data.typ === 'CACHE_LEEREN') {
    console.log('[ServiceWorker] Cache wird manuell geleert');
    caches.delete(CACHE_NAME).then(() => {
      event.ports[0].postMessage({ status: 'ok' });
    });
    return;
  }

  if (event.data && event.data.typ === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
