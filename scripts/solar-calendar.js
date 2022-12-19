'use strict';

class SolarYear {
  year
  isLeapYear
  length
  firstDayOffset // since 1900-01-01

  constructor(year) {
    if(year < CONFIG.baseYear || year > CONFIG.lastYear) throw CONFIG.alertUnresolvable

    this.year = year
    this.isLeapYear = SolarYear.isLeapYear(year)
    this.length = SolarYear.length(year)

    let firstDayOffset = 0
    for(let y=CONFIG.baseYear; y<year; y++) {
      firstDayOffset += SolarYear.length(y)
    }
    this.firstDayOffset = firstDayOffset
  }

  prev() {
    return new SolarYear(this.year-1)
  }

  next() {
    return new SolarYear(this.year+1)
  }

  static length(year) {
    return SolarYear.isLeapYear(year) ? 366 : 365
  }

  static isLeapYear(year) {
    if(year % 4 != 0)
      return false
    else if(year % 100 != 0)
      return true
    else if(year % 400 != 0)
      return false
    else
      return true
  }
}

class SolarMonth {
  solarYear
  month // 1: Jan, 2: Feb, ...
  length
  firstDayOffset
  firstWeekday

  constructor(solarYear, month) {
    if(solarYear.year == CONFIG.baseYear && month == 1) throw CONFIG.alertUnresolvable

    this.solarYear = solarYear
    this.month = month
    this.length = SolarMonth.length(solarYear.year, month)

    let firstDayOffset = solarYear.firstDayOffset
    for(let m=1; m<month; m++) {
      firstDayOffset += SolarMonth.length(solarYear.year, m)
    }
    this.firstDayOffset = firstDayOffset
    this.firstWeekday = (this.firstDayOffset + CONFIG.baseWeekday) % 7
  }

  isFirst() {
    return this.solarYear.year == CONFIG.baseYear && this.month == 2
  }

  isLast() {
    return this.solarYear.year == CONFIG.lastYear && this.month == 12
  }

  prev() {
    if(this.month == 1) {
      return new SolarMonth(this.solarYear.prev(), 12)
    } else {
      return new SolarMonth(this.solarYear, this.month-1)
    }
  }

  next() {
    if(this.month == 12) {
      return new SolarMonth(this.solarYear.next(), 1)
    } else {
      return new SolarMonth(this.solarYear, this.month+1)
    }
  }

  static lengths = [0,31,-1,31,30,31,30,31,31,30,31,30,31]

  static length(year, month) {
    return month==2 ? (SolarYear.isLeapYear(year) ? 29 : 28) : SolarMonth.lengths[month]
  }

  /**
   * Gets the N'th weekday in the specified year-month.
   *
   * year: the full year number, such as 2001, 2020
   * month: 1=Jan, 2=Feb, ..., 12=Dec
   * nth: positive indicates from beginning of the month,
          negative indicates from end of the month;
          1=first, 2=second, ...
   * weekday: 0=Sunday, 1=Monday, ..., 6=Saturday
   *
   * returns the date (1..31) in the month
   */
  static getNthWeekday(year, month, nth, weekday) {
    const solarMonth = new SolarMonth(new SolarYear(year), month)

    var day, offset
    if(nth > 0) {
      day = 1
      const wkday = solarMonth.firstWeekday
      offset = (weekday<wkday ? weekday+7-wkday : weekday-wkday) + (nth-1)*7
    } else {
      nth = -nth
      day = solarMonth.length
      const wkday = (solarMonth.firstWeekday + solarMonth.length - 1) % 7
      offset = (weekday>wkday ? weekday-7-wkday : weekday-wkday) - (nth-1)*7
    }
    return day + offset
  }

}

class SolarDay {
  solarMonth
  day
  text

  constructor(solarMonth, day) {
    this.solarMonth = solarMonth
    this.day = day
    this.text = day.toString()
  }

  offset() {
    return this.solarMonth.firstDayOffset + this.day - 1
  }

  weekday() {
    return (this.solarMonth.firstWeekday + this.day - 1) % 7
  }

  weekdayName() {
    return SolarDay.weekdayNames[this.weekday()]
  }

  isWeekend() {
    const wkday = this.weekday()
    return wkday==0 || wkday==6
  }

  getMMdd() {
    return padLeft(this.solarMonth.month, 2) + padLeft(this.day, 2)
  }

  static weekdayNames = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六']
}
