self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// ❌ NADA de push
// ❌ NADA de notificationclick
// ❌ NADA de showNotification
