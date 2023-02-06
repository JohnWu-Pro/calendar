'use strict';

//
// NOTE:
// 1. This script should be placed in the directory where the `index.html` resides, or its parent directory,
//    so that the script location resolution can work as expected.
// 2. Resources are supposed to be properly versioned (if applicable) in one of the following forms:
//    2.1. File-versioned:    /path/to/name-<VERSION>.ext
//    2.2. URI-versioned:     /path/to/name.ext?v=<VERSION>
//    2.3. Pseudo-versioned:  /path/to/name.ext?v=pseudo
//    2.4. Deleted:           /path/to/name.ext?v=deleted
// 3. While a new version of service worker is installed, the following resources will be refreshed/deleted:
//    3.1. Newly added file-versioned resources (keyed by /path/to/name-<VERSION>.ext), and
//    3.2. All URI-versioned resources (keyed by /path/to/name.ext?v=<VERSION>), and
//    3.3. All Pseudo-versioned resources (keyed by /path/to/name.ext), and
//    3.4. All Deleted resources will be removed from the cache.
//
(() => {

//
// NOTE: Update the SW_VERSION would trigger the Service Worker being updated, and
// consequently, refresh the static-cachable-resources
//
const SW_VERSION = '2.1.0-RC1' // Should be kept in sync with the APP_VERSION

const APP_ID = 'nongli'

const CONTEXT_PATH = location.pathname.substring(0, location.pathname.lastIndexOf('/'))
// console.debug("[DEBUG] [ServiceWorker] CONTEXT_PATH: %s, location: %o", CONTEXT_PATH, location)

const INDEX_HTML = CONTEXT_PATH + '/index.html'

const CACHE_NAME = 'cache.' + APP_ID + '.resources'

self.addEventListener('install', function(event) {
  console.info("[INFO] Installing ServiceWorker (version: %s) ...", SW_VERSION)

  event.waitUntil(
    cacheStaticResources()
      .catch(error => console.error(error))
  )

  // Trigger installed service worker to progress into the activating state
  self.skipWaiting()
})

self.addEventListener('activate', function(event) {
  event.waitUntil((async () => {
    // Enable navigation preload if it's supported.
    // See https://developers.google.com/web/updates/2017/02/navigation-preload
    if(self.registration.navigationPreload) {
      await self.registration.navigationPreload.enable()
    }

    // Tell the active service worker to take control of the page immediately.
    await self.clients.claim()

    await self.clients.matchAll().then((windowClients) => {
      for(const client of windowClients) {
        client.postMessage({type: 'SW_ACTIVATED', version: SW_VERSION});
      }
    })

    console.info("[INFO] Activated ServiceWorker (version: %s).", SW_VERSION)
  })())
})

self.addEventListener('fetch', function(event) {
  // console.debug("[DEBUG] Calling ServiceWorker.fetch(%o) ...", event.request)

  if(event.request.method !== 'GET') {
    // For non-GET requests, let the browser perform its default behaviour
    return
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME)
    const request = event.request

    // First, try to get the resource from the cache
    let response = await cache.match(request)
    if(response) {
      // console.debug("[DEBUG] Returning response from cache for %o ...", request)
      return response
    }

    // Next, try to use the preloaded response, if available
    response = await event.preloadResponse
    if(isCacheable(response)) {
      putIn(cache, request, response)
      // console.debug("[DEBUG] Returning preload-response for %o ...", request)
      return response
    }

    // Next, try to fetch the resource from the network
    response = await fetch(request)
    if(isCacheable(response)) {
      putIn(cache, request, response)
    }

    // console.debug("[DEBUG] Returning fetched response for %o ...", request)
    return response
  })())
})

async function cacheStaticResources() {
  const cache = await caches.open(CACHE_NAME)

  const response = await fetch(INDEX_HTML)
  if(isCacheable(response)) {
    await cache.put(INDEX_HTML, response.clone())

    const indexHtml = await response.clone().text()
    const resources = resolveStaticCachableResources(indexHtml)
    // console.debug("[DEBUG] Resolved static cachable resources: %o", resources)
    // console.debug("[DEBUG] Current cached resources: %o", await cache.keys())

    // Cache all URI-versioned and newly added file-versioned resources
    const toBeRefreshed = []
    const deleted = /^.+\?v=deleted$/
    const uriVersioned = /^.+\?v=[\w\.\-]+$/
    for(const resource of resources) {
      if(deleted.test(resource)) {
        cache.delete(resource, {ignoreSearch : true})
      } else if(uriVersioned.test(resource) || !(await cache.match(resource))) {
        cache.delete(resource, {ignoreSearch : true})
        toBeRefreshed.push(resource.replaceAll('?v=pseudo', ''))
      } else {
        // console.debug("[DEBUG] Resource had already been cached: (%s)", resource)
      }
    }
    // console.debug("[DEBUG] To be refreshed resources: %o", toBeRefreshed)

    return await cache.addAll(toBeRefreshed)
  } else {
    console.error("[ERROR] Failed in loading %s: %o", INDEX_HTML, response)
    throw "Failed in loading " + INDEX_HTML
  }
}

function isCacheable(response) {
  return 200 <= response?.status && response.status <= 206 && response.headers.has('Content-Type')
}

function resolveStaticCachableResources(indexHtml) {
  const resources = [];
  [ /<cacheable-resource location="([\/\w\.\-]+(?:\?v=[\w\.\-]+)?)" ?\/>/g,
    /<link[^<>]+href="([\/\w\.\-]+\.css(?:\?v=[\w\.\-]+)?)" data-cacheable [^<>]+>/g,
    /<script[^<>]+src="([\/\w\.\-]+\.js(?:\?v=[\w\.\-]+)?)" data-cacheable [^<>]+>/g,
  ].forEach((regex) => {
    for (const [_, ...match] of indexHtml.matchAll(regex)) {
      resources.push(...match) // Append captured resource paths
    }
  })

  // Expects origin relative paths
  const normalize = (path) => {
    const names = [];
    (CONTEXT_PATH + '/' + path).split('/').forEach(it => it === '..' ? names.pop() : names.push(it))
    return names.join('/')
  }

  return resources.map(normalize)
}

function putIn(cache, request, response) {
  response = response.clone()
  cache.delete(request, {ignoreSearch : true})
    .then(() => cache.put(request, response))
}

})()
