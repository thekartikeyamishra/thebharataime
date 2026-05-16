/**
 * TheBharatAI Service Worker v4
 * File: sw.js
 * Strategy: Cache-first shell, Network-first lang pages, SWR for HTML
 */
'use strict';

const SHELL_CACHE  = 'bharatai-shell-v4';
const PAGES_CACHE  = 'bharatai-pages-v4';
const STATIC_CACHE = 'bharatai-static-v4';
const ALL_CACHES   = [SHELL_CACHE, PAGES_CACHE, STATIC_CACHE];
const OFFLINE_URL  = '/offline.html';

const SHELL_URLS = ['/','/index.html','/manifest.json','/offline.html','/about.html','/disclaimer.html','/privacy-policy.html','/terms.html','/404.html'];
const STATIC_URLS = ['/icons/icon-192.png','/icons/icon-512.png','/og-image.png'];

self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      caches.open(SHELL_CACHE).then(c => c.addAll(SHELL_URLS.map(u => new Request(u,{cache:'reload'}))).catch(()=>{})),
      caches.open(STATIC_CACHE).then(c => c.addAll(STATIC_URLS).catch(()=>{})),
    ]).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => !ALL_CACHES.includes(k)).map(k => caches.delete(k))))
    .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const {request} = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== location.origin) return;
  const p = url.pathname;
  if (p.includes('gtag')||p.includes('analytics')||p.includes('adsbygoogle')||p.includes('googlesyndication')) return;
  if (p.startsWith('/icons/')||p.endsWith('.png')||p.endsWith('.jpg')||p.endsWith('.svg')||p.endsWith('.woff2')||p.endsWith('.woff')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE)); return;
  }
  if (p.startsWith('/hi/')||p.startsWith('/mr/')||p.startsWith('/te/')||p.startsWith('/ta/')||p.startsWith('/en/')) {
    event.respondWith(networkFirst(request, PAGES_CACHE)); return;
  }
  if (p.endsWith('.xml')||p.endsWith('.txt')) {
    event.respondWith(networkFirst(request, PAGES_CACHE)); return;
  }
  if (p.endsWith('.html')||p==='/') {
    event.respondWith(staleWhileRevalidate(request, SHELL_CACHE)); return;
  }
  event.respondWith(networkFirstWithOffline(request));
});

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch { return new Response('Asset unavailable offline', {status:503}); }
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 5000);
    const response = await fetch(request, {signal: ctrl.signal});
    clearTimeout(tid);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    return offlineFallback();
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then(r => { if(r.ok) cache.put(request, r.clone()); return r; }).catch(()=>{});
  return cached || await fetchPromise || offlineFallback();
}

async function networkFirstWithOffline(request) {
  try { return await fetch(request); }
  catch {
    const cache = await caches.open(SHELL_CACHE);
    return (await cache.match(request)) || offlineFallback();
  }
}

async function offlineFallback() {
  const cache = await caches.open(SHELL_CACHE);
  return (await cache.match(OFFLINE_URL)) ||
    new Response('<!DOCTYPE html><html><body style="font-family:sans-serif;text-align:center;padding:48px;background:#0F1729;color:#fff"><h1>📵 Offline</h1><p>Check internet connection</p><a href="/" style="color:#FF6B35">Retry</a></body></html>',
    {status:200,headers:{'Content-Type':'text/html;charset=utf-8'}});
}

self.addEventListener('push', event => {
  if (!event.data) return;
  const d = event.data.json();
  event.waitUntil(self.registration.showNotification(d.title||'TheBharatAI',{body:d.body||'New scheme update',icon:'/icons/icon-192.png',badge:'/icons/icon-72.png',tag:'bharatai',data:{url:d.url||'/'}}));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data?.url||'/'));
});