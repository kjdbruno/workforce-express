const moment = require('moment')

const PH_OFFSET = 8 * 60 // UTC+8 in minutes

// =====================
// NOW / BASIC FORMATS
// =====================

// PH Now as JS Date object
function phNow() {
  return moment().utcOffset(PH_OFFSET).toDate()
}

// PH Now: YYYY-MM-DD HH:mm:ss
function phNowDateTime() {
  return moment().utcOffset(PH_OFFSET).format('YYYY-MM-DD HH:mm:ss')
}

// PH Today date only: YYYY-MM-DD
function phDate() {
  return moment().utcOffset(PH_OFFSET).format('YYYY-MM-DD')
}

// PH Current time only: HH:mm:ss
function phTime() {
  return moment().utcOffset(PH_OFFSET).format('HH:mm:ss')
}

// Format any date/time as PH
function phFormat(date, format = 'YYYY-MM-DD HH:mm:ss') {
  return moment(date).utcOffset(PH_OFFSET).format(format)
}

// =====================
// DAY RANGE (PH)
// =====================
// Use endExclusive for safest querying: >= start and < endExclusive
function phDayRange(date = new Date()) {
  const base = moment(date).utcOffset(PH_OFFSET)

  const start = base.clone().startOf('day').format('YYYY-MM-DD HH:mm:ss')
  const end = base.clone().endOf('day').format('YYYY-MM-DD HH:mm:ss')
  const endExclusive = base.clone().add(1, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss')

  return { start, end, endExclusive }
}

// =====================
// MONTH RANGE (PH)
// =====================
// month = 1..12 (e.g., month=2, year=2026 => Feb 2026)
// Auto handles leap years and correct days per month
function phMonthRange(year, month) {
  const base = moment({ year, month: month - 1 }).utcOffset(PH_OFFSET)

  const start = base.clone().startOf('month').format('YYYY-MM-DD HH:mm:ss')
  const end = base.clone().endOf('month').format('YYYY-MM-DD HH:mm:ss')
  const endExclusive = base.clone().add(1, 'month').startOf('month').format('YYYY-MM-DD HH:mm:ss')

  return { start, end, endExclusive }
}

module.exports = {
  PH_OFFSET,
    phNow,
    phNowDateTime,
    phDate,
    phTime,
    phFormat,
    phDayRange,
    phMonthRange
}
