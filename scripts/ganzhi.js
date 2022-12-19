'use strict';

class Ganzhi {
  // 天干  甲  乙  丙  丁  戊  已  庚  辛  壬  癸
  // 序号  00  01  02  03  04  05  06  07  08  09  10  11
  // 地支  子  丑  寅  卯  辰  巳  午  未  申  酉  戌  亥
  static gan = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  static zhi = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  static animals = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];
  // 1900-01-01 00:00:00  己亥年丙子月甲戌日甲子时
  // baseGanzhi = [[05,11],[02,00],[00,10],[00,00]]
  static baseOffset = [35 /*year*/, 12 /*month*/, 10 /*day*/, 0 /*hour*/]
  //每日子时之天干 = Gan[dayOffset * 2 % 10]

  static fourPillarsOf(solarDay) {
    const year = solarDay.solarMonth.solarYear.year
    const month = solarDay.solarMonth.month
    const day = solarDay.day

    const beforeJieqi = Date.parse(`${year}-${padLeft(month,2)}-${padLeft(day,2)}T00:00:00+08:00`) < SOLAR_TERM_TIMES.get(year)[(month-1)*2]

    const offsets = [
      Ganzhi.baseOffset[0] + year - CONFIG.baseYear + ((month < 2 || (month == 2 && beforeJieqi)) ? 0 : 1),
      Ganzhi.baseOffset[1] + (year - CONFIG.baseYear) * 12 + month + (beforeJieqi ? -1 : 0),
      Ganzhi.baseOffset[2] + solarDay.solarMonth.firstDayOffset + day - 1
    ]
    offsets.push(Ganzhi.baseOffset[3] + offsets[2]*12) // 子时

    return offsets.map(Ganzhi._get).join('')
  }

  static year(year) {
    return Ganzhi._get(year-CONFIG.baseYear+36)
  }

  static animal(year) {
    return Ganzhi.animals[(year-4)%12]
  }

  static _get(offset) {
    if(offset < 0) offset += 600
    return Ganzhi.gan[offset%10] + Ganzhi.zhi[offset%12]
  }
}
