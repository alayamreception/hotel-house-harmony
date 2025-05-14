
const CACHE_NAME = 'house-harmony-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
  // We're removing the icon URLs from here to prevent failing fetch requests
];

// Install the service worker and cache files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate the service worker and clean up old caches
self.addEventListener('activate', (event) => {
  const cacheAllowlist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheAllowlist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    })
  );
});

// Fetch strategy: try network first, fall back to cache, but handle missing icons gracefully
self.addEventListener('fetch', (event) => {
  // If request is for an icon, don't try to fetch if it doesn't exist
  if (event.request.url.includes('/icons/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          console.log('Failed to fetch icon:', event.request.url);
          // Return a transparent 1x1 PNG as fallback for missing icons
          return new Response(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
            { 
              status: 200, 
              headers: new Headers({
                'Content-Type': 'image/png'
              })
            }
          );
        })
    );
    return;
  }
  
  // For non-icon requests, use the standard strategy
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Handle push notifications - updated to handle both JSON and text data
self.addEventListener('push', (event) => {
  let title = 'UpKeeep Notification';
  let body = 'New notification';
  let data = {};
  
  try {
    // Try to parse as JSON first
    if (event.data) {
      const jsonData = event.data.json();
      title = jsonData.title || title;
      body = jsonData.body || body;
      data = jsonData.data || {};
      
      // Special handling for room updates
      if (jsonData.type === 'room_update') {
        title = 'Room Updated';
        body = `Room ${jsonData.roomNumber} has been updated to ${jsonData.status} status`;
      } else if (jsonData.type === 'room_insert') {
        title = 'New Room Added';
        body = `New room ${jsonData.roomNumber} has been added`;
      }
    }
  } catch (error) {
    // If not JSON, treat as text
    console.log('Push notification is not JSON, treating as text');
    if (event.data) {
      body = event.data.text();
    }
  }
  
  const options = {
    body: body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    data: data
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});
