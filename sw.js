const CACHE_NAME = "station-clock-v1";
const ASSETS = ["./", "./index.html", "./style.css", "./clock.js", "./app.js"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => e.waitUntil(clients.claim()));

self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  if (url.includes("timeapi.io")) {
    event.respondWith(
      fetch(event.request)
        .then(async (networkRes) => {
          const cache = await caches.open(CACHE_NAME);
          const data = await networkRes.json();

          // Add a hidden 'cachedAt' field to the data
          data.cachedAt = Date.now();
          data.isOffline = false;

          const finalResponse = new Response(JSON.stringify(data));
          cache.put(url, finalResponse.clone());
          return finalResponse;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          const cachedRes = await cache.match(url);

          if (cachedRes) {
            const data = await cachedRes.json();

            // Calculate how much time has passed since we saved this
            const elapsedMs = Date.now() - data.cachedAt;

            // Adjust the dateTime field!
            // We take the old time and add the elapsed ms
            const oldTimeMs = new Date(data.dateTime).getTime();
            const adjustedTime = new Date(oldTimeMs + elapsedMs);

            // Overwrite the original fields so app.js doesn't know the difference
            data.dateTime = adjustedTime.toISOString();
            data.isOffline = true;

            return new Response(JSON.stringify(data));
          }
        }),
    );
  } else {
    event.respondWith(
      fetch(event.request)
        .then(async (networkRes) => {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, networkRes.clone());
          return networkRes;
        })
        .catch(async () => {
          return caches.match(event.request);
        }),
    );
  }
});

self.addEventListener("message", (event) => {
  if (event.data.action === "SET_TIMER") {
    const delay = event.data.delay;
    setTimeout(() => {
      const title = "TIMER COMPLETE";
      const options = {
        body: "Your countdown has finished.",
        vibrate: [500, 110, 500],
        tag: "timer",
        renotify: true,
        requireInteraction: true,
        silent: false,
      };

      self.registration.showNotification(title, options).then(() => resolve());
    }, delay);
  }
});
