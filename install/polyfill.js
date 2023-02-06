'use strict';

((window) => {

const DISPLAY_VALUES = ['fullscreen', 'standalone', 'minimal-ui', 'browser']
const IN_INSTALLED_MODE = DISPLAY_VALUES.includes(new URL(location.href).searchParams.get('mode'))

if(!('onbeforeinstallprompt' in window)) {
  if(KNOWN_INTALLED) {
    // Do nothing
  } else if(IN_INSTALLED_MODE) {
    // Do nothing
  } else {
    const choice = {outcome: 'UNKNOWN'}
    const event = Object.assign(new CustomEvent('beforeinstallprompt'), {
      platforms: ['web'],
      preventDefault: () => {},
      prompt: () => Promise.resolve(
        InstallDemo.show()
        .then(() => choice.outcome = "dismissed")
      ),
      userChoice: Promise.resolve(choice)
    })

    // dispatch the event
    delay(3000).then(() => window.dispatchEvent(event))
  }
}

if(!('onappinstalled' in window)) {
  if(KNOWN_INTALLED) {
    // Do nothing
  } else if(IN_INSTALLED_MODE) {
    console.info("[INFO] Going to trigger 'applaunched' event ...")
    delay(1).then(() => window.dispatchEvent(new CustomEvent('applaunched')))
  } else {
    // Do nothing
  }
}

//
// Install-Demo UI and control
//
const IMAGES = [ undefined,
  'install/firefox.step-1.png',
  'install/firefox.step-2.png',
]
var panel = {}
var closed = false

function show() {
  // console.debug("[DEBUG] Calling InstallDemo.show() ...")

  // Preload install-demo images
  appendElement('link', {rel: "preload", href: IMAGES[1], as: "image"}, document.head)
  appendElement('link', {rel: "preload", href: IMAGES[2], as: "image"}, document.head)

  // Load style and div
  appendElement('style', {type: "text/css", id: "install-demo"}, document.head).textContent = css()

  panel = appendElement('div', {className: "install-demo-panel hidden"})
  panel.innerHTML = content()

  closed = false

  // Show the steps
  const stepDiv = $E('div.step-x', panel)
  return delay(300)
    .then(() => closed ? 0 : panel.classList.remove('hidden'))
    .then(() => closed ? 0 : (stepDiv.innerHTML = step1()))
    .then(() => closed ? 0 : delay(1500))
    .then(() => closed ? 0 : $E('.annotation', stepDiv).classList.add('animate'))
    .then(() => closed ? 0 : delay(5000))
    .then(() => closed ? 0 : (stepDiv.innerHTML = step2()))
    .then(() => closed ? 0 : delay(1500))
    .then(() => closed ? 0 : $E('.annotation', stepDiv).classList.add('animate'))
    .then(() => closed ? 0 : delay(8000))
    .then(() => closed ? 0 : panel.classList.add('slide-up'))
    .then(() => closed ? 0 : delay(4000))
    .then(() => closed ? 0 : onClose())
}

function onClose() {
  closed = true
  $E('div.install-demo-panel').remove()
  $E('style#install-demo', document.head).remove()
  $E(`link[href="${IMAGES[1]}"]`, document.head).remove()
  $E(`link[href="${IMAGES[2]}"]`, document.head).remove()
}

function css() { return /*css*/`
  .install-demo-panel {
    z-index: 100; position: absolute;
    width: 84%;
    left: 8%; top: 3%;
    border: 1px outset #eaeaea;
    text-align: center;
    opacity: 1;
    background-color: #0099ff;
  }

  .install-demo-panel.hidden {
    display: none;
  }

  .install-demo-panel.slide-up {
    transform: translateY(-100%);
    opacity: 0;
    transition: transform 2s ease 2s, opacity 2s ease 2s;
  }

  .install-demo-panel img {
    margin: 3% 0 0 0;
    width: 92%;
  }

  .install-demo-panel .step-1.annotation {
    z-index: 200; position: absolute;
    left: 79.6%; top: 79.8%;
    width: 24%; height: 10%;
  }

  .install-demo-panel .step-1.annotation ellipse {
    fill: transparent;
    stroke: red;
    stroke-width: 4px;
    stroke-dasharray: 127;
    stroke-dashoffset: 127;
  }
  .install-demo-panel .step-1.annotation.animate ellipse {
    animation: clock-animation-step-1 1.2s linear 3;
    transform: rotate(-90deg);
    transform-origin: center;
  }
  @keyframes clock-animation-step-1 {
    0% { stroke-dashoffset: 127; }
    100% { stroke-dashoffset: 0; }
  }

  .install-demo-panel .step-2.annotation {
    z-index: 200; position: absolute;
    left: 35.6%; top: 48.4%;
    width: 40%; height: 36%;
  }

  .install-demo-panel .step-2.annotation ellipse {
    fill: transparent;
    stroke: red;
    stroke-width: 3px;
    stroke-dasharray: 156;
    stroke-dashoffset: 156;
  }
  .install-demo-panel .step-2.annotation.animate ellipse {
    animation: clock-animation-step-2 1.2s linear 3;
    transform: rotate(-90deg);
    transform-origin: center;
  }
  @keyframes clock-animation-step-2 {
    0% { stroke-dashoffset: 156; }
    100% { stroke-dashoffset: 0; }
  }

  .install-demo-panel > div.cmd {
    margin: 12px 0 6px 0;
  }

  .install-demo-panel button {
    border: 1px outset #eaeaea;
    border-radius: 6px;
    padding: 6px 18px;
    display: inline-block;
    font: normal 18px var(--main-font-family, 'system-ui');
    text-align: center;
    cursor: pointer;
    background: #f0f0ff;
    color: #e066ff;
  }`
}

function content() { return /*html*/`
  <div class="step-x">
  </div>
  <div class="cmd">
    <button type="button" onclick="InstallDemo.onClose()">已了解</button>
  </div>`
}

function step1() { return /*html*/`
  <img src="${IMAGES[1]}">
  <div class="step-1 annotation">
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50%" cy="50%" rx="16" ry="24" />
    </svg>
  </div>`
}

function step2() { return /*html*/`
  <img src="${IMAGES[2]}">
  <div class="step-2 annotation">
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50%" cy="50%" rx="16" ry="32" />
    </svg>
  </div>`
}

window.InstallDemo = {show, onClose}

})(window)
