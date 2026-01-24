const CACHE_NAME = 'angelus-time-v1';
const URLS_TO_CACHE = [
  '/angelus_time/',
  '/angelus_time/index.html',
  '/angelus_time/manifest.json',
  '/angelus_time/service-worker.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(URLS_TO_CACHE).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response;
        
        return fetch(event.request)
          .then(response => {
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }
            
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseToCache))
              .catch(() => {});
            
            return response;
          })
          .catch(() => new Response('Offline - Service unavailable', { status: 503 }));
      })
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body } = event.data;
    
    self.registration.showNotification(title, {
      body: body,
      icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%231e3a8a" width="192" height="192" rx="45"/><text x="50%" y="55%" font-size="100" font-family="Arial" fill="white" text-anchor="middle" dominant-baseline="middle">🙏</text></svg>',
      badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%231e3a8a" width="192" height="192"/><text x="50%" y="50%" font-size="90" font-family="Arial" fill="white" text-anchor="middle" dominant-baseline="middle">🙏</text></svg>',
      requireInteraction: true,
      vibrate: [200, 100, 200],
      tag: 'angelus-notification'
    });
  }
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        for (let client of clientList) {
          if (client.url.includes('/angelus_time/')) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/angelus_time/');
        }
      })
  );
});
