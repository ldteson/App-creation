import { formatShort } from '../lib/format'
import { sportColor } from '../lib/zones'

function StatusDot({ record }) {
  if (!record) return null
  if (record.done) return <span className="text-emerald-400 text-sm" title="Hecho">✅</span>
  if (record.skipped) return <span className="text-amber-400 text-sm" title="Saltado">⏭️</span>
  return null
}

export default function DayCard({ day, record, isToday, onClick }) {
  const color = sportColor(day.sport)
  return (
    <button
      onClick={onClick}
      className={`group flex w-full flex-col gap-1 rounded-xl border p-3 text-left transition
        ${isToday ? 'border-emerald-400/60 bg-emerald-400/5' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wide text-slate-400">
          {day.day || formatShort(day.date).split(' ')[0]} · {formatShort(day.date)}
        </span>
        <StatusDot record={record} />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xl leading-none" style={{ filter: 'saturate(1.2)' }}>{day.icon}</span>
        <span className="text-sm font-medium text-slate-100">{day.title}</span>
      </div>
      {day.detail && (
        <p className="line-clamp-2 text-xs text-slate-400">{day.detail}</p>
      )}
      <div className="mt-1 flex items-center gap-1.5">
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
          style={{ background: `${color}22`, color }}
        >
          {day.sport}
        </span>
        {day.deload && (
          <span className="rounded-full bg-sky-400/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-300">
            Descarga
          </span>
        )}
        {day.peak && (
          <span className="rounded-full bg-rose-400/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-300">
            Pico
          </span>
        )}
      </div>
    </button>
  )
}
