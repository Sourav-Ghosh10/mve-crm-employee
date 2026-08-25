importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

// Retrieve config passed via URL params (as public SW can't access env vars directly)
const params = new URLSearchParams(self.location.search);
const config = {
  apiKey: params.get('apiKey'),
  authDomain: params.get('authDomain'),
  projectId: params.get('projectId'),
  storageBucket: params.get('storageBucket'),
  messagingSenderId: params.get('messagingSenderId'),
  appId: params.get('appId'),
};

firebase.initializeApp(config);

const messaging = firebase.messaging();

/**
 * 🔥 Background messages (DATA ONLY)
 * Also handles broadcasting to open windows for live refresh
 */
messaging.onBackgroundMessage(payload => {
  console.log('[firebase-messaging-sw.js] Background message received:', payload);

  // 1. Show the native notification
  const title = payload.data?.title || payload.notification?.title || 'New Announcement';
  const body = payload.data?.body || payload.data?.content || payload.notification?.body || 'You have a new message';

  const notificationOptions = {
    body,
    icon: '/pulse-ops-logo.png',
    badge: '/pulse-ops-logo.png',
    data: {
      url: payload.data?.click_action || '/announcements'
    },
    tag: 'announcement',
    renotify: true
  };

  // 2. Broadcast to all open windows so they can refresh (Live Reflect)
  self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
    clientList.forEach(client => {
      client.postMessage({
        type: 'BACKGROUND_MESSAGE_RECEIVED',
        payload: payload
      });
    });
  });

  return self.registration.showNotification(title, notificationOptions);
});

/**
 * 🔗 Click handler
 */
self.addEventListener('notificationclick', event => {
  event.notification.close();

  const url = event.notification.data?.url || '/announcements';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // If a window is already open on this URL, focus it
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));