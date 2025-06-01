const CACHE_NAME = 'flight-report-v2'; // Update version for cache refresh
const urlsToCache = [
    '/',
    '/index.html',
    '/output.css',
    '/icon.png',
    '/manifest.json',
    '/script.js',
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
            .then(() => self.skipWaiting())
            .catch(err => console.error('Cache add failed:', err))
    );
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames =>
            Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) return response;
                return fetch(event.request).catch(() => {
                    // Fallback for offline external resources
                    if (event.request.url.includes('jspdf')) {
                        return new Response('/* Fallback jsPDF content */', {
                            headers: { 'Content-Type': 'application/javascript' }
                        });
                    }
                });
            })
            .catch(err => console.error('Fetch failed:', err))
    );
});
