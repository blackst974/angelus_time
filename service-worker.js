// =============================================
// SERVICE WORKER — Angélus Time v1.5
// =============================================
const STATIC_CACHE = 'angelus-static-v1.5';
const AUDIO_CACHE  = 'angelus-audio-v1.0';

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Poppins:wght@300;400;500;600&display=swap'
];

// ── Installation ──────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── Activation ────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => ![STATIC_CACHE, AUDIO_CACHE].includes(k))
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch ─────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.destination === 'audio' || url.pathname.endsWith('.mp3')) {
    event.respondWith(
      caches.open(AUDIO_CACHE).then(cache =>
        cache.match(request).then(cached => {
          if (cached) return cached;
          return fetch(request).then(res => {
            if (res.ok) cache.put(request, res.clone());
            return res;
          });
        })
      )
    );
    return;
  }

  if (url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com') {
    event.respondWith(
      caches.open(STATIC_CACHE).then(cache =>
        cache.match(request).then(cached => {
          const net = fetch(request).then(res => { if (res.ok) cache.put(request, res.clone()); return res; });
          return cached || net;
        })
      )
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then(res => {
        if (res.ok) caches.open(STATIC_CACHE).then(c => c.put(request, res.clone()));
        return res;
      })
      .catch(() => caches.match(request).then(c => c || caches.match('./index.html')))
  );
});

// ── Horloge de rappels (cœur du système) ──────
// Les horaires sont stockés ici dans le SW, persistants entre les visites
let schedules = {}; // { matin: {enabled, time}, angelus: {…}, soir: {…} }
let clockInterval = null;

const LABELS = {
  matin:   'Prière du Matin ☀️',
  angelus: "L'Angélus 🙏",
  soir:    'Prière du Soir 🌙'
};

function startClock() {
  if (clockInterval) return; // déjà lancée
  // Vérifie toutes les 30 secondes — compromis fiabilité/batterie
  clockInterval = setInterval(checkSchedules, 30_000);
  console.log('[SW] Horloge de rappels démarrée');
}

function checkSchedules() {
  const now = new Date();
  const hh  = String(now.getHours()).padStart(2, '0');
  const mm  = String(now.getMinutes()).padStart(2, '0');
  const currentTime = `${hh}:${mm}`;

  Object.entries(schedules).forEach(([section, notif]) => {
    if (!notif.enabled || !notif.time) return;
    if (notif.time !== currentTime) return;
    // Évite le double-déclenchement dans la même minute
    const lastKey = `last_${section}`;
    if (schedules[lastKey] === currentTime) return;
    schedules[lastKey] = currentTime;

    fireNotification(section, notif.time);
  });
}

function fireNotification(section, time) {
  const title = '🙏 Angélus Time';
  const body  = `Il est ${time} — ${LABELS[section]}`;

  self.registration.showNotification(title, {
    body,
    icon:             './icons/icon-192.png',
    badge:            './icons/icon-96.png',
    tag:              `angelus-${section}`,
    renotify:         true,
    requireInteraction: false,
    vibrate:          [200, 100, 200],
    data:             { section, url: `./index.html#${section}` },
    actions: [
      { action: 'open',    title: '🙏 Prier maintenant' },
      { action: 'dismiss', title: 'Plus tard'           }
    ]
  }).catch(err => console.warn('[SW] Notification échouée:', err));
}

// ── Messages depuis la page ────────────────────
self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data) return;

  if (data.type === 'SET_SCHEDULES') {
    // La page envoie les préférences utilisateur
    schedules = { ...schedules, ...data.schedules };
    startClock();
    console.log('[SW] Horaires reçus:', data.schedules);
  }

  // Compatibilité ancienne API (notification directe depuis la page)
  if (data.type === 'SHOW_NOTIFICATION') {
    fireNotification(data.section, data.body?.match(/\d{2}:\d{2}/)?.[0] || '');
  }
});

// ── Clic sur notification ─────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  const section = event.notification.data?.section || 'matin';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if ('focus' in client) {
          client.postMessage({ type: 'NAVIGATE', section });
          return client.focus();
        }
      }
      return clients.openWindow(`./index.html#${section}`);
    })
  );
});

// Lance l'horloge immédiatement au démarrage du SW
// (utile si le SW redémarre après avoir été mis en veille)
startClock();
