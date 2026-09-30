/* TRN service worker: cache static UI shell for offline reading of visited pages.
   Live maps / business hours / navigation are third-party and NOT available offline. */
const CACHE = "trn-shell-v16";
const SHELL = ["./", "./index.html", "./trip.html", "./bikes.html", "./styles.css", "./app.js", "./bikes.js", "./bike-store.js", "./route-geo.js", "./route-map.js", "./trips1.js", "./trips2.js", "./trips3.js", "./trips4.js", "./trips5.js", "./manifest.json", "./icon.svg"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      // Never cache error responses (e.g. a 404 served while a page was
      // missing would otherwise be served from cache forever).
      if (res.ok && new URL(e.request.url).origin === location.origin) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match("./index.html")))
  );
});
