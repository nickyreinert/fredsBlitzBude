/* ================================================================
   Freds Gemüse-Laden – Service Worker
   Strategie: Cache-First für alle lokalen Assets
   Cache-Name: freds-laden-v2
   ================================================================ */

'use strict';

// Cache-Name und Version – bei Updates hier hochzählen
const CACHE_NAME = 'freds-laden-v2';

// Basis-Pfad der App ermitteln, damit die PWA auch unter Unterpfaden funktioniert
const APP_PREFIX = self.location.pathname.replace(/service-worker\.js$/, '');

// Alle Dateien die beim Install gecacht werden sollen
const ASSETS_ZU_CACHEN = [
  `${APP_PREFIX}`,
  `${APP_PREFIX}index.html`,
  `${APP_PREFIX}style.css`,
  `${APP_PREFIX}game.js`,
  `${APP_PREFIX}manifest.json`,
  `${APP_PREFIX}icon-192.png`,
  `${APP_PREFIX}icon-512.png`,
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

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Cache-Hit: direkt aus Cache liefern
        if (cachedResponse) {
          console.log('[ServiceWorker] Aus Cache geladen:', event.request.url);
          return cachedResponse;
        }

        // Cache-Miss: Netzwerk anfragen und im Cache speichern
        console.log('[ServiceWorker] Vom Netzwerk laden:', event.request.url);
        return fetch(event.request)
          .then(networkResponse => {
            // Nur gültige Antworten cachen
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Response klonen (da sie nur einmal gelesen werden kann)
            const responseZumCachen = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseZumCachen);
              });

            return networkResponse;
          })
          .catch(() => {
            // Offline-Fallback: index.html zurückgeben wenn vorhanden
            console.warn('[ServiceWorker] Offline – Fallback auf index.html');

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
  }
});
