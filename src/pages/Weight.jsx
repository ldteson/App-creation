import { useMemo, useState } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { plan, todayISO } from '../lib/plan'
import { useWeightLog } from '../lib/storage'
import { formatShort } from '../lib/format'

const CHART_TEXT = { fill: '#94a3b8', fontSize: 11 }

function goalWeightAt(dateStr, startDate, raceDate, startW, targetW) {
  const t0 = new Date(startDate).getTime()
  const t1 = new Date(raceDate).getTime()
  const t = new Date(dateStr).getTime()
  const frac = Math.min(1, Math.max(0, (t - t0) / (t1 - t0)))
  return Math.round((startW + (targetW - startW) * frac) * 10) / 10
}

export default function Weight() {
  const { entries, addEntry, removeEntry } = useWeightLog()
  const today = todayISO()
  const [date, setDate] = useState(today)
  const [weight, setWeight] = useState('')

  const startDate = plan.meta.generated
  const raceDate = plan.race.date
  const startW = plan.athlete.weight_start_kg
  const targetW = plan.athlete.weight_target_kg

  const chartData = useMemo(() => {
    const dates = new Set([startDate, raceDate, ...entries.map((e) => e.date)])
    return Array.from(dates)
      .sort()
      .map((d) => ({
        date: d,
        label: formatShort(d),
        peso: entries.find((e) => e.date === d)?.weight_kg ?? null,
        objetivo: goalWeightAt(d, startDate, raceDate, startW, targetW),
      }))
  }, [entries, startDate, raceDate, startW, targetW])

  const latest = [...entries].sort((a, b) => b.date.localeCompare(a.date))[0]
  const goalToday = goalWeightAt(today, startDate, raceDate, startW, targetW)

  function handleSubmit(e) {
    e.preventDefault()
    const val = Number(weight)
    if (!date || !val) return
    addEntry(date, val)
    setWeight('')
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2.5">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Actual</p>
          <p className="mt-1 text-xl font-semibold text-slate-100">{latest ? `${latest.weight_kg} kg` : '—'}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Objetivo hoy</p>
          <p className="mt-1 text-xl font-semibold text-slate-100">{goalToday} kg</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Meta carrera</p>
          <p className="mt-1 text-xl font-semibold text-slate-100">{targetW} kg</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex items-end gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <label className="flex flex-1 flex-col gap-1 text-xs text-slate-400">
          Fecha
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-sm text-slate-100 outline-none focus:border-emerald-400/60"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-xs text-slate-400">
          Peso (kg)
          <input
            type="number"
            step="0.1"
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder={`${startW}`}
            className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-sm text-slate-100 outline-none focus:border-emerald-400/60"
          />
        </label>
        <button type="submit" className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400">
          Añadir
        </button>
      </form>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="mb-1 text-sm font-semibold text-slate-100">Peso vs objetivo</p>
        <p className="mb-3 text-xs text-slate-500">
          {startW} kg → {targetW} kg hacia el {formatShort(raceDate)}
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ left: -20, right: 10 }}>
            <CartesianGrid stroke="#232633" strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={CHART_TEXT} interval="preserveStartEnd" />
            <YAxis tick={CHART_TEXT} domain={['dataMin - 2', 'dataMax + 2']} />
            <Tooltip contentStyle={{ background: '#12141c', border: '1px solid #232633', borderRadius: 8, fontSize: 12 }} />
            <Line type="monotone" dataKey="objetivo" stroke="#6b7280" strokeDasharray="4 4" strokeWidth={1.5} dot={false} />
            <Line type="monotone" dataKey="peso" stroke="#34d399" strokeWidth={2} connectNulls={false} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {entries.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="mb-2 text-sm font-semibold text-slate-100">Historial</p>
          <div className="space-y-1.5">
            {[...entries].sort((a, b) => b.date.localeCompare(a.date)).map((e) => (
              <div key={e.date} className="flex items-center justify-between text-sm">
                <span className="text-slate-400">{formatShort(e.date)}</span>
                <span className="font-medium text-slate-100">{e.weight_kg} kg</span>
                <button onClick={() => removeEntry(e.date)} className="text-xs text-rose-400 hover:text-rose-300">
                  Borrar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
