const CACHE_NAME = 'angelus-v1';

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll([
                '/',
                '/index.html',
                '/manifest.json'
            ]).catch(() => {});
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(names => {
            return Promise.all(names.map(name => {
                if (name !== CACHE_NAME) return caches.delete(name);
            }));
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then(response => {
            if (response) return response;

            return fetch(event.request).then(response => {
                if (!response || response.status !== 200 || response.type === 'error') return response;

                const cache_response = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, cache_response);
                });
                return response;
            }).catch(() => {
                return new Response('Offline', { status: 503 });
            });
        })
    );
});

self.addEventListener('message', event => {
    if (event.data?.type === 'SHOW_NOTIFICATION') {
        const { title, body } = event.data;
        self.registration.showNotification(title, {
            body: body,
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%231e3a8a" width="192" height="192" rx="45"/><text x="50%" y="55%" font-size="100" font-family="Arial" fill="white" text-anchor="middle" dominant-baseline="middle">🙏</text></svg>',
            badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%231e3a8a" width="192" height="192"/><text x="50%" y="50%" font-size="90" font-family="Arial" fill="white" text-anchor="middle" dominant-baseline="middle">🙏</text></svg>',
            requireInteraction: true,
            vibrate: [200, 100, 200]
        });
    }
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(list => {
            for (let client of list) {
                if (client.url === '/' && 'focus' in client) return client.focus();
            }
            if (clients.openWindow) return clients.openWindow('/');
        })
    );
});
