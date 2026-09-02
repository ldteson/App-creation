import { useState } from 'react'
import { formatLong } from '../lib/format'
import ZoneBadge from './ZoneBadge'

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-slate-400">
      {label}
      {children}
    </label>
  )
}

const inputClass =
  'rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-sm text-slate-100 outline-none focus:border-emerald-400/60'

function NumberInput({ value, onChange, placeholder }) {
  return (
    <input
      type="number"
      inputMode="decimal"
      className={inputClass}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

function TextInput({ value, onChange, placeholder }) {
  return (
    <input
      type="text"
      className={inputClass}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

function sportFields(sport) {
  switch (sport) {
    case 'swim':
      return [
        { key: 'swim_m', label: 'Distancia (m)', type: 'number', placeholder: '1500' },
        { key: 'time', label: 'Tiempo (h:mm:ss)', type: 'text', placeholder: '35:20' },
      ]
    case 'bike':
      return [
        { key: 'distance_km', label: 'Distancia (km)', type: 'number', placeholder: '50' },
        { key: 'time', label: 'Tiempo (h:mm:ss)', type: 'text', placeholder: '1:20:26' },
      ]
    case 'run':
      return [
        { key: 'distance_km', label: 'Distancia (km)', type: 'number', placeholder: '10' },
        { key: 'time', label: 'Tiempo (h:mm:ss)', type: 'text', placeholder: '48:26' },
      ]
    case 'gym':
    case 'mobility':
      return [{ key: 'time', label: 'Duración (mm:ss)', type: 'text', placeholder: '30:00' }]
    case 'brick':
      return [
        { key: 'bike_km', label: 'Bici — distancia (km)', type: 'number', placeholder: '75' },
        { key: 'bike_time', label: 'Bici — tiempo', type: 'text', placeholder: '2:20:00' },
        { key: 'run_km', label: 'Run — distancia (km)', type: 'number', placeholder: '12' },
        { key: 'run_time', label: 'Run — tiempo', type: 'text', placeholder: '1:15:00' },
      ]
    case 'triathlon':
      return [
        { key: 'swim_m', label: 'Nado — distancia (m)', type: 'number', placeholder: '1500' },
        { key: 'swim_time', label: 'Nado — tiempo', type: 'text', placeholder: '32:00' },
        { key: 'bike_km', label: 'Bici — distancia (km)', type: 'number', placeholder: '40' },
        { key: 'bike_time', label: 'Bici — tiempo', type: 'text', placeholder: '1:15:00' },
        { key: 'run_km', label: 'Run — distancia (km)', type: 'number', placeholder: '10' },
        { key: 'run_time', label: 'Run — tiempo', type: 'text', placeholder: '55:00' },
      ]
    case 'race':
      return [
        { key: 'swim_time', label: 'Nado — tiempo', type: 'text', placeholder: '45:00' },
        { key: 'bike_time', label: 'Bici — tiempo', type: 'text', placeholder: '2:45:00' },
        { key: 'run_time', label: 'Run — tiempo', type: 'text', placeholder: '2:05:00' },
        { key: 'time', label: 'Tiempo total', type: 'text', placeholder: '5:45:00' },
      ]
    default:
      return []
  }
}

function cleanActual(raw) {
  const out = {}
  for (const [k, v] of Object.entries(raw)) {
    if (v === '' || v === undefined || v === null) continue
    const numericKeys = ['distance_km', 'swim_m', 'bike_km', 'run_km', 'hr_avg', 'hr_max', 'stamina_end']
    out[k] = numericKeys.includes(k) ? Number(v) : v
  }
  return out
}

export default function SessionModal({ day, hrZones, record, onClose, onSave, onDelete }) {
  const initialStatus = record?.done ? 'done' : record?.skipped ? 'skipped' : 'pending'
  const [status, setStatus] = useState(initialStatus)
  const [actual, setActual] = useState(() => {
    const a = record?.actual || {}
    const out = {}
    for (const [k, v] of Object.entries(a)) out[k] = v === undefined ? '' : String(v)
    return out
  })

  const setField = (key) => (val) => setActual((prev) => ({ ...prev, [key]: val }))

  const fields = sportFields(day.sport)
  const showAdjustNote = day.sport === 'bike' || day.sport === 'run' || day.sport === 'brick'

  function handleSave() {
    if (status === 'pending') {
      onDelete(day.date)
      onClose()
      return
    }
    const entry = { done: status === 'done', skipped: status === 'skipped' }
    if (status === 'done') {
      entry.actual = cleanActual(actual)
    }
    onSave(day.date, entry)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-white/10 bg-[#12141c] p-5 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">{formatLong(day.date)}</p>
            <h2 className="mt-0.5 flex items-center gap-2 text-lg font-semibold text-slate-100">
              <span>{day.icon}</span>
              {day.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {day.detail && <p className="mb-3 text-sm text-slate-300">{day.detail}</p>}
        <div className="mb-4">
          <ZoneBadge zone={day.zone} hrZones={hrZones} pace={day.pace} />
        </div>
        {day.note && <p className="mb-4 rounded-lg bg-white/5 p-2 text-xs text-slate-400">{day.note}</p>}

        <div className="mb-4 flex gap-2">
          {[
            { key: 'pending', label: 'Pendiente', cls: 'border-white/15 text-slate-300' },
            { key: 'done', label: '✅ Hecho', cls: 'border-emerald-400/60 text-emerald-300' },
            { key: 'skipped', label: '⏭️ Saltado', cls: 'border-amber-400/60 text-amber-300' },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => setStatus(opt.key)}
              className={`flex-1 rounded-lg border px-2 py-2 text-sm font-medium transition
                ${status === opt.key ? `${opt.cls} bg-white/10` : 'border-white/10 text-slate-500 hover:bg-white/5'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {status === 'done' && day.sport !== 'rest' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {fields.map((f) => (
                <Field key={f.key} label={f.label}>
                  {f.type === 'number' ? (
                    <NumberInput value={actual[f.key] ?? ''} onChange={setField(f.key)} placeholder={f.placeholder} />
                  ) : (
                    <TextInput value={actual[f.key] ?? ''} onChange={setField(f.key)} placeholder={f.placeholder} />
                  )}
                </Field>
              ))}
              <Field label="FC media (ppm)">
                <NumberInput value={actual.hr_avg ?? ''} onChange={setField('hr_avg')} placeholder="157" />
              </Field>
              <Field label="FC máxima (ppm)">
                <NumberInput value={actual.hr_max ?? ''} onChange={setField('hr_max')} placeholder="182" />
              </Field>
              <Field label="Body Battery final (0-100)">
                <NumberInput value={actual.stamina_end ?? ''} onChange={setField('stamina_end')} placeholder="42" />
              </Field>
            </div>
            {showAdjustNote && (
              <Field label="Ajuste por altitud/calor (opcional)">
                <TextInput
                  value={actual.adjust_note ?? ''}
                  onChange={setField('adjust_note')}
                  placeholder="p. ej. mucho calor, ritmo +15s/km"
                />
              </Field>
            )}
            <Field label="Notas">
              <textarea
                className={`${inputClass} min-h-16 resize-y`}
                value={actual.notes ?? ''}
                onChange={(e) => setField('notes')(e.target.value)}
                placeholder="Sensaciones, viento, terreno..."
              />
            </Field>
          </div>
        )}

        <div className="mt-5 flex items-center justify-between gap-2">
          {record ? (
            <button
              onClick={() => {
                onDelete(day.date)
                onClose()
              }}
              className="text-xs font-medium text-rose-400 hover:text-rose-300"
            >
              Borrar registro
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button onClick={onClose} className="rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 hover:bg-white/5">
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
