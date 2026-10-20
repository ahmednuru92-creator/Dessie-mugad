// ============================================================================
// 🇪🇹 ደሴ ማርት (Dessie Mart / ሙጋድ ገበያ) — Service Worker (sw.js)
// ስሪት: v1.0.0 (Production Release)
// ============================================================================

const CACHE_NAME = 'dessie-mart-v1.0.0';
const OFFLINE_URL = '/offline.html';

// 📦 ከመስመር ውጭ እንዲቀመጡ የሚፈለጉ ዋና ዋና ፋይሎች (Core Assets for Offline)
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/a_premium_modern_mobile_app_icon_ios_android_app_icon_for_dessie_mart._squircle.png',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+Ethiopic:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'
];

// 1. መጫን (Install Event) - ዋና ዋና ፋይሎችን በካሼ ውስጥ አስቀድሞ ማስቀመጥ
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 [Service Worker] ደሴ ማርት ፋይሎችን በካሼ ውስጥ በማስቀመጥ ላይ...');
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 2. ማንቃት (Activate Event) - የቆዩ ካሼዎችን በማጽዳት አዲሱን ስሪት መቆጣጠር
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

// 3. ጥያቄዎችን ማስተናገድ (Fetch Event - Stale-While-Revalidate with Offline Fallback)
self.addEventListener('fetch', (event) => {
  // የድረ-ገጽ ዳሰሳ ጥያቄ ከሆነ እና ኢንተርኔት ከተቋረጠ ወደ offline.html ማዞር
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // ምስሎች፣ ፎንቶች እና የስታይል ፋይሎች ከካሼ ወይም ከኔትወርክ ማቅረብ
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // የቅርብ ጊዜውን ከበስተጀርባ አምጥቶ ካሼን ማደስ
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
