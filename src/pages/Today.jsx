import { useState } from 'react'
import { plan, findDayByDate, findClosestDay, todayISO } from '../lib/plan'
import { useRecords } from '../lib/storage'
import { formatLong } from '../lib/format'
import { sportColor } from '../lib/zones'
import SessionInfo from '../components/SessionInfo'
import SessionModal from '../components/SessionModal'

function ActualSummary({ record }) {
  if (!record?.actual) return null
  const a = record.actual
  const rows = Object.entries(a).filter(([k]) => k !== 'notes' && k !== 'adjust_note')
  if (rows.length === 0 && !a.notes) return null
  return (
    <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-300">Registrado</p>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-2">
            <dt className="text-slate-400">{fieldLabel(k)}</dt>
            <dd className="font-medium text-slate-100">{v}</dd>
          </div>
        ))}
      </dl>
      {a.notes && <p className="mt-2 text-sm italic text-slate-400">“{a.notes}”</p>}
    </div>
  )
}

function fieldLabel(key) {
  const map = {
    distance_km: 'Distancia', time: 'Tiempo', hr_avg: 'FC media', hr_max: 'FC máx',
    stamina_end: 'Body Battery', swim_m: 'Nado (m)', swim_time: 'T. nado',
    bike_km: 'Bici (km)', bike_time: 'T. bici', run_km: 'Run (km)', run_time: 'T. run',
  }
  return map[key] || key
}

export default function Today() {
  const today = todayISO()
  const exact = findDayByDate(today)
  const day = exact || findClosestDay(today)
  const { records, setRecord, removeRecord } = useRecords()
  const [modalOpen, setModalOpen] = useState(false)

  if (!day) {
    return <p className="text-slate-400">No hay datos de plan disponibles.</p>
  }

  const record = records[day.date]
  const color = sportColor(day.sport)

  return (
    <div className="space-y-4">
      {!exact && (
        <p className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-300">
          Hoy no tienes sesión programada. Mostrando la más cercana: {formatLong(day.date)}.
        </p>
      )}

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-xs uppercase tracking-wide text-slate-500">{formatLong(day.date)}</p>
          <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase" style={{ background: `${color}22`, color }}>
            {day.phaseName}
          </span>
        </div>
        <h2 className="flex items-center gap-2 text-2xl font-semibold text-slate-100">
          <span>{day.icon}</span>
          {day.title}
        </h2>
        <div className="mt-3">
          <SessionInfo day={day} hrZones={plan.hr_zones} />
        </div>

        {(day.deload || day.peak) && (
          <div className="mt-3 flex gap-2">
            {day.deload && <span className="rounded-full bg-sky-400/15 px-2.5 py-1 text-xs font-semibold text-sky-300">Semana de descarga</span>}
            {day.peak && <span className="rounded-full bg-rose-400/15 px-2.5 py-1 text-xs font-semibold text-rose-300">Sesión pico</span>}
          </div>
        )}

        <button
          onClick={() => setModalOpen(true)}
          className="mt-5 w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-emerald-950 hover:bg-emerald-400"
        >
          {record ? 'Editar registro' : 'Hecho / Saltado'}
        </button>

        <ActualSummary record={record} />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Zona clave del plan</p>
        <p className="text-sm text-slate-300">
          Los fondos (bici larga, run largo) van en <span className="font-semibold text-emerald-300">Z2</span> aunque el ritmo
          parezca lento — prioriza siempre la frecuencia cardíaca sobre el ritmo.
        </p>
      </div>

      {modalOpen && (
        <SessionModal
          day={day}
          hrZones={plan.hr_zones}
          record={record}
          onClose={() => setModalOpen(false)}
          onSave={setRecord}
          onDelete={removeRecord}
        />
      )}
    </div>
  )
}
