import { useState } from 'react'
import { plan, todayISO } from '../lib/plan'
import { formatShort, formatMonthYear } from '../lib/format'
import { phaseColor, sportColor } from '../lib/zones'

function WeekRow({ week, expanded, onToggle }) {
  const firstDay = week.days.find((d) => d.date)
  const lastDay = [...week.days].reverse().find((d) => d.date)
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02]">
      <button onClick={onToggle} className="flex w-full items-center justify-between px-3 py-2 text-left">
        <span className="text-sm text-slate-200">
          Semana {week.week} · {firstDay ? formatShort(firstDay.date) : ''} – {lastDay ? formatShort(lastDay.date) : ''}
        </span>
        <div className="flex items-center gap-1.5">
          {week.deload && <span className="rounded-full bg-sky-400/15 px-2 py-0.5 text-[10px] font-semibold text-sky-300">Descarga</span>}
          {week.peak && <span className="rounded-full bg-rose-400/15 px-2 py-0.5 text-[10px] font-semibold text-rose-300">Pico</span>}
          <span className="text-slate-500">{expanded ? '−' : '+'}</span>
        </div>
      </button>
      {expanded && (
        <div className="space-y-1.5 border-t border-white/10 px-3 py-2">
          {week.days.map((d, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="w-9 shrink-0 text-slate-500">{d.day}</span>
              <span>{d.icon}</span>
              <span className="flex-1 text-slate-300">{d.title}</span>
              <span
                className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase"
                style={{ background: `${sportColor(d.sport)}22`, color: sportColor(d.sport) }}
              >
                {d.sport}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function PhaseBlock({ phase, isCurrent }) {
  const [open, setOpen] = useState(isCurrent)
  const [expandedWeek, setExpandedWeek] = useState(null)
  const firstDay = phase.weeks[0]?.days.find((d) => d.date)
  const lastWeek = phase.weeks[phase.weeks.length - 1]
  const lastDay = [...(lastWeek?.days || [])].reverse().find((d) => d.date)
  const color = phaseColor(phase.phase)

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03]">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: color }} />
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-100">{phase.name}</p>
          <p className="text-xs text-slate-500">
            {firstDay ? formatShort(firstDay.date) : ''} – {lastDay ? formatShort(lastDay.date) : ''} · {phase.weeks.length} semanas
          </p>
        </div>
        {isCurrent && <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">Actual</span>}
        <span className="text-slate-500">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="space-y-2 border-t border-white/10 px-3 py-3">
          {phase.notes && <p className="text-xs italic text-slate-400">{phase.notes}</p>}
          {phase.weeks.map((w, i) => (
            <WeekRow
              key={i}
              week={w}
              expanded={expandedWeek === i}
              onToggle={() => setExpandedWeek(expandedWeek === i ? null : i)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function PlanView() {
  const today = todayISO()

  function phaseContainsToday(phase) {
    return phase.weeks.some((w) => w.days.some((d) => d.date === today))
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">{plan.meta.title}</p>
        <p className="mt-1 text-sm text-slate-300">{plan.meta.phases_overview}</p>
        <p className="mt-1 text-xs text-slate-500">{plan.meta.weekly_structure}</p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
        <p className="text-sm font-medium text-slate-200">🏃 {plan.meta.kickoff.title}</p>
        <p className="text-xs text-slate-500">{formatShort(plan.meta.kickoff.date)} · {plan.meta.kickoff.detail}</p>
      </div>

      {plan.meta.home_base && (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
          <p className="text-sm font-medium text-slate-200">🗺️ {plan.meta.home_base}</p>
          {plan.meta.bike_routes_note && <p className="mt-1 text-xs text-slate-500">{plan.meta.bike_routes_note}</p>}
        </div>
      )}

      <div className="space-y-2.5">
        {plan.phases.map((phase) => (
          <PhaseBlock key={phase.id} phase={phase} isCurrent={phaseContainsToday(phase)} />
        ))}
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Hitos previos</p>
        <div className="space-y-2">
          {plan.race.stepping_stones.map((s, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div>
                <p className="text-slate-200">{s.event}</p>
                {s.detail && <p className="text-xs text-slate-500">{s.detail}</p>}
              </div>
              <span className="text-xs text-slate-500">{formatMonthYear(s.date + '-01')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
