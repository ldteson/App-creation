import { NavLink, Route, Routes } from 'react-router-dom'
import { plan, daysUntil } from './lib/plan'
import Today from './pages/Today'
import Week from './pages/Week'
import PlanView from './pages/PlanView'
import Progress from './pages/Progress'
import Weight from './pages/Weight'

const TABS = [
  { to: '/', label: 'Hoy', icon: '📅', end: true },
  { to: '/semana', label: 'Semana', icon: '🗓️' },
  { to: '/plan', label: 'Plan', icon: '🗺️' },
  { to: '/progreso', label: 'Progreso', icon: '📈' },
  { to: '/peso', label: 'Peso', icon: '⚖️' },
]

function CountdownPill() {
  const d = daysUntil(plan.race.date)
  const label = d > 0 ? `${d} días para ${plan.race.event}` : d === 0 ? `¡Hoy es ${plan.race.event}!` : `${plan.race.event} completada`
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
      {label}
    </span>
  )
}

export default function App() {
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col bg-[#0b0d12]">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b0d12]/90 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-slate-500">{plan.athlete.name} · {plan.meta.title.replace(/^Plan\s+\w+\s+—\s+/, '')}</p>
            <h1 className="text-base font-semibold text-slate-100">Seguimiento de entreno</h1>
          </div>
          <CountdownPill />
        </div>
      </header>

      <main className="flex-1 px-4 pb-24 pt-4">
        <Routes>
          <Route path="/" element={<Today />} />
          <Route path="/semana" element={<Week />} />
          <Route path="/plan" element={<PlanView />} />
          <Route path="/progreso" element={<Progress />} />
          <Route path="/peso" element={<Weight />} />
        </Routes>
      </main>

      <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-2xl -translate-x-1/2 border-t border-white/10 bg-[#0e1016]/95 backdrop-blur">
        <div className="grid grid-cols-5">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition ${
                  isActive ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                }`
              }
            >
              <span className="text-lg leading-none">{tab.icon}</span>
              {tab.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
