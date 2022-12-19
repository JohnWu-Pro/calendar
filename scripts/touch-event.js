'use strict';

(function() {

  const xDeltaThreshold = 30
  const yDeltaThreshold = 30
  const timeThreshold = 1000

  var startX, startY, startTime

  function onTouchStarted(event) {
    startX = event.touches[0].pageX
    startY = event.touches[0].pageY
    startTime = Date.now()
  }

  function onTouchEnded(event) {
    if(Date.now() - startTime > timeThreshold) return

    const xDelta = event.changedTouches[0].pageX - startX
    const yDelta = event.changedTouches[0].pageY - startY

    if(Math.abs(xDelta) > xDeltaThreshold && Math.abs(yDelta) < yDeltaThreshold) {
      event.preventDefault()
      if(xDelta < 0) {
        Calendar.nextMonth()
      } else {
        Calendar.prevMonth()
      }
    } else if(Math.abs(xDelta) < xDeltaThreshold && Math.abs(yDelta) > yDeltaThreshold) {
      event.preventDefault()
      if(yDelta < 0) {
        Calendar.nextYear()
      } else {
        Calendar.prevYear()
      }
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const body = $E('body')
    body.addEventListener('touchstart', onTouchStarted, {passive: false})
    body.addEventListener('touchend', onTouchEnded, {passive: false})
  })

})()
