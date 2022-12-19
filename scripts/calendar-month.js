'use strict';

class CalendarMonth {
  solarMonth

  allDays       // []: CalendarDay
  resolvedDays  // []: CalendarDay
  prevMonthDays // []: CalendarDay
  currMonthDays // []: CalendarDay
  nextMonthDays // []: CalendarDay

  div

  constructor(year, month) {
    this.solarMonth = new SolarMonth(new SolarYear(year), month)

    const allDays = []
    var start, end

    const prevDays = this.solarMonth.firstWeekday
    if(this.solarMonth.isFirst()) {
      for(let day=-prevDays; day<0; day++) {
        allDays.push(CalendarDay.UNRESOLVABLE)
      }
      start = allDays.length
      this.prevMonthDays = []
    } else {
      const prevMonth = this.solarMonth.prev()
      for(let day=prevMonth.length-prevDays+1; day<=prevMonth.length; day++) {
        allDays.push(new CalendarDay(-1, new SolarDay(prevMonth, day)))
      }
      start = 0
      this.prevMonthDays = allDays.slice()
    }

    for(let day=1; day<=this.solarMonth.length; day++) {
      allDays.push(new CalendarDay(0, new SolarDay(this.solarMonth, day)))
    }
    this.currMonthDays = allDays.slice(prevDays)

    const nextDays = (77 - (this.solarMonth.firstWeekday+this.solarMonth.length)) % 7
    if(this.solarMonth.isLast()) {
      end = allDays.length
      for(let day=1; day<=nextDays; day++) {
        allDays.push(CalendarDay.UNRESOLVABLE)
      }
      this.nextMonthDays = []
    } else {
      const nextMonth = this.solarMonth.next()
      for(let day=1; day<=nextDays; day++) {
        allDays.push(new CalendarDay(1, new SolarDay(nextMonth, day)))
      }
      end = allDays.length
      this.nextMonthDays = nextDays==0 ? [] : allDays.slice(-nextDays)
    }

    this.resolvedDays = (start==0 && end==allDays.length) ? allDays : allDays.slice(start, end)

    let lunarDay = LunarDay.findMatchingDay(this.resolvedDays[0].solarDay)
    this.resolvedDays.forEach(day => {
      day.lunarDay = lunarDay
      lunarDay = lunarDay.next()
    })

    this.allDays = allDays
    CalendarDay.today = new Date()
  }

  exec(annotators) {
    for(const func of annotators) {
      func(this)
    }

    return this
  }

  show(div) {
    this.div = div
    this.showHeadCells($E('.head', div))
    this.initBodyCells($E('.body', div), this.allDays.length / 7)
    this.setYearInfo()

    $E('.details', div).innerHTML = ''

    let row = 0, column = 0
    this.allDays.forEach(day => {
      day.cell($ID(`c${row}${column}`))
      column++; if(column>=7) {row++,column=0}
    })

    return this
  }

  setYearInfo() {
    const year = this.solarMonth.solarYear.year

    var era
         if(year < 1874) era = '年号'
    else if(year < 1908) era = '光绪' + (year==1874 ? '元' : year-1874)
    else if(year < 1913) era = '宣统' + (year==1908 ? '元' : year-1908)
    else if(year < 1949) era = '民国' + (year==1913 ? '元' : year-1913)
    else                 era = '建国' + (year==1949 ? '元' : year-1949)

    $ID('year').innerHTML = `${era}年 农历${Ganzhi.year(year)}年`
    $ID('animal').innerHTML = `【${Ganzhi.animal(year)}】`
  }

  showHeadCells(div) {
    let html = `<div class="row">`
    for(let column=0; column<7; column++) {
      const cellClasses = (column==0 || column==6) ? 'cell weekend' : 'cell'
      html += `<div class="${cellClasses}" id="h${column}">${CalendarMonth.weekdayTitles[column]}</div>`
    }
    html += '</div>'
    div.innerHTML = html;
  }

  initBodyCells(div, rows) {
    let html = ''
    for(let row=0; row<rows; row++) {
      html += `<div class="row" id="r${row}">`
      for(let column=0; column<7; column++) {
        html += `<div class="cell" id="c${row}${column}" onclick="CalendarMonth.current.details(this)"></div>`
      }
      html += '</div>'
    }
    div.innerHTML = html;
  }

  details(div) {
    const row = parseInt(div.id.substring(1,2))
    const column = parseInt(div.id.substring(2,3))
    this.allDays[row*7+column].details($E('.details', this.div))
  }

  static annotateLunarMonthFirstDay(calendarMonth) {
    calendarMonth.resolvedDays.forEach(day => {
      if(day.lunarDay.day == 1) {
        const lunarMonth = day.lunarDay.lunarMonth
        const value = lunarMonth.text + (lunarMonth.length<30 ? '小' : '大')
        day.annotate(Annotation.lunarMonthFirstDay(value))
      }
    });
  }

  static annotateSolarTerms(calendarMonth) {
    if(calendarMonth.prevMonthDays.length > 0) {
      CalendarMonth.annotateSolarTerm(calendarMonth.solarMonth.prev(), calendarMonth.prevMonthDays, 1)
    }
    CalendarMonth.annotateSolarTerm(calendarMonth.solarMonth, calendarMonth.currMonthDays, 0)
    CalendarMonth.annotateSolarTerm(calendarMonth.solarMonth, calendarMonth.currMonthDays, 1)
    if(calendarMonth.nextMonthDays.length > 0) {
      CalendarMonth.annotateSolarTerm(calendarMonth.solarMonth.next(), calendarMonth.nextMonthDays, 0)
    }
  }

  static annotateSolarTerm(solarMonth, days, offset) {
    const coord = (solarMonth.month-1)*2 + offset
    const date = new Date(SOLAR_TERM_TIMES.get(solarMonth.solarYear.year)[coord] + CONFIG.baseTimezoneOffset*60000)

    const dd = date.getUTCDate()
    const index = dd - days[0].solarDay.day
    if(!(0 <= index && index < days.length)) return

    const HH = date.getUTCHours()
    const hh = padLeft((HH > 12 ? HH-12 : HH), 2)
    const mm = padLeft(date.getUTCMinutes(), 2)
    const ss = padLeft(date.getUTCSeconds(), 2)

    var period
         if(HH < 6)  period = '凌晨'
    else if(HH < 12) period = '上午'
    else if(HH < 18) period = '下午'
    else             period = '晚上'

    const value = SOLAR_TERM_NAMES[coord]
    const time = `${period}${hh}:${mm}:${ss}`
    days[index].annotate(Annotation.solarTerm(value, time))
  }

  static weekdayTitles = ['日','一','二','三','四','五','六']
}
