const CACHE_NAME = 'echospell-v1';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/app-icon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/site.webmanifest'
];

const cacheAppShell = async () => {
  const cache = await caches.open(CACHE_NAME);
  const response = await fetch('/index.html', { cache: 'reload' });

  if (!response.ok) {
    throw new Error(`Unable to cache app shell: ${response.status}`);
  }

  const html = await response.text();
  const page = new Response(html, {
    headers: response.headers,
    status: response.status,
    statusText: response.statusText
  });
  const linkedAssets = [...html.matchAll(/(?:href|src)="(\/[^"#?]+)"/g)]
    .map((match) => match[1]);
  const assets = [...new Set([...CORE_ASSETS, ...linkedAssets])];

  await Promise.all([
    cache.put('/', page.clone()),
    cache.put('/index.html', page.clone()),
    ...assets
      .filter((asset) => asset !== '/' && asset !== '/index.html')
      .map((asset) => cache.add(asset))
  ]);
};

self.addEventListener('install', (event) => {
  event.waitUntil(cacheAppShell().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

const networkFirstPage = async (request) => {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put('/index.html', response.clone());
    }
    return response;
  } catch {
    return cache.match('/index.html');
  }
};

const cachedAsset = async (request) => {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    return Response.error();
  }
};

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstPage(request));
    return;
  }

  event.respondWith(cachedAsset(request));
});
