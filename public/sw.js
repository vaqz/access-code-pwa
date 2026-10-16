const CACHE_NAME = 'access-code-shell-v2';
const APP_SHELL = ['/', '/index.html', '/manifest.json', '/icon.svg'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('access-code-shell-') && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || request.method !== 'GET') return;
  // Do not cache API responses or verification links.
  event.respondWith(fetch(request).catch(async () => {
    const cached = await caches.match(request);
    return cached || new Response('Offline. Reconnect and try again.', {status:503, headers:{'Content-Type':'text/plain; charset=utf-8'}});
  }));
});
