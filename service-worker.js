/* Service worker sencillo: cachea los archivos de la app para que
   funcione sin conexión (excepto el chequeo gramatical, que necesita
   internet para llamar a la API de LanguageTool). */
const CACHE_NAME = "guionter-cache-v2";
const ASSETS = [
  "./",
  "./index.html",
  "./app.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./vendor/jspdf.umd.min.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  // Never cache/intercept calls to the grammar-check API — always go to network.
  if (url.hostname.includes("languagetool.org")) return;
  // Never cache/intercept calls to a local Applio instance (any host/port —
  // it's not part of this app's own assets).
  if (url.origin !== self.location.origin) return;
  if (event.request.method !== "GET") return;

  // HTML and app.js change often as the app is updated: always try the
  // network first so a redeploy is picked up on the very next reload,
  // falling back to the cached copy only when offline.
  const isCodeFile = event.request.mode === "navigate" || url.pathname.endsWith("/app.js") || url.pathname.endsWith("/index.html");

  if (isCodeFile) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Everything else (icons, manifest, vendor libs): cache-first, since these
  // rarely change and it keeps the app fast and offline-friendly.
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request)
          .then((response) => {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
            return response;
          })
          .catch(() => cached)
      );
    })
  );
});
