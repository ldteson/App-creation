import rawPlan from '../data/training-plan.json'

export const plan = rawPlan

function buildFlatDays(p) {
  const days = []

  if (p.meta?.kickoff) {
    const k = p.meta.kickoff
    days.push({
      date: k.date,
      day: null,
      sport: k.sport,
      title: k.title,
      detail: k.detail,
      zone: 'Z2-Z3',
      icon: '🏃',
      pace: k.target_pace,
      note: k.note,
      phaseId: 'kickoff',
      phaseName: 'Arranque',
      phase: 'KICKOFF',
      weekNumber: null,
      weekStartDate: null,
      deload: false,
      peak: false,
    })
  }

  for (const phase of p.phases) {
    for (const week of phase.weeks) {
      for (const d of week.days) {
        if (!d.date) continue
        days.push({
          ...d,
          phaseId: phase.id,
          phaseName: phase.name,
          phase: phase.phase,
          weekNumber: week.week,
          weekStartDate: week.start_date,
          deload: !!week.deload,
          peak: !!week.peak,
        })
      }
    }
  }

  days.sort((a, b) => a.date.localeCompare(b.date))
  return days
}

export const flatDays = buildFlatDays(rawPlan)

export function findDayByDate(dateStr) {
  return flatDays.find((d) => d.date === dateStr) || null
}

/** Exact match if it exists, otherwise the closest upcoming session (or the last one if the plan has ended). */
export function findClosestDay(dateStr) {
  const exact = findDayByDate(dateStr)
  if (exact) return exact
  const upcoming = flatDays.find((d) => d.date > dateStr)
  if (upcoming) return upcoming
  return flatDays[flatDays.length - 1]
}

export function getWeekDays(weekStartDate) {
  return flatDays.filter((d) => d.weekStartDate === weekStartDate)
}

export function listWeekStarts() {
  const set = new Set()
  flatDays.forEach((d) => {
    if (d.weekStartDate) set.add(d.weekStartDate)
  })
  return Array.from(set).sort()
}

/** The week that contains dateStr, or the closest week before/after it if outside the plan range. */
export function findWeekStartForDate(dateStr) {
  const starts = listWeekStarts()
  if (starts.length === 0) return null
  let best = starts[0]
  for (const s of starts) {
    if (s <= dateStr) best = s
    else break
  }
  return best
}

export function todayISO() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function daysUntil(dateStr) {
  const now = new Date(todayISO())
  const target = new Date(dateStr)
  return Math.round((target - now) / 86400000)
}
