import ZoneBadge from './ZoneBadge'

export default function SessionInfo({ day, hrZones }) {
  const hasStructure = Array.isArray(day.structure) && day.structure.length > 0
  const hasCues = Array.isArray(day.cues) && day.cues.length > 0

  return (
    <div className="space-y-3">
      {day.detail && <p className="text-sm text-slate-300">{day.detail}</p>}
      <ZoneBadge zone={day.zone} hrZones={hrZones} pace={day.pace} />
      {day.note && <p className="rounded-lg bg-white/5 p-2.5 text-xs text-slate-400">{day.note}</p>}

      {day.route && (
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            🗺️ Ruta
          </p>
          <p className="text-sm text-slate-300">{day.route}</p>
        </div>
      )}

      {hasStructure && (
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Estructura</p>
          <ol className="space-y-1">
            {day.structure.map((step, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-300">
                <span className="mt-0.5 shrink-0 text-xs font-semibold text-emerald-400">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {hasCues && (
        <div className="rounded-lg border border-emerald-400/15 bg-emerald-400/5 p-3">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-300">💡 Consejos</p>
          <ul className="space-y-1">
            {day.cues.map((cue, i) => (
              <li key={i} className="flex gap-1.5 text-sm text-slate-300">
                <span className="text-emerald-400">·</span>
                <span>{cue}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
