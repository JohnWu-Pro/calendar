'use strict';

class Constellation {

  static constellations = ['摩羯','水瓶','双鱼','白羊','金牛','双子','巨蟹','狮子','处女','天秤','天蝎','射手'];
  static quadrants = ['土象','风象','水象','火象'];

  static of(index) { // index: 1 for Jan 01, and 2 for Jan 31; 5 for May 01, and 6 for May 31
    index--;
    return Constellation.quadrants[index % 4] + ' ' + Constellation.constellations[index % 12] + '座'
  }

  static switchDay(solarMonth) {
    const year = solarMonth.solarYear.year
    const month = solarMonth.month

    const coord = (month-1)*2 + 1
    const date = new Date(SOLAR_TERM_TIMES.get(year)[coord] + CONFIG.baseTimezoneOffset*60000)

    return date.getUTCDate()
  }

}
