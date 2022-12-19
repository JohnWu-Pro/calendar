'use strict';

(function() {

// * indicates statutory/public holiday
// + indicates festival
// <whitespace> indicates memorial day

// Solar calendar month-date based holidays, festivals, and memorial days
// Expected the dates to be in natural order
const SOLAR_MONTH_DATES = [
  '0701*Canada Day',
  '1031 Halloween',
  '1111*Remembrance Day',
  '1225*Christmas',
  '1226*Boxing Day'
]

// Solar calendar weekday based holidays, festivals, and memorial days
// MMsw: MM=month, w=weekday
// s=week-day sequence, 1=first,...,4=fourth,
// however, 5=first from the end,6=second from the end,...,8=fourth from the end
const SOLAR_WEEKDAYS = [
  '0231*Family Day:[2008,..]',
  '0520 Mother\'s Day',
  '0630 Father\'s Day',
  '0811*Civic Day',
  '0911*Labor Day',
  '1021*Thanksgiving Day'
]

// https://en.wikipedia.org/wiki/Easter
// Easter always falls on a Sunday between 22 March and 25 April,
// within about seven days after the astronomical full moon.
function getEasterSunday(y) {
  const _ = v => Math.floor(v)

  let c = _( y / 100 ), n = _( y % 19 )
  let k = _( ( c - 17 ) / 25 )
  let i = c - _( c / 4 ) - _( ( c - k ) / 3 ) + 19 * n + 15; i = i % 30
      i = i - _( i / 28 ) * ( 1 - _( i / 28 ) * _( 29 / ( i + 1 ) ) * _( ( 21 - n ) / 11 ) )
  let j = y + _( y / 4 ) + i + 2 - c + _( c / 4 ); j = j % 7
  let l = i - j
  let m = 3 + _( ( l + 40 ) / 44 )
  let d = l + 28 - 31 * _( m / 4 )

  return new Date(Date.UTC(y,m-1,d))
}

// Monday preceding May 25, exclusive
function getVictoriaDay(year) {
  const date = new Date(Date.UTC(year,5-1,24))
  let weekday = date.getUTCDay()
  if(weekday==0) weekday = 7
  date.setUTCDate(25 - weekday)
  return date
}

function annotateVariableHolidays(calendarMonth) {
  const dates = []

  const year = calendarMonth.solarMonth.solarYear.year
  const month = calendarMonth.solarMonth.month

  if([3,4,5].includes(month)) {
    const easterSunday = getEasterSunday(year)
    const easterMonday = new Date(easterSunday.getTime() + 24 * 3600 * 1000)
    const goodFriday = new Date(easterSunday.getTime() - 48 * 3600 * 1000)
    dates.push(
      `${MMdd(goodFriday)}*Good Friday`,
      `${MMdd(easterSunday)} Easter Sunday`,
      `${MMdd(easterMonday)}*Easter Monday`
    )
  }

  if(month == 5) {
    dates.push(`${MMdd(getVictoriaDay(year))}*Victoria Day`)
  }

  if(dates.length > 0) Calendar.annotateSolarDates(calendarMonth, dates, [], true)
}

function MMdd(utcDate) {
  const m = utcDate.getUTCMonth()+1
  const d = utcDate.getUTCDate()
  return padLeft(m, 2) + padLeft(d, 2)
}

Calendar.register((calendarMonth) => Calendar.annotateSolarDates(calendarMonth, SOLAR_MONTH_DATES, SOLAR_WEEKDAYS, true))
Calendar.register(annotateVariableHolidays)

})()
