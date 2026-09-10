/* Service Worker manual, scope /tv saja. Jangan cache rute non-/tv. */
const STATIC_CACHE = "tv-static-v2";
const SCHEDULE_CACHE = "tv-jadwal-v1";
const PRECACHE = ["/tv", "/tv/~offline", "/icons/icon-192.png", "/icons/icon-512.png", "/manifest.webmanifest"];
const NAV_TIMEOUT_MS = 3000;
const SCHEDULE_TTL_MS = 24 * 60 * 60 * 1000;
const SCHEDULE_MAX = 100;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== STATIC_CACHE && k !== SCHEDULE_CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

function isScheduleRequest(url) {
  return (
    url.hostname === "api.myquran.com" ||
    url.hostname === "api.aladhan.com" ||
    url.hostname === "api.quran.com" ||
    url.hostname === "geocoding-api.open-meteo.com"
  );
}

function networkFirstNav(request) {
  return new Promise((resolve) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      caches
        .match(request)
        .then((hit) => hit || caches.match("/tv/~offline"))
        .then(resolve);
    }, NAV_TIMEOUT_MS);
    fetch(request)
      .then((res) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        const copy = res.clone();
        if (res.ok) {
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
        }
        resolve(res);
      })
      .catch(() => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        caches
          .match(request)
          .then((hit) => hit || caches.match("/tv/~offline"))
          .then(resolve);
      });
  });
}

// Shell /tv: cache-first + revalidasi latar; offline = cache lalu /tv/~offline.
function cacheFirstShell(request) {
  return caches.match(request).then((hit) => {
    const refresh = fetch(request)
      .then((res) => {
        if (res && res.ok) {
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, res.clone()));
        }
        return res;
      })
      .catch(() => null);
    if (hit) {
      refresh.catch(() => {});
      return hit;
    }
    return refresh.then(
      (res) => res || caches.match("/tv/~offline")
    );
  });
}

function staleWhileRevalidate(request, cacheName) {  return caches.open(cacheName).then((cache) =>
    cache.match(request).then((cached) => {
      const network = fetch(request)
        .then((res) => {
          if (res && res.ok) cache.put(request, res.clone());
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
}

function scheduleSWR(request) {
  return caches.open(SCHEDULE_CACHE).then((cache) =>
    cache.match(request).then((cached) => {
      const fresh =
        cached &&
        Date.now() - Number(cached.headers.get("x-tv-cached-at") || 0) <
          SCHEDULE_TTL_MS;
      const network = fetch(request)
        .then((res) => {
          if (res && res.ok) {
            const stamped = new Response(res.body, {
              status: res.status,
              statusText: res.statusText,
              headers: new Headers(res.headers),
            });
            stamped.headers.set("x-tv-cached-at", String(Date.now()));
            cache.put(request, stamped.clone());
            trimCache(cache);
            return stamped;
          }
          return fresh ? cached : res;
        })
        .catch(() => cached || Response.error());
      return fresh ? cached : network.then((r) => r || cached);
    })
  );
}

function trimCache(cache) {
  cache.keys().then((keys) => {
    if (keys.length > SCHEDULE_MAX) {
      cache.delete(keys[0]).then(() => trimCache(cache));
    }
  });
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin && !isScheduleRequest(url)) return;

  // GET jadwal (API eksternal): SWR + expire 24 jam, max 100.
  if (isScheduleRequest(url)) {
    event.respondWith(scheduleSWR(request));
    return;
  }

  // Di luar scope /tv jangan sentuh, kecuali aset _next/static milik halaman /tv.
  const inTv = url.pathname === "/tv" || url.pathname.startsWith("/tv/");
  const isStatic = url.pathname.startsWith("/_next/static/");
  if (!inTv && !isStatic) return;

  // Navigasi /tv*: shell "/" tepat cache-first + revalidasi latar;
  // navigasi lain NetworkFirst 3 detik; semua fallback cache lalu /tv/~offline (tak pernah blank).
  if (request.mode === "navigate" || (inTv && request.destination === "document")) {
    if (url.pathname === "/tv") {
      event.respondWith(cacheFirstShell(request));
    } else {
      event.respondWith(networkFirstNav(request));
    }
    return;
  }

  // Aset statis: SWR.
  event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
});
