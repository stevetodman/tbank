// TBank Service Worker - Offline Support & Caching
const CACHE_NAME = 'tbank-v1.0.0';
const RUNTIME_CACHE = 'tbank-runtime-v1.0.0';

// Assets to cache on install
const STATIC_ASSETS = [
  '/tbank/',
  '/tbank/index.html',
  '/tbank/assets/css/styles.css',
  '/tbank/assets/css/questions.css',
  '/tbank/assets/js/app.js',
  '/tbank/assets/js/questionData.js',
  '/tbank/assets/js/questionsPage.js',
  '/tbank/manifest.webmanifest'
];

// Question banks to cache (loaded on demand)
const QUESTION_BANKS = [
  '/tbank/assets/question_banks/all_questions.json',
  '/tbank/assets/question_banks/chd_part1.json',
  '/tbank/assets/question_banks/chd_part2.json',
  '/tbank/assets/question_banks/chd_part3.json',
  '/tbank/assets/question_banks/chd_part4.json',
  '/tbank/assets/question_banks/chd_part5.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting(); // Activate immediately
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim(); // Take control immediately
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          console.log('[SW] Serving from cache:', url.pathname);
          return cachedResponse;
        }

        // Not in cache - fetch from network
        console.log('[SW] Fetching from network:', url.pathname);
        return fetch(request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache question banks and other assets for future use
            if (url.pathname.includes('.json') ||
                url.pathname.includes('.css') ||
                url.pathname.includes('.js')) {
              caches.open(RUNTIME_CACHE)
                .then((cache) => {
                  console.log('[SW] Caching runtime asset:', url.pathname);
                  cache.put(request, responseToCache);
                });
            }

            return response;
          })
          .catch((error) => {
            console.error('[SW] Fetch failed, serving offline fallback:', error);

            // Return a custom offline page or message
            if (request.destination === 'document') {
              return caches.match('/tbank/index.html');
            }

            // For other resources, just let it fail gracefully
            return new Response('Offline - Resource not available', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// Background sync for future analytics (optional)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-analytics') {
    console.log('[SW] Background sync triggered');
    // Could sync user progress or analytics here
  }
});

// Push notification support (future feature)
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  const data = event.data ? event.data.json() : {};

  const options = {
    body: data.body || 'New questions available!',
    icon: '/tbank/assets/icons/icon-192x192.png',
    badge: '/tbank/assets/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/tbank/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'TBank', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/tbank/')
  );
});

// Message handler for communication with main app
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'CACHE_QUESTION_BANKS') {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then((cache) => {
          console.log('[SW] Caching question banks on demand');
          return cache.addAll(QUESTION_BANKS);
        })
    );
  }
});
