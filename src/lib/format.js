const MONTHS = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
]

/** Parses "YYYY-MM-DD" as a local date (avoids UTC off-by-one). */
export function parseISODate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function formatShort(dateStr) {
  if (!dateStr) return ''
  const d = parseISODate(dateStr)
  const wd = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'][d.getDay()]
  return `${wd} ${d.getDate()} ${MONTHS[d.getMonth()]}`
}

export function formatLong(dateStr) {
  if (!dateStr) return ''
  const d = parseISODate(dateStr)
  const wd = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'][d.getDay()]
  return `${wd} ${d.getDate()} de ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

export function formatMonthYear(dateStr) {
  if (!dateStr) return ''
  const d = parseISODate(dateStr)
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}
