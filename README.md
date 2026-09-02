# Mallorca 70.3 — Seguimiento de entreno

App de seguimiento para el plan de entreno hacia el IRONMAN 70.3 Alcúdia (Mallorca, 8 mayo 2027).
Lee el plan desde `src/data/training-plan.json` (fuente de verdad) y guarda el registro de cada
sesión en `localStorage` del navegador — sin backend, pensada para un único usuario.

## Vistas

- **Hoy** — la sesión del día con su zona de FC objetivo, ritmo, y botón para marcarla Hecha/Saltada.
- **Semana** — rejilla lun→dom con las 7 sesiones de la semana, navegable, con badges de descarga/pico.
- **Plan** — timeline de las 9 fases (Base 1-4 → Build 1-2 → Específica → Peak → Taper), expandible por semana.
- **Progreso** — FC media por sesión en el tiempo, km acumulados por deporte, adherencia semanal.
- **Peso** — registro de peso con línea objetivo hacia la fecha de carrera.

## Instalarla en el móvil (PWA)

La app es una PWA instalable, desplegada en GitHub Pages en cuanto se activa
(ver más abajo): **https://ldteson.github.io/App-creation/**

- **Android / Chrome:** abre el enlace → menú ⋮ → "Añadir a pantalla de inicio".
- **iPhone / Safari:** abre el enlace → botón compartir 􀈂 → "Añadir a pantalla de inicio".

Queda como un icono más, abre a pantalla completa sin barra de navegador, y funciona sin conexión
una vez cargada (el registro sigue viviendo en `localStorage`, por dispositivo).

## Desarrollo

```bash
npm install
npm run dev      # servidor de desarrollo
npm run build    # build de producción
npm run lint     # oxlint
```

## Actualizar el plan

`training-plan.json` es la fuente de verdad — no se edita a mano. Si cambian distancias o ritmos,
regenera el JSON con:

```bash
python3 generate.py
```

(ver `generate.py` para la configuración de fases, ritmos y distancias por mes).

## Modelo de datos en localStorage

```json
{
  "mallorca703_records_v1": {
    "2026-09-12": { "done": true, "actual": { "distance_km": 48, "time": "1:20:26",
      "hr_avg": 157, "hr_max": 182, "stamina_end": 42, "notes": "..." } }
  },
  "mallorca703_weight_v1": [{ "date": "2026-09-12", "weight_kg": 71.5 }]
}
```

## Despliegue (GitHub Pages)

`.github/workflows/deploy.yml` construye y publica `dist/` en GitHub Pages en cada push a `main`
o a esta rama. La primera vez hay que activarlo una vez en el repo: **Settings → Pages → Build and
deployment → Source: "GitHub Actions"**. A partir de ahí cada push despliega solo.

El build de producción usa `base: '/App-creation/'` (variable `GITHUB_PAGES=true`, la pone el
workflow) y el router usa hash (`/#/semana`) para que las rutas funcionen en un hosting estático
sin servidor.
