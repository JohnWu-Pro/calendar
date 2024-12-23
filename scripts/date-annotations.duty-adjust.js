'use strict';

(function() {

const ADJUSTMENTS = new Map([
  [2019, [
    '-0101',
    '+0202','+0203','-0204','-0205','-0206','-0207','-0208',
    '-0405',
    '+0428','-0501','-0502','-0503','+0505',
    '-0607',
    '-0913',
    '+0929','-0930','-1001','-1002','-1003','-1004','+1012'
  ]],
  [2020, [
    '-0101',
    '-0124','-0127','-0128','-0129','-0130','+0201','+0202',
    '-0403',
    '-0501',
    '-0625','-0626','+0628',
    '-1001','-1002','-1005','-1006','-1007','-1008','+1010','+1011'
  ]],
  [2021, [
    '-0101',
    '+0207','-0211','-0212','-0215','-0216','-0217','+0220',
    '-0405',
    '+0425','-0503','-0504','-0505','+0508',
    '-0614',
    '+0918','-0920','-0921',
    '+0926','-1001','-1004','-1005','-1006','-1007','+1009'
  ]],
  [2022, [
    '-0103',
    '+0129','+0130','-0131','-0201','-0202','-0203','-0204',
    '+0402','-0404','-0405',
    '+0424','-0502','-0503','-0504','+0507',
    '-0603',
    '-0912',
    '-1003','-1004','-1005','-1006','-1007','+1008','+1009'
  ]],
  [2023, [
    '-0102',
    '-0123','-0124','-0125','-0126','-0127','+0128','+0129',
    '-0405',
    '+0423','-0501','-0502','-0503','+0506',
    '-0622','-0623','+0625',
    '-0929',
    '-1002','-1003','-1004','-1005','-1006','+1007','+1008'
  ]],
  [2024, [
    '-0101',
    '+0204','-0212','-0213','-0214','-0215','-0216','+0218',
    '-0404','-0405','+0407',
    '+0428','-0501','-0502','-0503','+0511',
    '-0610',
    '+0914','-0916','-0917',
    '+0929','-1001','-1002','-1003','-1004','-1007','+1012'
  ]],
  [2025, [
    '-0101',
    '+0126','-0128','-0129','-0130','-0131','-0203','-0204','+0208',
    '-0404',
    '+0427','-0501','-0502','-0505',
    '-0602',
    '+0928','-1001','-1002','-1003','-1006','-1007','-1008','+1011'
  ]],
])

function annotateAdjustments(calendarMonth) {
  const year = calendarMonth.solarMonth.solarYear.year

  const year_month = (year, month) => year + '-' + month
  const keyOf = (solarMonth) => year_month(solarMonth.solarYear.year, solarMonth.month)

  const monthToDays = new Map()
  if(calendarMonth.prevMonthDays.length > 0) {
    monthToDays.set(keyOf(calendarMonth.solarMonth.prev()), calendarMonth.prevMonthDays)
  }
  monthToDays.set(keyOf(calendarMonth.solarMonth), calendarMonth.currMonthDays)
  if(calendarMonth.nextMonthDays.length > 0) {
    monthToDays.set(keyOf(calendarMonth.solarMonth.next()), calendarMonth.nextMonthDays)
  }

  for(const info of (ADJUSTMENTS.get(year) || [])) {
    const matches = info.match(/^([\-\+])(\d{2})(\d{2})$/)
    if(matches) {
      const days = monthToDays.get(year_month(year, parseInt(matches[2],10)))
      if(days) {
        const index = parseInt(matches[3],10) - days[0].solarDay.day
        if(0 <= index && index < days.length) {
          days[index].annotate(Annotation.dutyAdjust(matches[1]))
        }
      }
    }
  }
}

Calendar.register(annotateAdjustments)

})()
