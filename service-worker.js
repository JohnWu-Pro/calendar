'use strict';

//
// CAUTION:
// This script should be placed in the same directory as the `index.html`,
// so that the script location resolution can work as expected.
//
(() => {

const CONTEXT_PATH = location.pathname.substring(0, location.pathname.lastIndexOf('/'))
const INDEX_HTML = `${CONTEXT_PATH}/index.html`

const CACHE_NAME = 'cache.nongli.resources'

self.addEventListener('install', function(event) {
  // console.debug("[DEBUG] Calling ServiceWorker.install(%o) ...", event);

  event.waitUntil(cacheStaticResources());

  // Trigger installed service worker to progress into the activating state
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  // console.debug("[DEBUG] Calling ServiceWorker.activate(%o) ...", event);

  event.waitUntil((async () => {
    // Enable navigation preload if it's supported.
    // See https://developers.google.com/web/updates/2017/02/navigation-preload
    if(self.registration.navigationPreload) {
      await self.registration.navigationPreload.enable();
    }

    // await deleteOldCaches();
  })());

  // Tell the active service worker to take control of the page immediately.
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  // console.debug("[DEBUG] Calling ServiceWorker.fetch(%o) ...", event.request);

  if(event.request.method !== "GET") {
    // For non-GET requests, let the browser do its default thing
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const request = event.request;
    const preferFetch = navigator.onLine && new URL(request.url).pathname === INDEX_HTML;

    // First, try to get the resource from the cache
    // console.debug("[DEBUG] Checking cache for %o ...", request);
    let response = preferFetch ? null : await cache.match(request);
    if(response) {
      return response;
    }

    // Next, try to use the preloaded response, if available
    // console.debug("[DEBUG] Checking preloaded response for %o ...", request);
    response = await event.preloadResponse;
    if(isCacheable(response)) {
      putIn(cache, request, response);
      return response;
    }

    // Next, try to fetch the resource from the network
    // console.debug("[DEBUG] Trying to fetch and cache %o ...", request);
    response = await fetch(request);
    if(isCacheable(response)) {
      putIn(cache, request, response);
      return response;
    }

    if(preferFetch) {
      // Fallback to cache
      return await cache.match(request);
    }

    // Return fetched response anyway
    return response;
  })());
});

async function cacheStaticResources() {
  const cache = await caches.open(CACHE_NAME);

  const response = await fetch(INDEX_HTML);
  if(isCacheable(response)) {
    await cache.put(INDEX_HTML, response.clone());

    const indexHtml = await response.clone().text();
    const resources = resolveStaticCachableResources(indexHtml);
    // console.debug("[DEBUG] Static cachable resources: %o", resources);
    await cache.addAll(resources);
  } else {
    console.error("[ERROR] Failed in loading %s: %o", INDEX_HTML, response);
    throw "Failed in loading " + INDEX_HTML;
  }
};

function isCacheable(response) {
  return 200 <= response?.status && response.status < 300 && response.headers.has('Content-Type');
}

function resolveStaticCachableResources(indexHtml) {
  const styles = [];
  for (const match of indexHtml.matchAll(/<link[^<>]+href="([\/\-\.\w]+\.css\?\d+)" data-cacheable [^<>]+>/g)) {
    match.shift(); // Remove the matched text
    styles.push(...match); // Append captured resource paths
  }

  const scripts = [];
  for (const match of indexHtml.matchAll(/<script[^<>]+src="([\/\-\.\w]+\.js\?\d+)" data-cacheable [^<>]+>/g)) {
    match.shift(); // Remove the matched text
    scripts.push(...match); // Append captured resource paths
  }

  return [ // Expects origin related paths
    CONTEXT_PATH + "/images/nongli-144x144.png",
    CONTEXT_PATH + "/images/nongli-192x192.png",
    CONTEXT_PATH + "/images/nongli-512x512.png",
    CONTEXT_PATH + "/images/webdings-Y-red.gif",
    ...styles.map(path => CONTEXT_PATH + '/' + path),
    ...scripts.map(path => CONTEXT_PATH + '/' + path),
    CONTEXT_PATH + "/help.html",
    CONTEXT_PATH + "/LICENSE.txt"
  ]
}

function putIn(cache, request, response) {
  response = response.clone();
  cache.delete(request, {ignoreSearch : true})
  .then(() => cache.put(request, response));
}

})()
