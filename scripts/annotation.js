'use strict';

class Annotation {
  type
  value // name or description
  isSolarBased // true or false, if it's solar calendar based annotation

  constructor(type, value, isSolarBased = true) {
    this.type = type
    this.value = value
    this.isSolarBased = isSolarBased
  }

  static TYPE_DUTY_ADJUST = 10 // duty on/off adjustment
  static dutyAdjust(value, isSolarBased = true) {
    return new Annotation(Annotation.TYPE_DUTY_ADJUST, value, isSolarBased)
  }

  static TYPE_HOLIDAY = 20 // statutory holiday
  static holiday(value, isSolarBased = true) {
    return new Annotation(Annotation.TYPE_HOLIDAY, value, isSolarBased)
  }

  static TYPE_FESTIVAL = 30 // festival and non-statutory holiday
  static festival(value, isSolarBased = true) {
    return new Annotation(Annotation.TYPE_FESTIVAL, value, isSolarBased)
  }

  static TYPE_SOLAR_TERM = 40 // solar term
  static solarTerm(value, time) {
    const annotation = new Annotation(Annotation.TYPE_SOLAR_TERM, value)
    annotation.time = time
    return annotation
  }

  static TYPE_LUNAR_MONTH_FIRST_DAY = 50 // lunar month 1st day
  static lunarMonthFirstDay(value) {
    return new Annotation(Annotation.TYPE_LUNAR_MONTH_FIRST_DAY, value)
  }

  static TYPE_MEMO = 60// memorial day
  static memo(value, isSolarBased = true) {
    return new Annotation(Annotation.TYPE_MEMO, value, isSolarBased)
  }

  static sort(annotations) {
    annotations.sort((a1, a2) => {
      if(a1.type != a2.type) return a1.type - a2.type
      if(a1.isSolarBased != a2.isSolarBased) return a1.isSolarBased ? -1 : 1
      if(a1.value != a2.value) return a1.value < a2.value ? -1 : 1
      return 0
    })
  }
}
