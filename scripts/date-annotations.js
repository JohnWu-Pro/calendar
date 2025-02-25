'use strict';

(function() {

function annotateSolarDates(calendarMonth, monthDates, weekdays, autoAdjustDuty = false) {
  const year = calendarMonth.solarMonth.solarYear.year

  const monthToDays = new Map()
  if(calendarMonth.prevMonthDays.length > 0) {
    monthToDays.set(calendarMonth.solarMonth.prev().month, calendarMonth.prevMonthDays)
  }
  monthToDays.set(calendarMonth.solarMonth.month, calendarMonth.currMonthDays)
  if(calendarMonth.nextMonthDays.length > 0) {
    monthToDays.set(calendarMonth.solarMonth.next().month, calendarMonth.nextMonthDays)
  }

  function dayAt(month, days, index, offset) {
    if(offset>0) {
      if(index+offset < days.length) return days[index+offset]

      index = index+offset - days.length
      days = monthToDays.get(month+1)
      return (days && index < days.length) ? days[index] : null
    } else { // offset < 0
      if(index+offset >= 0) return days[index+offset]

      days = monthToDays.get(month-1)
      if(! days) return null

      index = index+offset + days.length
      return (0 <= index && index < days.length) ? days[index] : null
    }
  }

  const dutyOffDays = new Map() // MMdd -> duty-off-day
  function setDutyOffDays(month, days, index, type) {
    if(!(type === Annotation.TYPE_HOLIDAY && autoAdjustDuty)) return

    const solarDay = days[index].solarDay
    const weekday = solarDay.weekday()
    const _MMdd = solarDay.getMMdd()

    let offDay = null
    if(dutyOffDays.has(_MMdd) && weekday === 1) {
      offDay = dayAt(month, days, index, 1) // annotate the next day (Tuesday) duty-off
      if(offDay) {
        dutyOffDays.set(offDay.solarDay.getMMdd(), offDay)
      }
      return
    }

    if(weekday === 6) { // Saturday
      offDay = dayAt(month, days, index, -1) // annotate the previous day (Friday) duty-off
      if(offDay && dutyOffDays.has(offDay.solarDay.getMMdd())) {
        offDay = dayAt(month, days, index, 2) // annotate two days after (Monday) duty-off
      }
    } else if(weekday === 0) { // Sunday
      offDay = dayAt(month, days, index, 1) // annotate the next day (Monday) duty-off
    } else {
      offDay = days[index] // annotate the non-weekend holiday duty-off
    }
    if(offDay) {
      dutyOffDays.set(offDay.solarDay.getMMdd(), offDay)
    }
  }

  function annotate(specs, dayFn) {
    var matches
    for(const spec of specs) {
      if(matches=resolve(year, spec)) {
        const month = parseInt(matches[1],10)
        const days = monthToDays.get(month)
        if(days) {
          const index = dayFn(month, matches) - days[0].solarDay.day
          if(0 <= index && index < days.length) {
            const type = TYPES.get(matches[3])
            days[index].annotate(new Annotation(type, matches[4]))
            setDutyOffDays(month, days, index, type)
          }
        }
      }
    }
  }

  annotate(monthDates, (month, matches) => parseInt(matches[2],10))

  annotate(weekdays, (month, matches) => {
    let nth = parseInt(matches[2].substring(0,1),10); if(nth>4) nth = 4-nth
    const weekday = parseInt(matches[2].substring(1),10)
    return SolarMonth.getNthWeekday(year, month, nth, weekday)
  })

  dutyOffDays.forEach((offDay, _MMdd) => {
    offDay.annotate(Annotation.dutyAdjust('-'))
  })
}

function annotateConstellations(calendarMonth) {
  const index = calendarMonth.solarMonth.month

  let constellation = Constellation.of(index)
  for(let day of calendarMonth.prevMonthDays) {
    day.annotate(Annotation.constellation(constellation))
  }

  const switchDay = Constellation.switchDay(calendarMonth.solarMonth)
  for(let day of calendarMonth.currMonthDays) {
    if(day.solarDay.day === switchDay) {
      constellation = Constellation.of(index+1)
    }
    day.annotate(Annotation.constellation(constellation))
  }

  for(let day of calendarMonth.nextMonthDays) {
    day.annotate(Annotation.constellation(constellation))
  }
}

function annotateLunarDates(calendarMonth) {
  const year = calendarMonth.solarMonth.solarYear.year

  const monthToDays = new Map()
  for(let index = 0; index < calendarMonth.resolvedDays.length; ) {
    const lunarDay = calendarMonth.resolvedDays[index].lunarDay
    const monthDays = calendarMonth.resolvedDays.slice(index, index + lunarDay.lunarMonth.length - lunarDay.day + 1)
    monthToDays.set(lunarDay.lunarMonth.month, monthDays)
    index += monthDays.length
  }

  var matches
  for(const info of LUNAR_DATES) {
    if(matches=resolve(year, info)) {
      const days = monthToDays.get(parseInt(matches[1],10))
      if(days) {
        let day = parseInt(matches[2],10)
        if(day === 99) {
          const lunarMonth = days[0].lunarDay.lunarMonth
          if(lunarMonth.isLeapMonth || lunarMonth.lunarYear.leapMonth!=lunarMonth.month) {
            day = lunarMonth.length
          } // else, should not be matched
        }
        const index = day - days[0].lunarDay.day
        if(0 <= index && index < days.length) {
          days[index].annotate(new Annotation(TYPES.get(matches[3]), matches[4], false))
        }
      }
    }
  }
}

function resolve(year, spec) {
  const matches = spec.match(/^(\d{2})(\d{2})([ \*\+])([^:]+)(?::\[([\d\.]+),([\d\.]+)\])?$/)
  return isEffective(year, matches[5], matches[6]) ? matches : null
}

function isEffective(year, from, to) {
  const fromYear = parseYearBoundary(from, Number.MIN_VALUE)
  const toYear = parseYearBoundary(to, Number.MAX_VALUE)
  return fromYear<=year && year<=toYear;
}

function parseYearBoundary(boundary, defaultValue) {
  return (boundary===undefined || boundary===null || boundary==='..') ? defaultValue : parseInt(boundary,10);
}

const TYPES = new Map([
  ['*', Annotation.TYPE_HOLIDAY],  // * indicates statutory/public holiday
  ['+', Annotation.TYPE_FESTIVAL], // + indicates festival
  [' ', Annotation.TYPE_MEMO]
])

// Solar calendar month-date based holidays, festivals, and memorial days
// Expected the dates to be in natural order
const SOLAR_MONTH_DATES = [
  '0101*新年',
  '0202 世界湿地日',
  '0207 国际声援南非日',
  '0210 国际气象节',
  '0214+情人节',
  '0301 国际海豹日',
  '0303 全国爱耳日',
  '0308+国际妇女节',
  '0312 植树节',
  '0312 孙中山逝世纪念日',
  '0314 国际警察日',
  '0315 国际消费者权益日',
  '0317 中国国医节',
  '0317 国际航海日',
  '0321 世界森林日',
  '0321 消除种族歧视国际日',
  '0321 世界儿歌日',
  '0322 世界水日',
  '0323 世界气象日',
  '0324 世界防治结核病日',
  '0325 全国中小学生安全教育日',
  '0330 巴勒斯坦国土日',
  '0401 愚人节',
  '0407 世界卫生日',
  '0422 地球日',
  '0423 世界图书和版权日',
  '0424 亚非新闻工作者日',
  '0501*国际劳动节',
  '0504 中国五四青年节',
  '0505 碘缺乏病防治日',
  '0508 世界红十字日',
  '0512 国际护士节',
  '0515 国际家庭日',
  '0517 世界电信日',
  '0518 国际博物馆日',
  '0520 全国学生营养日',
  '0523 国际牛奶日',
  '0531 世界无烟日',
  '0601+国际儿童节',
  '0605 世界环境日',
  '0606 全国爱眼日',
  '0617 防治荒漠化和干旱日',
  '0623 国际奥林匹克日',
  '0625 全国土地日',
  '0626 国际反毒品日',
  '0701+建党节',
  '0701 香港回归纪念',
  '0701 世界建筑日',
  '0702 国际体育记者日',
  '0707 中国人民抗日战争纪念日',
  '0711 世界人口日',
  '0730 非洲妇女日',
  '0801+中国建军节',
  '0808 中国男子节(爸爸节)',
  '0815 日本正式宣布无条件投降日',
  '0908 国际扫盲日',
  '0908 国际新闻工作者日',
  '0910+中国教师节',
  '0914 世界清洁地球日',
  '0916 国际臭氧层保护日',
  '0918 九·一八事变纪念日',
  '0920 国际爱牙日',
  '0927 世界旅游日',
  '1001*中国国庆节',
  '1001 世界音乐日',
  '1001 国际老人节',
  '1002 国际和平与民主自由斗争日',
  '1004 世界动物日',
  '1008 全国高血压日',
  '1008 世界视觉日',
  '1009 世界邮政日',
  '1010 辛亥革命纪念日',
  '1010 世界精神卫生日',
  '1013 世界保健日',
  '1013 国际教师节',
  '1014 世界标准日',
  '1015 国际盲人节(白手杖节)',
  '1016 世界粮食日',
  '1017 世界消除贫困日',
  '1022 世界传统医药日',
  '1024 联合国日',
  '1024 世界发展信息日',
  '1031 世界勤俭日',
  '1107 十月社会主义革命纪念日',
  '1108 中国记者日',
  '1109 全国消防安全宣传教育日',
  '1110 世界青年节',
  '1111 光棍节',
  '1111 网上购物节',
  '1111 国际科学与和平周(本日所属的一周)',
  '1112 孙中山诞辰纪念日',
  '1114 世界糖尿病日',
  '1117 国际大学生节',
  '1121 世界问候日',
  '1121 世界电视日',
  '1129 国际声援巴勒斯坦人民国际日',
  '1201 世界艾滋病日',
  '1203 世界残疾人日',
  '1205 国际经济和社会发展志愿人员日',
  '1208 国际儿童电视日',
  '1209 世界足球日',
  '1210 世界人权日',
  '1212 西安事变纪念日',
  '1213 南京大屠杀纪念日！',
  '1221 国际篮球日',
  '1224 平安夜',
  '1229 国际生物多样性日'
]

// Solar calendar weekday based holidays, festivals, and memorial days
// MMsw: MM=month, w=weekday
// s=week-day sequence, 1=first,...,4=fourth,
// however, 5=first from the end,6=second from the end,...,8=fourth from the end
const SOLAR_WEEKDAYS = [
  '0110 黑人日',
  '0150 世界麻风日',
  '0530 全国助残日',
  '0932 国际和平日',
  '0940 国际聋人节',
  '0940 世界儿童日',
  '0950 世界海事日',
  '1011 国际住房日',
  '1013 国际减灾日'
]

// Lunar calendar based holidays, festivals, and memorial days
const LUNAR_DATES = [
  '0101*春节',
  '0115+元宵节',
  '0202 龙抬头节',
  '0323 妈祖生辰 (天上圣母诞辰)',
  '0505+端午节:[..,2007]',
  '0505*端午节:[2008,..]',
  '0707+七七中国情人节',
  '0815+中秋节:[..,2007]',
  '0815*中秋节:[2008,..]',
  '0909+重阳节',
  '1208+腊八节',
  '1224+小年',
  '1299+除夕' // 表示12月的最后一天
]

Calendar.annotateSolarDates = annotateSolarDates

Calendar.register((calendarMonth) => Calendar.annotateSolarDates(calendarMonth, SOLAR_MONTH_DATES, SOLAR_WEEKDAYS))
Calendar.register(annotateLunarDates)
Calendar.register(annotateConstellations)

})()
