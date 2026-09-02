export function parseZoneRange(bpm) {
  if (!bpm) return null
  const m = String(bpm).match(/(\d+)\D+(\d+)/)
  if (!m) return null
  return { min: Number(m[1]), max: Number(m[2]) }
}

const ZONE_COLORS = {
  Z1: '#60a5fa',
  Z2: '#34d399',
  Z3: '#fbbf24',
  Z4: '#fb923c',
  Z5: '#f87171',
}

export function zoneColor(zoneCode) {
  return ZONE_COLORS[zoneCode] || '#9ca3af'
}

export function zoneCodes(zoneStr) {
  if (!zoneStr) return []
  return zoneStr.match(/Z\d/g) || []
}

/** Combined bpm target range for a session's zone string (e.g. "Z2-Z3"), using hr_zones as the source of truth. */
export function targetHrRange(zoneStr, hrZones) {
  const codes = zoneCodes(zoneStr)
  if (codes.length === 0) return null
  const matched = codes
    .map((c) => hrZones.find((z) => z.zone === c))
    .filter(Boolean)
    .map((z) => parseZoneRange(z.bpm))
    .filter(Boolean)
  if (matched.length === 0) return null
  return {
    min: Math.min(...matched.map((r) => r.min)),
    max: Math.max(...matched.map((r) => r.max)),
    codes,
  }
}

export function classifyHr(hrValue, hrZones) {
  if (hrValue == null || Number.isNaN(hrValue)) return null
  for (const z of hrZones) {
    const r = parseZoneRange(z.bpm)
    if (r && hrValue >= r.min && hrValue <= r.max) return z
  }
  return null
}

const SPORT_COLORS = {
  swim: '#38bdf8',
  bike: '#a78bfa',
  run: '#4ade80',
  gym: '#f87171',
  mobility: '#facc15',
  brick: '#fb923c',
  triathlon: '#f472b6',
  rest: '#6b7280',
  race: '#ef4444',
}

export function sportColor(sport) {
  return SPORT_COLORS[sport] || '#9ca3af'
}

const SPORT_LABELS = {
  swim: 'Natación',
  bike: 'Bici',
  run: 'Running',
  gym: 'Gym',
  mobility: 'Movilidad',
  brick: 'Brick',
  triathlon: 'Triatlón',
  rest: 'Descanso',
  race: 'Carrera',
}

export function sportLabel(sport) {
  return SPORT_LABELS[sport] || sport
}

const PHASE_COLORS = {
  KICKOFF: '#94a3b8',
  BASE: '#38bdf8',
  BUILD: '#a78bfa',
  SPECIFIC: '#fb923c',
  PEAK: '#f87171',
  TAPER: '#4ade80',
}

export function phaseColor(phase) {
  return PHASE_COLORS[phase] || '#9ca3af'
}
