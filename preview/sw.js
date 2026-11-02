// AADHAYA order app service worker — v2 (Nov 2026: speed)
// Page:        turant phone ki copy dikhao, peeche se naya version laao (agli baar khulne par naya dikhega).
//              Agar phone me copy nahi hai to network se.
// ?v= wali files (js/css/photo/video): phone me ek baar aayi to dobara download nahi — naya version = naya ?v=.
// Bina ?v= wali js/css: phone ki copy turant, peeche se update.
// Supabase (stock/rate) ko yeh CHHOOTA NAHI — woh hamesha live aata hai.
const VER = 'aad-v2';
const IMG_CACHE = VER + '-img';
const CORE_CACHE = VER + '-core';
const ASSET_CACHE = VER + '-asset';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CORE_CACHE).then(c => c.addAll(['/', 'manifest.json'])).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => !k.startsWith(VER)).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function fresh(req, cacheName, key) {
  return fetch(req).then(res => {
    if (res && res.ok) { const copy = res.clone(); caches.open(cacheName).then(c => c.put(key || req, copy)); }
    return res;
  });
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;            // Supabase, Google etc. — untouched
  if (req.headers.has('range')) return;                  // video seeking — browser handles

  // Page: stale-while-revalidate (instant open)
  if (req.mode === 'navigate') {
    const net = fresh(req, CORE_CACHE, '/');
    e.waitUntil(net.catch(() => {}));
    e.respondWith(
      caches.match('/').then(hit => {
        if (!hit) return net.catch(() => caches.match('/'));
        // test / force links (?intro=1, ?p=...) still open instantly from cache
        return hit;
      })
    );
    return;
  }

  const p = url.pathname;
  const versioned = url.search.indexOf('v=') > -1;

  // Images: cache first (product photos rarely change)
  if (/\.(jpg|jpeg|png|webp|svg)$/i.test(p)) {
    e.respondWith(caches.match(req).then(hit => hit || fresh(req, IMG_CACHE)));
    return;
  }

  // JS / CSS / video
  if (/\.(js|css|mp4|json)$/i.test(p) && !/sw\.js$/.test(p)) {
    if (versioned) {
      e.respondWith(caches.match(req).then(hit => hit || fresh(req, ASSET_CACHE)));
    } else {
      const net = fresh(req, ASSET_CACHE);
      e.waitUntil(net.catch(() => {}));
      e.respondWith(caches.match(req).then(hit => hit || net));
    }
  }
});
