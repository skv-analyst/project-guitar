// Кэш всех статических файлов при первом заходе -> дальше работает офлайн.
// Стратегия — network-first: при наличии интернета всегда берём свежую
// версию с сервера (и обновляем кэш), офлайн — отдаём то, что закэшировано.
// Так апдейты на GitHub Pages подхватываются сами, без ручного бампа версии
// (бампаем CACHE_NAME только чтобы принудительно почистить старый кэш).
var CACHE_NAME = "guitar-practice-v3";

var ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/styles.css",
  "./js/app.js",
  "./js/theory.js",
  "./js/fretboard.js",
  "./js/fretboard-screen.js",
  "./js/rhythm-screen.js",
  "./js/data/caged.js",
  "./js/data/boxes.js",
  "./js/data/sequences.js",
  "./js/data/progressions.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(ASSETS);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (key) { return key !== CACHE_NAME; })
          .map(function (key) { return caches.delete(key); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request).then(function (response) {
      if (response && response.ok && response.type === "basic") {
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(event.request, clone);
        });
      }
      return response;
    }).catch(function () {
      return caches.match(event.request).then(function (cached) {
        if (cached) return cached;
        if (event.request.mode === "navigate") return caches.match("./index.html");
      });
    })
  );
});
