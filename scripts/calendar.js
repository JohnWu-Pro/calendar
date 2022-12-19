'use strict';

class Calendar {
  static annotators = [] // annotation functions
  static $cld
  static $year
  static $month
  static $flash
  static year = 2000
  static month = 1 // 1..12
  static current // CalendarMonth

  static register(annotator) {
    Calendar.annotators.push(annotator)
  }

  static init() {
    Calendar.$cld = $E('.cld')

    Calendar.$year = $ID('sy')
    Calendar.addOptions(Calendar.$year, CONFIG.baseYear, CONFIG.lastYear)
    Calendar.$year.onchange = Calendar.onMonthSelected

    Calendar.$month = $ID('sm')
    Calendar.addOptions(Calendar.$month, 1, 12)
    Calendar.$month.onchange = Calendar.onMonthSelected

    Calendar.$flash = $E('.flash')

    Calendar.register(CalendarMonth.annotateLunarMonthFirstDay)
    Calendar.register(CalendarMonth.annotateSolarTerms)

    const viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
    $E('body').style.height = viewportHeight + 'px'
    $E('div.copyright').style.top = Math.max(viewportHeight-36, 400) + 'px'

    loadResources(
      ...Calendar.#resolveDynamicScripts(CONFIG.definedQualifiers, versionOf(Calendar.currentScript))
    ).then(() => {
      Calendar.today()
      console.info("[INFO] Calendar is rendered successfully.")
    }).catch(error => {
      console.error("[ERROR] Error occurred: %o", error)
    })
  }

  static addOptions(select, min, max) {
    let options = select.options
    for(let value=min; value<=max; value++) {
      options.add(new Option(value, value))
    }
  }

  static onMonthSelected(event) {
    const year = parseInt(Calendar.$year.value, 10)
    const month = parseInt(Calendar.$month.value, 10)
    Calendar.show(year, month)
  }

  static prevYear() {
    Calendar.show(Calendar.year-1, Calendar.month)
    Calendar.flash(Calendar.year)
  }

  static prevMonth() {
    const year = Calendar.month==1 ? Calendar.year-1 : Calendar.year
    const month = Calendar.month==1 ? 12 : Calendar.month-1
    Calendar.show(year, month)
    Calendar.flash(Calendar.month + ' <span class="hanzi">月<span>')
  }

  static today() {
    const today = new Date()
    Calendar.show(today.getFullYear(), today.getMonth()+1)
  }

  static nextMonth() {
    const year = Calendar.month==12 ? Calendar.year+1 : Calendar.year
    const month = Calendar.month==12 ? 1 : Calendar.month+1
    Calendar.show(year, month)
    Calendar.flash(Calendar.month + ' <span class="hanzi">月<span>')
  }

  static nextYear() {
    Calendar.show(Calendar.year+1, Calendar.month)
    Calendar.flash(Calendar.year)
  }

  static show(year, month) {
    function _show(year, month) {
      CalendarMonth.current = new CalendarMonth(year, month)
          .exec(Calendar.annotators)
          .show(Calendar.$cld)
    }

    try {
      _show(year, month)
      Calendar.year = year; Calendar.month = month
    } catch(e) {
      console.error(e); alert(e)
      _show(Calendar.year, Calendar.month)
    }
    Calendar.$year.value = Calendar.year
    Calendar.$month.value = Calendar.month
  }

  static flash(value) {
    Calendar.$flash.innerHTML = `<div class="content">${value}</div>`
    $on($E('.content', Calendar.$flash))
    .perform('fade-out')
    .then(() => Calendar.$flash.innerHTML = '')
  }

  static locale() {
    if(typeof State !== 'undefined') {
      // This is needed bacause of a Chrome defect.
      // The result of window.navigator.language is incorrect when running an installed PWA.
      const locale = State.get('installationTimeLocale')
      if(locale) {
        // console.trace("[TRACE] Returning cached installationTimeLocale: %s", locale)
        return locale
      } else {
        // console.debug("[DEBUG] No cached installationTimeLocale is available yet.")
      }
    }

    const locale = resolveNavigatorLocale()
    // console.trace("[TRACE] Returning resolved navigator locale: %s", locale)
    return locale
  }

  static #resolveDynamicScripts(definedQualifiers, version) {
    const locale = Calendar.locale()
    const offset = timezoneOffset()

    const qualifiers = []
    for(const qualifier of [locale, 'UTC'+offset, `${locale}.UTC${offset}`]) {
      if(definedQualifiers.includes(qualifier)) qualifiers.push(qualifier)
    }
    // console.debug("[DEBUG] Resolved qualifiers: %o", qualifiers);

    const scripts = qualifiers.map(qualifier => `${HREF_BASE}/scripts/date-annotations.${qualifier}.js?${version}`);
    // console.debug("[DEBUG] Resolved dynamic scripts: %o", scripts);
    return scripts
  }

}

Calendar.currentScript = document.currentScript
