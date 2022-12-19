'use strict';

class LunarYear {
  year
  _firstDayOffset = INT_UNDEFINED // since 1900-01-01
  leapMonth
  leapMonthDays
  length

  constructor(year, firstDayOffset = INT_UNDEFINED) {
    if(year < CONFIG.baseYear || year > CONFIG.lastYear) throw CONFIG.alertUnresolvable

    this.year = year
    this._firstDayOffset = firstDayOffset

    Object.assign(this, LunarYear.resolve(year))
  }

  get firstDayOffset() {
    if(this._firstDayOffset == INT_UNDEFINED) {
      // console.debug("[DEBUG] Going to resolve the LunarYear.firstDayOffset ...")

      let firstDayOffset = LunarYear.baseDayOffset
      for(let year=CONFIG.baseYear; year<this.year; year++) {
        firstDayOffset += LunarYear.length(year)
      }
      this._firstDayOffset = firstDayOffset
    }
    return this._firstDayOffset
  }

  // prev() {
  //   if(this._firstDayOffset==INT_UNDEFINED) {
  //     return new LunarYear(this.year-1)
  //   } else {
  //     const prevYear = new LunarYear(this.year-1)
  //     prevYear._firstDayOffset = this._firstDayOffset - prevYear.length
  //     return prevYear
  //   }
  // }

  next() {
    return new LunarYear(this.year+1, this._firstDayOffset==INT_UNDEFINED ? INT_UNDEFINED : (this._firstDayOffset+this.length))
  }

  static baseDayOffset = 30 // 农历1900年的春节(1900-01-31)离1900-01-01的偏移

  static length(year) {
    return LunarYear.resolve(year).length
  }

  static resolve(year) {
    const result = {leapMonth: 0, leapMonthDays: 0}

    const metadata = LunarMonth.metadata[year-CONFIG.baseYear]
    if(! [0x00, 0x0F].includes(metadata & 0x0F)) {
      result.leapMonth = metadata & 0x0F
      result.leapMonthDays = (LunarMonth.metadata[year-CONFIG.baseYear+1] & 0x0F)==0x0F ? 30 : 29
    }

    let sum = 0
    for(let mask=0x08000; mask>0x08; mask>>=1) {
      sum += (metadata & mask) ? 30 : 29
    }
    result.length = sum + result.leapMonthDays

    return result
  }
}

class LunarMonth {
  lunarYear
  month
  isLeapMonth
  text
  length
  _firstDayOffset // since 1900-01-01

  constructor(lunarYear, month, isLeapMonth = false, firstDayOffset = INT_UNDEFINED) {
    this.lunarYear = lunarYear
    this.month = month
    this.isLeapMonth = isLeapMonth
    if(this.isLeapMonth) {
      this.text = '闰' + LunarMonth.names[month] + '月'
      this.length = LunarMonth.length(this.lunarYear, month, true)
    } else {
      this.text = LunarMonth.names[month] + '月'
      this.length = LunarMonth.length(this.lunarYear, month)
    }
    this._firstDayOffset = firstDayOffset
  }

  get firstDayOffset() {
    if(this._firstDayOffset == INT_UNDEFINED) {
      // console.debug("[DEBUG] Going to resolve the LunarMonth.firstDayOffset ...")

      let firstDayOffset = this.lunarYear.firstDayOffset
      for(let month=1; month<this.month; month++) {
        firstDayOffset += LunarMonth.length(this.lunarYear, month)
        if(this.lunarYear.leapMonth == month) {
          firstDayOffset += LunarMonth.length(this.lunarYear, month, true)
        }
      }
      if(this.isLeapMonth) {
        firstDayOffset += LunarMonth.length(this.lunarYear, this.month, true)
      }
      this._firstDayOffset = firstDayOffset
    }
    return this._firstDayOffset
  }

  // prev() {
  //   var prevMonth
  //   if(this.isLeapMonth) {
  //     prevMonth = new LunarMonth(this.lunarYear, this.month, false)
  //   } else {
  //     const lunarYear = this.month==1 ? this.lunarYear.prev() : this.lunarYear
  //     const month = this.month==1 ? 12 : this.month-1
  //     prevMonth = new LunarMonth(lunarYear, month, lunarYear.leapMonth==month)
  //   }
  //   if(this._firstDayOffset==INT_UNDEFINED) {
  //     return prevMonth
  //   } else {
  //     prevMonth._firstDayOffset = this._firstDayOffset - prevMonth.length
  //     return prevMonth
  //   }
  // }

  next() {
    const nextIsLeapMonth = this.lunarYear.leapMonth==this.month && (!this.isLeapMonth)
    const firstDayOffset = this._firstDayOffset==INT_UNDEFINED ? INT_UNDEFINED : (this._firstDayOffset+this.length)
    if(nextIsLeapMonth)
      return new LunarMonth(this.lunarYear, this.month, true, firstDayOffset)
    else if(this.month < 12)
      return new LunarMonth(this.lunarYear, this.month+1, false, firstDayOffset)
    else
      return new LunarMonth(this.lunarYear.next(), 1, false, firstDayOffset)
  }

