// Cache-first service worker. Bump VERSION on every deploy to invalidate.
const VERSION = "claudisthenics-v0.1.0";
const ASSETS = [
  "./", "index.html", "styles.css", "data.js", "viz.js", "store.js", "app.js",
  "manifest.webmanifest", "icon.svg"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request))
  );
});
