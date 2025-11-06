const CACHE_NAME = 'brivax-laudos-v1';
const URLS_TO_CACHE = [
  '/Laudo-Brivax/',
  '/Laudo-Brivax/index.html',
  '/Laudo-Brivax/src/screens/LoginScreen.html',
  '/Laudo-Brivax/src/screens/CadastroScreen.html',
  '/Laudo-Brivax/src/screens/SelectSystemScreen.html',
  '/Laudo-Brivax/src/screens/AdminScreen.html',
  '/Laudo-Brivax/src/js/login.js',
  '/Laudo-Brivax/assets/brivax-logo.png',
  '/Laudo-Brivax/assets/icon-192.png',
  '/Laudo-Brivax/assets/icon-512.png'
];

// Instala o service worker e faz cache inicial
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(URLS_TO_CACHE))
  );
});

// Ativa e remove caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(k => k !== CACHE_NAME && caches.delete(k))
    ))
  );
});

// Intercepta requisições e serve offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(resp => resp || fetch(event.request))
      .catch(() => caches.match('/Laudo-Brivax/index.html'))
  );
});
