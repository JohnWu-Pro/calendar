'use strict';

class CalendarDay {
  monthOffset
  solarDay
  lunarDay
  annotations = [] // Annotation

  constructor(monthOffset, solarDay) {
    this.monthOffset = monthOffset
    this.solarDay = solarDay
  }

  isToday() {
    return this.solarDay.day==CalendarDay.today.getDate() &&
        (this.solarDay.solarMonth.month-1)==CalendarDay.today.getMonth() &&
        this.solarDay.solarMonth.solarYear.year==CalendarDay.today.getFullYear()
  }

  annotate(annotation) {
    this.annotations.push(annotation)
  }

  cell(div) {
    const model = {
      background: {classes: ['background'], content: ''},
      solar: {classes: ['solar'], content: this.solarDay.text},
      note: {classes: ['note'], content: ''}
    }
    if(this.isToday()) model.background.classes.push('today')
    if(this.solarDay.isWeekend()) model.solar.classes.push('weekend')

    // Decorate the cell based on annotations
    Annotation.sort(this.annotations)
    for(const annotation of this.annotations) {
      CalendarDay.cellDecorators.get(annotation.type)(model, annotation)
      if(model.note.content) break
    }

    if(this.monthOffset!=0) div.classList.add('out-of-month')
    div.innerHTML = `
        <div class="${model.background.classes.join(' ')}">${model.background.content}</div>
        <div class="${model.solar.classes.join(' ')}">${model.solar.content}</div>
        <div class="${model.note.classes.join(' ')}">${model.note.content || this.lunarDay.text}</div>
        `
  }

  details(div) {
    const year = this.solarDay.solarMonth.solarYear.year
    const month = this.solarDay.solarMonth.month
    const day = this.solarDay.day

    const weekdayName = this.solarDay.weekdayName()
    const weekdayClass = this.solarDay.isWeekend() ? 'weekend' : 'weekday'

    const notes = [] // {classes: [], content: ''}
    for(const annotation of this.annotations) {
      CalendarDay.detailRenderers.get(annotation.type)(this, notes, annotation)
    }

    div.innerHTML = /*html*/`
      <div class="content">
        <div class="date">
          <div class="solar">公元 ${year}年${month}月${day}日 <span class="${weekdayClass}">${weekdayName}</span></div>
          <div class="lunar">农历 ${this.lunarDay.lunarMonth.text}${this.lunarDay.text}</div>
          <div class="ganzhi">子时四柱 ${Ganzhi.fourPillarsOf(this.solarDay)}</div>
        </div>
        <div class="notes">${notes.reduce((html, note) => (html + `
          <div class="${note.classes.join(' ')}">${note.content}</div>`
        ), '')}</div>
      </div>
    `
    $on($E('.content', div))
    .perform('slide-up')
    .then(() => div.innerHTML = '')
  }

  static compact(string) {
    const code = string.charCodeAt(0)
    const capacity = (0<code && code<128) ? 6 : 3;
    string = string.replace(/国际/, '').replace(/中国/, '')
    return string.length<=(capacity+1) ? string : (string.substr(0, capacity) + '..')
  }

  static cellDecorators = new Map([
    [Annotation.TYPE_DUTY_ADJUST, (model, annotation) => {
      model.solar.classes.push(annotation.value=='+' ? 'on' : 'off')
    }],
    [Annotation.TYPE_HOLIDAY, (model, annotation) => {
      model.note.classes.push((annotation.isSolarBased ? 'solar' : 'lunar'), 'holiday')
      model.note.content = CalendarDay.compact(annotation.value)
    }],
    [Annotation.TYPE_FESTIVAL, (model, annotation) => {
      model.note.classes.push((annotation.isSolarBased ? 'solar' : 'lunar'), 'festival')
      model.note.content = CalendarDay.compact(annotation.value)
    }],
    [Annotation.TYPE_SOLAR_TERM, (model, annotation) => {
      model.note.classes.push('solar-term')
      model.note.content = annotation.value
    }],
    [Annotation.TYPE_LUNAR_MONTH_FIRST_DAY, (model, annotation) => {
      model.note.classes.push('first-day')
      model.note.content = annotation.value
    }],
    [Annotation.TYPE_MEMO, (model, annotation) => {}]
  ])

  static detailRenderers = new Map([
    [Annotation.TYPE_DUTY_ADJUST, (day, notes, annotation) => {
      if(! day.annotations.find(it => it.type==Annotation.TYPE_HOLIDAY)) {
        notes.push({classes: [(annotation.value=='+' ? 'on' : 'off'), 'duty'],
            content: annotation.value=='+' ? '调班' : '调休'})
      }
    }],
    [Annotation.TYPE_HOLIDAY, (day, notes, annotation) => {
      notes.push({classes: [(annotation.isSolarBased ? 'solar' : 'lunar'), 'holiday'], content: annotation.value})
    }],
    [Annotation.TYPE_FESTIVAL, (day, notes, annotation) => {
      notes.push({classes: [(annotation.isSolarBased ? 'solar' : 'lunar'), 'festival'], content: annotation.value})
    }],
    [Annotation.TYPE_SOLAR_TERM, (day, notes, annotation) => {
      notes.push({classes: ['solar-term'], content: annotation.value + ' ' + annotation.time})
    }],
    [Annotation.TYPE_LUNAR_MONTH_FIRST_DAY, (day, notes, annotation) => {}],
    [Annotation.TYPE_MEMO, (day, notes, annotation) => {
      notes.push({classes: ['memo'], content: annotation.value})
    }]
  ])

  static today = new Date()

  static UNRESOLVABLE = {
    cell: (div) => {
      div.classList.add('unresolvable')
      div.innerHTML = /*html*/`
        <div class="background"></div>
        <div class="solar"></div>
        <div class="note"></div>
      `
    },
    details: (div) => {}
  }
}
