/* Sir Xahid Anwar · service worker
   Pages, styles and scripts: network first (so updates show straight away), cached copy when offline.
   Images and fonts: served from cache, refreshed in the background.
   Bump VERSION whenever you want every installed copy to clear its cache. */
const VERSION = "xa-2026-10-30c";
const CORE = [
  "/", "/ai-checker", "/portal", "/past-papers", "/books", "/offline.html",
  "/assets/css/base.css", "/assets/css/home.css", "/assets/css/ai.css", "/assets/css/portal.css", "/assets/css/papers.css", "/assets/css/books.css", "/assets/css/chat.css", "/assets/css/pwa.css",
  "/assets/js/loader.js", "/assets/js/main.js", "/assets/js/chat.js", "/assets/js/pwa.js", "/assets/js/home.js", "/assets/js/ai.js", "/assets/js/portal.js", "/assets/js/papers.js", "/assets/js/books.js",
  "/assets/img/xa-mark.svg", "/assets/img/mascot.svg", "/assets/img/icon-192.png", "/favicon.svg"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => Promise.all(CORE.map(u => c.add(new Request(u, { cache: "reload" })).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

function networkFirst(req) {
  return fetch(req).then(res => {
    if (res && res.ok && res.type !== "opaque") { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req, { ignoreSearch: req.mode === "navigate" }).then(hit => hit || (req.mode === "navigate" ? caches.match("/offline.html") : Response.error())));
}
function staleWhileRevalidate(req) {
  return caches.open(VERSION).then(c => c.match(req).then(hit => {
    const live = fetch(req).then(res => { if (res && (res.ok || res.type === "opaque")) c.put(req, res.clone()); return res; }).catch(() => hit);
    return hit || live;
  }));
}

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    if (url.pathname === "/sw.js") return;
    if (req.mode === "navigate" || /\.(css|js|webmanifest|html)$/.test(url.pathname)) { e.respondWith(networkFirst(req)); return; }
    if (/\.(webp|png|jpg|jpeg|svg|ico|woff2?)$/.test(url.pathname)) { e.respondWith(staleWhileRevalidate(req)); return; }
    return;
  }
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") e.respondWith(staleWhileRevalidate(req));
  /* everything else (past-paper archive, WhatsApp, YouTube) goes straight to the network */
});
