// Service Worker for Push Notifications

self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push Received.');

  if (event.data) {
    const data = event.data.json();

    const options = {
      body: data.body || data.message,
      icon: data.icon || '/vite.svg',
      badge: data.badge || '/vite.svg',
      tag: data.tag || 'veridata-notification',
      data: {
        url: data.url || '/',
        type: data.type || 'info'
      },
      vibrate: [200, 100, 200],
      requireInteraction: false
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'VeriData', options)
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click Received.');

  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});

self.addEventListener('pushsubscriptionchange', function(event) {
  console.log('[Service Worker] Push subscription changed');
  // Re-subscribe logic here if needed
});
