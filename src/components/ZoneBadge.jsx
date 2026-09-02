import { targetHrRange, zoneColor } from '../lib/zones'

export default function ZoneBadge({ zone, hrZones, pace, size = 'md' }) {
  const range = targetHrRange(zone, hrZones)
  const pad = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'

  if (!range && (!zone || zone === '—')) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {range?.codes.map((code) => (
        <span
          key={code}
          className={`rounded-full font-semibold ${pad}`}
          style={{ background: `${zoneColor(code)}22`, color: zoneColor(code) }}
        >
          {code}
        </span>
      ))}
      {range && (
        <span className={`rounded-full bg-white/5 text-slate-300 font-mono ${pad}`}>
          {range.min}-{range.max} ppm
        </span>
      )}
      {pace && (
        <span className={`rounded-full bg-white/5 text-slate-300 font-mono ${pad}`}>
          {pace}/km
        </span>
      )}
    </div>
  )
}
