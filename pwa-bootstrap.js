'use strict';

(async (currentScript) => {

if(location.protocol === 'http:') {
  console.info("[INFO] The application is served over HTTP. PWA feature is not applicable.")
  return
}

//
// Register installation related event listeners
//
window.addEventListener("beforeinstallprompt", (event) => {
  console.info("[INFO] Calling beforeinstallprompt(event.platforms: %o) ...", event.platforms)

  if(typeof InstallPrompt !== 'undefined') {
    InstallPrompt.onBeforePrompt(event)
  } else { // Perform the default interactions
    event.userChoice.then((choice) => {
      // either "accepted" or "dismissed"
      console.info("[INFO] Default install prompt user choice: %s", choice.outcome)
    })
  }
})

if('onappinstalled' in window) {
  window.addEventListener('appinstalled', () => {
    console.info("[INFO] Current app (url: %s) is being installed.", HREF_BASE + '/manifest.json')

    if(typeof State !== 'undefined') {
      State.set({
        'installationTime': Date.now(),
        'installationTimeLocale': resolveNavigatorLocale()
      })
    }

    if(typeof InstallPrompt !== 'undefined') {
      InstallPrompt.onAfterPrompted()
    }
  })
} else {
  console.info("[INFO] Event 'appinstalled' is not supported. Listening to the synthetic 'applaunched' event.")

  window.addEventListener('applaunched', () => {
    console.info("[INFO] Current app (url: %s) is launched for the first time after installation.", HREF_BASE + '/manifest.json')

    if(typeof State !== 'undefined') {
      State.set({
        'appInitialLaunchTime': Date.now()
      })
    }
  })
}

//
//  Bootstrap logic
//
window.KNOWN_INTALLED = await isKnownInstalled()
if(KNOWN_INTALLED) {
  console.info("[INFO] The application is known installed.")
  return
}

if(shouldPolyfillIntallPrompt()) {
  loadResources(HREF_BASE + '/install/polyfill.js?' + versionOf(currentScript))
}

//
// Utility functions
//
async function isKnownInstalled() {
  const appUrl = HREF_BASE + '/manifest.json'
  if(navigator.getInstalledRelatedApps) {
    // console.debug("[DEBUG] Checking installed related apps ...")
    const apps = await navigator.getInstalledRelatedApps()
    if(apps.some(app => app.url === appUrl)) {
      // console.debug("[DEBUG] Current app (url: %s) is installed.", appUrl)
      return true
    }
  } else {
    console.info("[INFO] Checking installed related apps is not supported.")
  }

  if(typeof State !== 'undefined') {
    await State.load()

    const installationTime = State.get('installationTime')
    if(installationTime) {
      // console.debug("[DEBUG] Current app (url: %s) was installed at %o.", appUrl, new Date(installationTime))
      return true
    }

    const appInitialLaunchTime = State.get('appInitialLaunchTime')
    if(appInitialLaunchTime) {
      // console.debug("[DEBUG] Current app (url: %s) was initially launched at %o after installation.", appUrl, new Date(appInitialLaunchTime))
      return true
    }
  }

  return false
}

function shouldPolyfillIntallPrompt() {
  if('onbeforeinstallprompt' in window) return false
  if(navigator.userAgent.match(/Windows/)) return false
  return true
}

//
// Register service worker
//
if(navigator.serviceWorker) {
  navigator.serviceWorker.register(HREF_BASE + '/service-worker.js')
} else {
  console.info("[INFO] navigator.serviceWorker is not supported.")
}

})(document.currentScript)
