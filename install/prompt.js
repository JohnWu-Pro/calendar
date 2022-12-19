'use strict';

window.InstallPrompt = window.InstallPrompt ?? (() => {

var panel = null, button = null
var promptEvent = null

function onBeforePrompt(event) {
  event.preventDefault()
  promptEvent = event

  show()
}

function onClick() {
  // console.debug("[DEBUG] Calling InstallPrompt.onClick() ...")

  if(!promptEvent) {
    console.warn("[WARN] The install prompt event isn't available!")
    return
  }

  // Hide the prompt button
  hide()

  // Prompt the installation
  const event = promptEvent
  event.prompt()
    .then(() => event.userChoice)
    .then(choice => {
      // either "accepted" or "dismissed"
      console.info("[INFO] Install prompt user choice: %s", choice.outcome)
    })
    .then(onAfterPrompted)
}

function onAfterPrompted() {
  promptEvent = null
}

function show() {
  // console.debug("[DEBUG] Calling InstallPrompt.show() ...")

  // Preload install icon
  appendElement('link', {rel: "preload", href: "install/icon.png", as: "image"}, document.head)

  // Load style and div
  appendElement('style', {type: "text/css", id: "install-prompt"}, document.head).innerHTML = css()

  panel = appendElement('div', {className: "install-prompt-panel"})
  panel.innerHTML = content()

  button = $E('button', panel)

  // Set properties
  const viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
  panel.style.top = Math.max(viewportHeight-52, 400) + 'px'

  // Slide in
  $on(button, () => button.style.left = button.offsetWidth + 'px')
  .perform('slide-in')
  .then(() => button.style.left = '')
}

function hide() {
  if(!button) return

  $on(button)
  .perform('slide-out')
  .then(() => {
    $E('div.install-prompt-panel').remove()
    $E('style#install-prompt', document.head).remove()
    $E('link[href="install/icon.png"]', document.head).remove()
  })

  button = null
  panel = null
}

function css() { return blockCommentOf(css) /*
  .install-prompt-panel {
    z-index: 10; position: absolute;
    margin: 2px 0;
    width: 44%;
    left: 56%; top: 650px;
    text-align: right;
    overflow: hidden;
  }

  .install-prompt-panel > button {
    position: relative;
    border: 1px outset #eaeaea;
    border-radius: 24px 0 0 24px;
    padding: 6px 12px 6px 18px;
    display: inline-block;
    font: normal 18px '宋体';
    text-align: center;
    cursor: pointer;
    background: #f0f0ff;
    color: #e066ff;
  }

  .install-prompt-panel > button.slide-in {
    transform: translateX(-100%);
    transition: transform 1s 0.3s;
  }

  .install-prompt-panel > button.slide-out {
    transform: translateX(100%);
    transition: transform 1s 0.3s;
  }

  .install-prompt-panel > button > img {
    position: relative;
    top: 2px;
    height: 24px;
    width: 24px;
  }

  .install-prompt-panel > button > span {
    position: relative;
    top: -4px;
    padding: 0 4px;
  }
*/}

function content() { return blockCommentOf(content) /*
  <button type="button" onclick="InstallPrompt.onClick()"><img src="install/icon.png"><span>安装到桌面</span></button>
*/}

function blockCommentOf(func) { return func.toString().replace(/^[^\/]+\/\*/, '').replace(/\*\/[^\/]+$/, '') }

return {onBeforePrompt, onClick, onAfterPrompted}

})()
