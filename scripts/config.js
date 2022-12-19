'use strict';

const CONFIG = {
  baseYear: 1900,
  baseWeekday: 1, // 1900-01-01 weekday, 0: Sunday, 1: Monday, ...
  baseTimezoneOffset: 480, // UTC+0800, in minutes
  currentTimezoneOffset: - new Date(new Date().setUTCMonth(0,1)).getTimezoneOffset(), // in minutes
  lastYear: 2099,

  definedQualifiers: ['en-CA.UTC-0500'],

  alertUnresolvable: '所选年月超出本日历的排历范围!'
}
