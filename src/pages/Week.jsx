import { useMemo, useState } from 'react'
import { plan, getWeekDays, listWeekStarts, findWeekStartForDate, todayISO } from '../lib/plan'
import { useRecords } from '../lib/storage'
import { formatShort } from '../lib/format'
import DayCard from '../components/DayCard'
import SessionModal from '../components/SessionModal'

export default function Week() {
  const today = todayISO()
  const weekStarts = useMemo(() => listWeekStarts(), [])
  const [weekStart, setWeekStart] = useState(() => findWeekStartForDate(today))
  const { records, setRecord, removeRecord } = useRecords()
  const [selectedDay, setSelectedDay] = useState(null)

  const idx = weekStarts.indexOf(weekStart)
  const days = getWeekDays(weekStart)
  const meta = days[0]
  const doneCount = days.filter((d) => records[d.date]?.done).length

  function go(delta) {
    const next = weekStarts[idx + delta]
    if (next) setWeekStart(next)
  }

  if (!meta) return <p className="text-slate-400">Sin datos para esta semana.</p>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => go(-1)}
          disabled={idx <= 0}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-300 disabled:opacity-30"
        >
          ◀
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-100">
            {meta.phaseName} · Semana {meta.weekNumber}
          </p>
          <p className="text-xs text-slate-500">
            {formatShort(days[0].date)} – {formatShort(days[days.length - 1].date)}
          </p>
        </div>
        <button
          onClick={() => go(1)}
          disabled={idx === weekStarts.length - 1 || idx === -1}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-300 disabled:opacity-30"
        >
          ▶
        </button>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
        <div className="flex gap-2">
          {meta.deload && <span className="rounded-full bg-sky-400/15 px-2.5 py-1 text-xs font-semibold text-sky-300">Descarga</span>}
          {meta.peak && <span className="rounded-full bg-rose-400/15 px-2.5 py-1 text-xs font-semibold text-rose-300">Semana pico</span>}
          {!meta.deload && !meta.peak && <span className="text-xs text-slate-500">Semana estándar</span>}
        </div>
        <span className="text-xs text-slate-400">{doneCount}/{days.length} completadas</span>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {days.map((d) => (
          <DayCard
            key={d.date}
            day={d}
            record={records[d.date]}
            isToday={d.date === today}
            onClick={() => setSelectedDay(d)}
          />
        ))}
      </div>

      {selectedDay && (
        <SessionModal
          day={selectedDay}
          hrZones={plan.hr_zones}
          record={records[selectedDay.date]}
          onClose={() => setSelectedDay(null)}
          onSave={setRecord}
          onDelete={removeRecord}
        />
      )}
    </div>
  )
}
