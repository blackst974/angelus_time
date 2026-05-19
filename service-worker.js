// =============================================
// SERVICE WORKER — Angélus Time
// =============================================
const CACHE_NAME = 'angelus-time-v1.3';
const STATIC_CACHE = 'angelus-static-v1.3';
const AUDIO_CACHE  = 'angelus-audio-v1.0';

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Poppins:wght@300;400;500;600&display=swap'
];

const AUDIO_ASSETS = [
  './morning-prayer.mp3',
  './angelus-traditional.mp3',
  './angelus-chant.mp3',
  './evening-prayer.mp3'
];

// ── Installation ──────────────────────────────
self.addEventListener('install', (event) => {
  console.log('[SW] Installing…');
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      caches.open(AUDIO_CACHE).then(cache => {
        console.log('[SW] Pre-caching audio files (best-effort)');
        // Best-effort : on ne bloque pas l'installation si les MP3 manquent
        return Promise.allSettled(
          AUDIO_ASSETS.map(url => cache.add(url).catch(e => console.warn('[SW] Audio not cached:', url, e)))
        );
      })
    ]).then(() => self.skipWaiting())
  );
});

// ── Activation / nettoyage des anciens caches ─
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating…');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => ![STATIC_CACHE, AUDIO_CACHE].includes(key))
          .map(key => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ── Stratégie de fetch ────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Fichiers audio → Cache-first avec fallback réseau
  if (request.destination === 'audio' || url.pathname.endsWith('.mp3')) {
    event.respondWith(
      caches.open(AUDIO_CACHE).then(cache =>
        cache.match(request).then(cached => {
          if (cached) return cached;
          return fetch(request).then(response => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          });
        })
      )
    );
    return;
  }

  // Polices Google Fonts → Stale-while-revalidate
  if (url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com') {
    event.respondWith(
      caches.open(STATIC_CACHE).then(cache =>
        cache.match(request).then(cached => {
          const networkFetch = fetch(request).then(response => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          });
          return cached || networkFetch;
        })
      )
    );
    return;
  }

  // Tout le reste → Network-first avec fallback cache
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then(cache => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request).then(cached => cached || caches.match('./index.html')))
  );
});

// ── Notifications push ────────────────────────
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, section } = event.data;
    const options = {
      body,
      icon: './icons/icon-192.png',
      badge: './icons/icon-96.png',
      tag: `angelus-${section}`,
      renotify: true,
      requireInteraction: false,
      vibrate: [200, 100, 200],
      data: { section, url: `./index.html#${section}` },
      actions: [
        { action: 'open', title: '🙏 Prier maintenant' },
        { action: 'dismiss', title: 'Plus tard' }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const section = event.notification.data?.section || 'matin';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.postMessage({ type: 'NAVIGATE', section });
          return client.focus();
        }
      }
      return clients.openWindow(`./index.html#${section}`);
    })
  );
});
