import { useMemo } from 'react'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Cell, ReferenceArea,
} from 'recharts'
import { plan, flatDays, todayISO } from '../lib/plan'
import { useRecords } from '../lib/storage'
import { classifyHr, parseZoneRange, sportColor, sportLabel } from '../lib/zones'
import { formatShort } from '../lib/format'

const CHART_TEXT = { fill: '#94a3b8', fontSize: 11 }

function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-100">{value}</p>
      {sub && <p className="text-[11px] text-slate-500">{sub}</p>}
    </div>
  )
}

export default function Progress() {
  const { records } = useRecords()
  const today = todayISO()
  const dayByDate = useMemo(() => Object.fromEntries(flatDays.map((d) => [d.date, d])), [])

  const loggedDates = useMemo(
    () => Object.keys(records).filter((d) => d <= today).sort(),
    [records, today],
  )

  const hrSeries = useMemo(() => {
    return loggedDates
      .map((date) => {
        const hr = records[date]?.actual?.hr_avg
        if (hr == null) return null
        return { date, label: formatShort(date), hr_avg: hr }
      })
      .filter(Boolean)
  }, [loggedDates, records])

  const z2 = parseZoneRange(plan.hr_zones.find((z) => z.zone === 'Z2')?.bpm)

  const kmBySport = useMemo(() => {
    const totals = { bike: 0, run: 0 }
    for (const date of loggedDates) {
      const rec = records[date]
      if (!rec?.done) continue
      const day = dayByDate[date]
      if (!day) continue
      const a = rec.actual || {}
      if (day.sport === 'bike') totals.bike += Number(a.distance_km ?? day.distance_km ?? 0)
      if (day.sport === 'run') totals.run += Number(a.distance_km ?? day.distance_km ?? 0)
      if (day.sport === 'brick' || day.sport === 'triathlon') {
        totals.bike += Number(a.bike_km ?? day.bike_km ?? 0)
        totals.run += Number(a.run_km ?? day.run_km ?? 0)
      }
    }
    return [
      { sport: 'bike', label: 'Bici', km: Math.round(totals.bike) },
      { sport: 'run', label: 'Running', km: Math.round(totals.run) },
    ]
  }, [loggedDates, records, dayByDate])

  const sessionsBySport = useMemo(() => {
    const counts = {}
    for (const date of loggedDates) {
      const rec = records[date]
      const day = dayByDate[date]
      if (!rec?.done || !day) continue
      counts[day.sport] = (counts[day.sport] || 0) + 1
    }
    return Object.entries(counts).map(([sport, count]) => ({ sport, label: sportLabel(sport), count }))
  }, [loggedDates, records, dayByDate])

  const weeklyAdherence = useMemo(() => {
    const byWeek = new Map()
    for (const day of flatDays) {
      if (!day.weekStartDate || day.date > today) continue
      if (!byWeek.has(day.weekStartDate)) byWeek.set(day.weekStartDate, { total: 0, done: 0 })
      const w = byWeek.get(day.weekStartDate)
      if (day.sport === 'rest') continue
      w.total += 1
      if (records[day.date]?.done) w.done += 1
    }
    return Array.from(byWeek.entries())
      .map(([week, v]) => ({ week, pct: v.total ? Math.round((v.done / v.total) * 100) : 0, done: v.done, total: v.total }))
      .filter((w) => w.total > 0)
      .slice(-8)
  }, [records, today])

  const totalDone = Object.entries(records).filter(([date, r]) => r.done && date <= today).length
  const totalPlanned = flatDays.filter((d) => d.date <= today && d.sport !== 'rest').length
  const overallAdherence = totalPlanned ? Math.round((totalDone / totalPlanned) * 100) : 0

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-2.5">
        <StatCard label="Adherencia" value={`${overallAdherence}%`} sub={`${totalDone}/${totalPlanned} sesiones`} />
        <StatCard label="Km bici" value={kmBySport.find((s) => s.sport === 'bike')?.km ?? 0} />
        <StatCard label="Km run" value={kmBySport.find((s) => s.sport === 'run')?.km ?? 0} />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="mb-1 text-sm font-semibold text-slate-100">FC media por sesión</p>
        <p className="mb-3 text-xs text-slate-500">Debería ir bajando con el tiempo a igualdad de esfuerzo. Banda verde = Z2.</p>
        {hrSeries.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">Aún no hay FC registrada.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={hrSeries} margin={{ left: -20, right: 10 }}>
              <CartesianGrid stroke="#232633" strokeDasharray="3 3" />
              {z2 && <ReferenceArea y1={z2.min} y2={z2.max} fill="#34d399" fillOpacity={0.08} />}
              <XAxis dataKey="label" tick={CHART_TEXT} interval="preserveStartEnd" />
              <YAxis tick={CHART_TEXT} domain={['dataMin - 5', 'dataMax + 5']} />
              <Tooltip
                contentStyle={{ background: '#12141c', border: '1px solid #232633', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#e7e9ee' }}
              />
              <Line
                type="monotone"
                dataKey="hr_avg"
                stroke="#34d399"
                strokeWidth={2}
                dot={(props) => {
                  const zone = classifyHr(props.payload.hr_avg, plan.hr_zones)
                  return <circle key={props.payload.date} cx={props.cx} cy={props.cy} r={3.5} fill={zone ? '#34d399' : '#f87171'} />
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="mb-3 text-sm font-semibold text-slate-100">Km acumulados por deporte</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={kmBySport} layout="vertical" margin={{ left: -10 }}>
            <CartesianGrid stroke="#232633" strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tick={CHART_TEXT} />
            <YAxis type="category" dataKey="label" tick={CHART_TEXT} width={60} />
            <Tooltip contentStyle={{ background: '#12141c', border: '1px solid #232633', borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="km" radius={[0, 6, 6, 0]}>
              {kmBySport.map((d) => (
                <Cell key={d.sport} fill={sportColor(d.sport)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="mb-3 text-sm font-semibold text-slate-100">Sesiones completadas por deporte</p>
        {sessionsBySport.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-500">Sin sesiones registradas todavía.</p>
        ) : (
          <div className="space-y-2">
            {sessionsBySport.map((s) => (
              <div key={s.sport} className="flex items-center gap-2">
                <span className="w-20 shrink-0 text-xs text-slate-400">{s.label}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${Math.min(100, s.count * 10)}%`, background: sportColor(s.sport) }}
                  />
                </div>
                <span className="w-6 text-right text-xs text-slate-300">{s.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="mb-3 text-sm font-semibold text-slate-100">Adherencia semanal (últimas 8 semanas)</p>
        {weeklyAdherence.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-500">Aún no hay semanas completadas.</p>
        ) : (
          <div className="space-y-2">
            {weeklyAdherence.map((w) => (
              <div key={w.week} className="flex items-center gap-2">
                <span className="w-20 shrink-0 text-xs text-slate-400">{formatShort(w.week)}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-emerald-400"
                    style={{ width: `${w.pct}%` }}
                  />
                </div>
                <span className="w-10 text-right text-xs text-slate-300">{w.pct}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
