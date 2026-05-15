/**
 * TheBharatAI Service Worker
 * Strategy:
 *  - Core shell (HTML, CSS, JS) → Cache-First, then network
 *  - API / dynamic data → Network-First, fallback to cache
 *  - Fonts → Cache-First (long TTL)
 *  - Offline fallback page when network unavailable
 */

const CACHE_NAME = 'bharatai-v3';
const OFFLINE_URL = '/offline.html';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/disclaimer.html',
  '/privacy-policy.html',
  '/terms.html',
  '/about.html'
];

// Install: precache core files
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(PRECACHE_URLS.map(function(url) {
        return new Request(url, { cache: 'reload' });
      }));
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

// Activate: clean old caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function(name) { return name !== CACHE_NAME; })
          .map(function(name) { return caches.delete(name); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Fetch: routing strategy
self.addEventListener('fetch', function(event) {
  var request = event.request;

  // Skip non-GET and non-http(s)
  if(request.method !== 'GET') return;
  if(!request.url.startsWith('http')) return;

  // Skip AdSense / Google Analytics requests
  if(
    request.url.includes('googlesyndication') ||
    request.url.includes('googletagmanager') ||
    request.url.includes('doubleclick') ||
    request.url.includes('google-analytics') ||
    request.url.includes('adservice.google')
  ) return;

  // Fonts: Cache-First (long TTL)
  if(request.url.includes('fonts.googleapis.com') || request.url.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(function(cache) {
        return cache.match(request).then(function(cached) {
          if(cached) return cached;
          return fetch(request).then(function(response) {
            cache.put(request, response.clone());
            return response;
          });
        });
      })
    );
    return;
  }

  // HTML pages: Network-First, fallback to cache, fallback to offline
  if(request.headers.get('Accept') && request.headers.get('Accept').includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then(function(response) {
          var responseClone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(function() {
          return caches.match(request).then(function(cached) {
            return cached || caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }

  // Everything else: Cache-First
  event.respondWith(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.match(request).then(function(cached) {
        var fetchPromise = fetch(request).then(function(response) {
          if(response && response.status === 200 && response.type === 'basic') {
            cache.put(request, response.clone());
          }
          return response;
        }).catch(function() {
          return cached;
        });
        return cached || fetchPromise;
      });
    })
  );
});

// Background sync for report submissions (future)
self.addEventListener('sync', function(event) {
  if(event.tag === 'report-scheme') {
    event.waitUntil(syncReports());
  }
});

function syncReports() {
  // Placeholder for future: retry queued /api/report-scheme POSTs
  return Promise.resolve();
}

// Push notifications (future)
self.addEventListener('push', function(event) {
  if(!event.data) return;
  var data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'TheBharatAI', {
      body: data.body || 'New scheme update available',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-96.png',
      data: { url: data.url || '/' }
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});