'use strict';

const APP_ID = 'nongli'

const APP_VERSION = '2.2.1'

window.App = window.App ?? (() => {

  function launch() {
    return State.init()
      .then(Calendar.init)
      .then(appendFlash)
      .then(appendFooter)
      .then(Calendar.today)
  }

  function appendFlash() {
    Calendar.$flash = appendElement('div', {className: 'flash'})
  }

  function appendFooter() {
    appendElement('div', {className: 'footer'}).innerHTML = /*html*/`
      <div class="app no-wrap">
        <a href="javascript:openMarkdown('中华农历 1900~2099', 'README.md')">中华农历 1900-2099</a>,
        <span>${APP_VERSION}</span>
        <span id="upgrade"></span>
      </div>
      <div class="copyright no-wrap">
        <span><a href="javascript:openMarkdown('版权许可', 'LICENSE.md')">版权所有 &copy; 2002-${(new Date().getFullYear())}</a></span>
        <span><a href="mailto: johnwu.pro@gmail.com" target="_blank">吴菊华</a>,</span>
        <span>适用版权许可 <a href="https://mozilla.org/MPL/2.0/" target="_blank">MPL-2.0</a>.</span>
      </div>
    `
  }

  navigator.serviceWorker?.addEventListener('message', (event) => {
    // console.debug("[DEBUG] Received Service Worker message: %s", JSON.stringify(event.data))
    if(event.data.type === 'SW_ACTIVATED') {
      const activatedVersion = event.data.version
      if(activatedVersion > APP_VERSION) {
        $E('span#upgrade').innerHTML = /*html*/`<button>刷新并升级到 ${activatedVersion}</button>`
        $E('span#upgrade > button')?.addEventListener('click', () => window.location.reload())
      }
    }
  })

  //
  // Initialize
  //
  document.addEventListener("DOMContentLoaded", () => {
    delay(1) // Yield to other DOMContentLoaded handlers
      .then(launch)
      .then(() => console.info("[INFO] Launched Calendar successfully."))
      .catch((error) => console.error("[ERROR] Error occurred: %o", error))
  })

})()
