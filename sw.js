// ══════════════════════════════════════════════════════════════
//  PRIVY — Service Worker
//  Handles: offline caching, push notifications
// ══════════════════════════════════════════════════════════════

const CACHE_NAME = 'privy-v1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// ─── INSTALL ─────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn('[SW] Pre-cache warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// ─── ACTIVATE ────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ─── FETCH (offline support) ─────────────────────────────────
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  // Only cache same-origin or font requests
  if (!event.request.url.startsWith(self.location.origin) &&
      !event.request.url.includes('fonts.googleapis.com') &&
      !event.request.url.includes('fonts.gstatic.com')) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        if (response.ok && event.request.url.startsWith(self.location.origin)) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
        return new Response('Offline', { status: 503 });
      });
    })
  );
});

// ─── PUSH NOTIFICATIONS ──────────────────────────────────────
self.addEventListener('push', (event) => {
  let data = { title: 'Privy', body: 'New message', url: '/' };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: './icons/icon-192.png',
    badge: './icons/icon-72.png',
    tag: 'privy-message',
    renotify: true,
    requireInteraction: false,
    silent: false,
    vibrate: [200, 100, 200],
    timestamp: Date.now(),
    actions: [
      { action: 'reply', title: 'Reply' },
      { action: 'dismiss', title: 'Dismiss' }
    ],
    data: { url: data.url || self.location.origin }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ─── NOTIFICATION CLICK ──────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || self.location.origin;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// ─── BACKGROUND SYNC ─────────────────────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'privy-sync') {
    event.waitUntil(syncPendingMessages());
  }
});

async function syncPendingMessages() {
  console.log('[SW] Background sync triggered');
  // Future: retry failed messages from IndexedDB
}

// ─── MESSAGE FROM PAGE ───────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data?.type === 'GET_VERSION') {
    event.source?.postMessage({ type: 'VERSION', version: CACHE_NAME });
  }
});

// ─── PUSH SUBSCRIPTION HELPER ────────────────────────────────
// Call from main app:
//
//   const registration = await navigator.serviceWorker.ready;
//   const subscription = await registration.pushManager.subscribe({
//     userVisibleOnly: true,
//     applicationServerKey: urlBase64ToUint8Array('YOUR_VAPID_PUBLIC_KEY')
//   });
//   console.log('Push subscription:', JSON.stringify(subscription));
//
// For local notifications (without push server), Privy uses
// showNotification() directly from the page when hidden.

console.log('[Privy SW] Service worker loaded');