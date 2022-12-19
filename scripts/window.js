'use strict';

function $ID(id, container) {
  return (container || document).getElementById(id)
}

function $E(cssSelector, container) {
  return (container || document).querySelector(cssSelector)
}

function $on(element, init) {
  if(init) init(element)

  return {
    perform(transition) {
      return new Promise((resolve) => {
        const listener = () => {
          element.classList.remove(transition)
          element.removeEventListener('transitionend', listener)
          resolve(element)
        }

        delay(1).then(() => {
          element.addEventListener('transitionend', listener)
          element.classList.add(transition)
        })
      })
    }
  }
}

function loadResources() {
  // console.debug("[DEBUG] Going to load resources at [%o] ...", [...arguments])
  let promise = Promise.resolve()
  for(const resource of arguments) {
    promise = promise.then(() => new Promise((resolve) => {
      if(typeof resource === 'function') {
        resource()
        resolve()
      } else {
        appendResource(resource, (event) => {
          console.info("[INFO] Loaded resource at [%s] successfully.", resource)
          resolve()
        }, (event) => {
          console.error("[ERROR] Failed in loading resource at [%s].\n", resource, event)
          resolve()
        }, document.head)
      }
    }))
  }
  return promise
}

function appendResource(url, onload, onerror, container) {
  try {
    const pathname = new URL(url).pathname
    if(pathname.endsWith('.js')) {
      appendScript(url, onload, onerror, container)
    } else if(pathname.endsWith('.css')) {
      appendStylesheet(url, onload, onerror, container)
    } else {
      onerror(new Error('Unsupported resource type.'))
    }
  } catch(e) {
    onerror(e)
  }
}

function appendScript(src, onload, onerror, container) {
  // console.debug("[DEBUG] Going to load script at [%s] ...", src)
  appendElement('script', {type: 'text/javascript', src, onload, onerror}, container)
}

function appendStylesheet(href, onload, onerror, container) {
  // console.debug("[DEBUG] Going to load stylesheet at [%s] ...", href)
  appendElement('link', {rel: 'stylesheet', type: 'text/css', href, onload, onerror}, container)
}

function appendElement(tag, attributes, container) {
  return (container || document.body).appendChild(createElement(tag, attributes))
}

function createElement(tag, attributes) {
  return Object.assign(document.createElement(tag), attributes)
}

function openDoc(url, name) {
  const height = screen.height/2
  const width = screen.width/2
  const top = height/2
  const left = width/2
  const features = `
    resizable=yes
    ,menubar=no
    ,toolbar=no
    ,scrollbars=yes
    ,status=no
    ,top=${top},screenY=${top}
    ,left=${left},screenX=${left}
    ,height=${height}
    ,width=${width}
  `
  window.open(url, name, features);
}
