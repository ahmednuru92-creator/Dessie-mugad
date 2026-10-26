// ============================================================================
// 🇪🇹 ደሴ ማርት (Dessie Mart / ሙጋድ ገበያ) — Service Worker (sw.js)
// ስሪት: v1.0.0 (Production Release)
// ============================================================================

const CACHE_NAME = 'dessie-mart-v1.0.0';
const OFFLINE_URL = '/index.html';

// 📦 ከመስመር ውጭ እንዲቀመጡ የሚፈለጉ ዋና ዋና ፋይሎች
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/a_premium_modern_mobile_app_icon_ios_android_app_icon_for_dessie_mart._squircle.png',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+Ethiopic:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'
];

// 1. Install Event - ዋና ዋና ፋይሎችን በካሼ ውስጥ ማስቀመጥ
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 [Service Worker] ደሴ ማርት ፋይሎችን በካሼ ውስጥ በማስቀመጥ ላይ...');
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate Event - የቆዩ ካሼዎችን ማጽዳት
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('🧹 [Service Worker] የቆየ ካሼ ተወግዷል:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event - ጥያቄዎችን ማስተናገድ
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        return networkResponse;
      }).catch(() => {
        if (event.request.destination === 'image') {
          return caches.match('/a_premium_modern_mobile_app_icon_ios_android_app_icon_for_dessie_mart._squircle.png');
        }
      });
    })
  );
});
