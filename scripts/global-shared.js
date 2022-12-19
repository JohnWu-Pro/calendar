'use strict';

// `self` may be used to refer to the global scope that will work not only
// in a window context (self will resolve to window.self) but also
// in a worker context (self will then resolve to WorkerGlobalScope.self)

const HREF_BASE = hrefBase(location)
const CONTEXT_PATH = contextPath(location)
const INT_UNDEFINED = -1

function delay(millis) {
  return new Promise(resolve => setTimeout(resolve, millis))
}

function hrefBase(location) {
  return location.href.substring(0, location.href.lastIndexOf('/'))
}

function contextPath(location) {
  return location.pathname.substring(0, location.pathname.lastIndexOf('/'))
}

function versionOf(script) {
  return (new URL(script.src).search ?? '').replace(/^\?(?:v=)?/, '')
}

function resolveNavigatorLocale() {
  return navigator.language.replace(/^([a-z]{2})(?:-[a-z]+)??-([A-Z]{2})$/, '$1-$2')
}

function timezoneOffset() {
  const jan1st = new Date(); jan1st.setMonth(0, 1)
  let minutes = jan1st.getTimezoneOffset() // JavaScript TimezoneOffset is opposite to ISO spec
  const sign = minutes > 0 ? '-' : '+'
  if(minutes < 0) minutes = -minutes
  return `${sign}${padLeft(Math.floor(minutes/60), 2)}${padLeft(minutes%60, 2)}`
}

function padLeft(value, lengthAfterPadding, charToPad = '0') {
  let result = new String(value)
  while(result.length < lengthAfterPadding) result = charToPad + result
  return result
}
