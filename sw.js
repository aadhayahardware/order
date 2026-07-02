// AADHAYA order app service worker — v1
// Strategy: network-first for the page (updates always win), cache-first for images.
const VER = 'aad-v1';
const IMG_CACHE = VER + '-img';
const CORE_CACHE = VER + '-core';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CORE_CACHE).then(c => c.addAll(['/', 'manifest.json'])).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => !k.startsWith(VER)).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Page navigations: network first, fall back to cached shell when offline.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CORE_CACHE).then(c => c.put('/', copy));
        return res;
      }).catch(() => caches.match('/'))
    );
    return;
  }

  // Same-origin images: cache first (product photos rarely change).
  if (url.origin === location.origin && /\.(jpg|jpeg|png|webp)$/i.test(url.pathname)) {
    e.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(IMG_CACHE).then(c => c.put(req, copy)); }
        return res;
      }))
    );
  }
});
