const CACHE = 'goldcut-v2';
const FILES = ['./goldcut_sales_app.html'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-First: يجيب النسخة الأحدث من الإنترنت أولاً
// لو مفيش نت، يرجع للنسخة المحفوظة كاحتياط بس
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(response => {
        // حدّث النسخة المحفوظة بأحدث نسخة من السيرفر
        const clone = response.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
