# App de seguimiento — Mallorca 70.3 (Plan Ricard)

Este repo contiene el plan de entreno completo como datos (`training-plan.json`) y esta spec.
Objetivo: construir una app para **seguir los entrenos día a día**, marcarlos como hechos y comparar lo planificado vs lo real.

## Cómo usar este paquete en Claude Code

Descargas 3 archivos sueltos: `training-plan.json`, `README.md` y `generate.py`.

1. Crea una carpeta en tu ordenador (p. ej. `mallorca-70.3/`) y mete los 3 archivos dentro.
2. Abre esa carpeta en Claude Code (`claude` desde la terminal en esa carpeta, o ábrela desde la app).
3. Pídele: *"Lee README.md y training-plan.json y crea la app de seguimiento descrita"*.

`training-plan.json` es la **fuente de verdad**: la app lo lee, no reescribas el plan a mano.
`generate.py` solo lo necesitas si quieres regenerar el JSON tras cambiar distancias o ritmos.

## Datos (`training-plan.json`)

- `athlete`, `race` — perfil y datos de la carrera (8 mayo 2027, Alcúdia).
- `hr_zones` — 5 zonas de FC (máx 193 ppm) con ritmos de run/bici por zona.
- `weekly_template` — estructura fija: **1 natación · 2 bici · 2 run · 1 gym · descanso jueves**.
  - `base_build`: LUN nado · MAR gym · MIÉ bici calidad · JUE descanso · VIE run calidad · SÁB bici larga · DOM run largo.
  - `specific_peak`: igual pero MAR movilidad y DOM = brick (bici+run).
- `pace_progression` — tabla de ritmos de series y Z2 por mes.
- `phases[]` — 9 fases (Base 1-4 → Build 1-2 → Específica → Peak → Taper). Cada fase → `weeks[]` → `days[]`.
  - Cada día trae `date`, `sport` (`swim|bike|run|gym|mobility|brick|rest|race`), `title`, `detail`, `zone`, `icon` y, si aplica, `distance_km` / `pace` / `bike_km` / `run_km`.
  - `deload: true` marca semana de descarga; `peak: true` la sesión pico (brick 101km, 21 mar).

## Qué construir (MVP)

**Stack sugerido:** React + Vite + Tailwind, estado en `localStorage` (una sola persona, sin backend).

1. **Vista Hoy** — la sesión del día: deporte, detalle, zona de FC objetivo con ppm y ritmo. Botón *Hecho / Saltado*.
2. **Vista Semana** — rejilla LUN→DOM con las 7 sesiones; resalta hoy y el jueves de descanso; badge de descarga/pico.
3. **Vista Plan** — timeline de las 9 fases con fechas; expandible a semanas.
4. **Registro** — al marcar *Hecho*, permitir anotar lo real (distancia, tiempo, FC media/máx, stamina, notas). Guardar por `date`.
5. **Progreso** — comparar planificado vs real: FC media por sesión en el tiempo (debería bajar), km acumulados por deporte, % adherencia semanal. Usar `hr_zones` para colorear.
6. **Peso** — registro simple de peso con línea objetivo 92→81 kg hacia el 8 may 2027.

## Detalles importantes

- **Zonas de FC**: la regla del plan es hacer los fondos (bici larga, run largo) en **Z2 (116-135 ppm)** aunque el ritmo sea lento. Muestra siempre la ppm objetivo, no solo el ritmo.
- **Bricks (feb-abr, domingos)**: son una sola sesión con dos tramos (`bike_km` + `run_km` con `run_pace`). El registro debería aceptar ambos tramos.
- **Ajustes por altitud/calor**: opcional, campo de nota. El plan asume que en llano/normales los ritmos son algo más rápidos.
- El JSON incluye `date` en cada día, así que la app puede ir directa al calendario real.

## Modelo de registro (localStorage)

```json
{
  "2026-09-12": { "done": true, "actual": { "distance_km": 48, "time": "1:20:26",
    "hr_avg": 157, "hr_max": 182, "stamina_end": 42, "notes": "..." } }
}
```
Clave = `date` del día. Así se cruza 1:1 con el plan.