  static names = ['','正','二','三','四','五','六','七','八','九','十','冬','腊']
  static metadata = [
    0x4bd8,0x4ae0,0xa570,0x54d5,0xd260,0xd950,0x5554,0x56af,0x9ad0,0x55d2,
    0x4ae0,0xa5b6,0xa4d0,0xd250,0xd295,0xb54f,0xd6a0,0xada2,0x95b0,0x4977,
    0x497f,0xa4b0,0xb4b5,0x6a50,0x6d40,0xab54,0x2b6f,0x9570,0x52f2,0x4970,
    0x6566,0xd4a0,0xea50,0x6a95,0x5adf,0x2b60,0x86e3,0x92ef,0xc8d7,0xc95f,
    0xd4a0,0xd8a6,0xb55f,0x56a0,0xa5b4,0x25df,0x92d0,0xd2b2,0xa950,0xb557,
    0x6ca0,0xb550,0x5355,0x4daf,0xa5b0,0x4573,0x52bf,0xa9a8,0xe950,0x6aa0,
    0xaea6,0xab50,0x4b60,0xaae4,0xa570,0x5260,0xf263,0xd950,0x5b57,0x56a0,
    0x96d0,0x4dd5,0x4ad0,0xa4d0,0xd4d4,0xd250,0xd558,0xb540,0xb6a0,0x95a6,
    0x95bf,0x49b0,0xa974,0xa4b0,0xb27a,0x6a50,0x6d40,0xaf46,0xab60,0x9570,
    0x4af5,0x4970,0x64b0,0x74a3,0xea50,0x6b58,0x5ac0,0xab60,0x96d5,0x92e0,
    0xc960,0xd954,0xd4a0,0xda50,0x7552,0x56a0,0xabb7,0x25d0,0x92d0,0xcab5,
    0xa950,0xb4a0,0xbaa4,0xad50,0x55d9,0x4ba0,0xa5b0,0x5176,0x52bf,0xa930,
    0x7954,0x6aa0,0xad50,0x5b52,0x4b60,0xa6e6,0xa4e0,0xd260,0xea65,0xd530,
    0x5aa0,0x76a3,0x96d0,0x4afb,0x4ad0,0xa4d0,0xd0b6,0xd25f,0xd520,0xdd45,
    0xb5a0,0x56d0,0x55b2,0x49b0,0xa577,0xa4b0,0xaa50,0xb255,0x6d2f,0xada0,
    0x4b63,0x937f,0x49f8,0x4970,0x64b0,0x68a6,0xea5f,0x6b20,0xa6c4,0xaaef,
    0x92e0,0xd2e3,0xc960,0xd557,0xd4a0,0xda50,0x5d55,0x56a0,0xa6d0,0x55d4,
    0x52d0,0xa9b8,0xa950,0xb4a0,0xb6a6,0xad50,0x55a0,0xaba4,0xa5b0,0x52b0,
    0xb273,0x6930,0x7337,0x6aa0,0xad50,0x4b55,0x4b6f,0xa570,0x54e4,0xd260,
    0xe968,0xd520,0xdaa0,0x6aa6,0x56df,0x4ae0,0xa9d4,0xa4d0,0xd150,0xf252,
    0xd520
  ];
  static maxLag = 3

  static length(lunarYear, month, isLeapMonth = false) {
    return isLeapMonth ? lunarYear.leapMonthDays :
        ((LunarMonth.metadata[lunarYear.year-CONFIG.baseYear] & (0x010000>>month)) ? 30 : 29)
  }

  static findCoveringMonth(solarDay) {
    let year = solarDay.solarMonth.solarYear.year
    let month = solarDay.solarMonth.month

    month = month - LunarMonth.maxLag
    if(month <= 0) {
      year--; month += 12
      if(year < CONFIG.baseYear) {
        year = CONFIG.baseYear; month = 1
      }
    }

    const targetDayOffset = solarDay.offset()
    let lunarYear = new LunarYear(year)
    let lunarMonth = new LunarMonth(lunarYear, month)
    while(true) {
      const firstDayOffset = lunarMonth.firstDayOffset
      if(firstDayOffset > targetDayOffset) {
        throw `Could NOT find covering lunar month for ${solarDay.solarMonth.solarYear.year}-${solarDay.solarMonth.month}-${solarDay.day}. Consider adjusting the lunar month max-lag.`
      } else if(firstDayOffset <= targetDayOffset && targetDayOffset < firstDayOffset+lunarMonth.length) {
        return lunarMonth
      } else {
        lunarMonth = lunarMonth.next()
      }
    }
  }
}

class LunarDay {
  lunarMonth
  day
  text
  // isFestival
  // festivalName
  // isHoliday

  constructor(lunarMonth, day) {
    this.lunarMonth = lunarMonth
    this.day = day
    this.text = LunarDay.textOf(day)
  }

  next() {
    return this.day+1 <= this.lunarMonth.length
      ? new LunarDay(this.lunarMonth, this.day+1)
      : new LunarDay(this.lunarMonth.next(), 1)
  }

  static nameInit = ['初','十','廿','卅']
  static nameNum = ['','一','二','三','四','五','六','七','八','九','十']

  static textOf(day) {
    switch(day) {
      case 10:
        return '初十'
      case 20:
        return '二十'
      case 30:
        return '三十'
      default:
        return LunarDay.nameInit[Math.floor(day/10)] + LunarDay.nameNum[day%10];
    }
  }

  static findMatchingDay(solarDay) {
    const lunarMonth = LunarMonth.findCoveringMonth(solarDay)
    return new LunarDay(lunarMonth, solarDay.offset() - lunarMonth.firstDayOffset + 1)
  }
}
