'use strict';

self.State = self.State ?? (() => {

const CACHE_NAME = 'cache.' + APP_ID + '.state'
const CACHE_URL = HREF_BASE + '/cache/state.json'

var CACHE = {}

var initLoad = null
function init() {
  return (initLoad ??= load())
}

function load() {
  if(typeof caches === 'undefined') return Promise.resolve(CACHE)

  return caches.open(CACHE_NAME)
    .then(cache => cache.match(CACHE_URL))
    .then(response => response?.json() ?? {})
    .then(loaded => {
      CACHE = loaded
      // console.trace("[TRACE] Loaded existing cached state: %s", JSON.stringify(CACHE))
      return CACHE
    })
}

function save() {
  if(typeof caches === 'undefined') return Promise.resolve(undefined)

  const body = JSON.stringify(CACHE)
  // console.debug("[DEBUG] Caching current state: %s", body)
  const headers = new Headers({
    'Content-Type': 'application/json; charset=UTF-8',
    'Content-Length': body.length
  })
  return caches.open(CACHE_NAME)
      .then(cache => cache.put(CACHE_URL, new Response(body, {headers})))
}

function get(key) { return CACHE[key] }

function set(props) {
  return load()
  .then(() => {
    let changed = false
    for(let key in props) {
      const value = props[key]
      if(CACHE[key] !== value) {
        CACHE[key] = value
        changed = true
      }
    }
    return changed
  })
  .then((changed) => changed ? save() : undefined)
}

return {init, load, get, set}

})()

State.init()
