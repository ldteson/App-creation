#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Genera training-plan.json para la app de seguimiento de entrenos (Mallorca 70.3)."""
import json, datetime

# ------------------------------------------------------------------ META
HR_MAX = 192  # estimación (edad 26; picos de estrés alto ~188). Confirmar con test de máximo real.

athlete = {
    "name": "Lucas",
    "age": 26,
    "location": "Barcelona",
    # --- Baseline (de Garmin, jun-sep 2026) ---
    "height_cm": 182,
    "weight_start_kg": 72,
    "weight_target_kg": 70,     # margen ligero hacia la carrera; ajustable
    "hr_max": HR_MAX,
    "hr_max_source": "estimado (pendiente test de máximo real)",
    "resting_hr": 52,
    "vo2max": 45,
    "vo2max_trend": "42,6 (jul) → 45,3 (2 sep) · top 45% edad/sexo",
    "current_paces": {
        "swim_100m": "1:52–2:02 (mejor 1:52)",
        "run_easy_km": "6:20–6:40",
        "run_tempo_km": "5:29 (sostenido 7,7 km)",
        "bike_kmh": "17–20",
    },
    "profile_summary": "Nadador fuerte · corredor sólido · ciclista a mejorar (foco del plan)",
    "swim_background": "Fuerte — ya por debajo del ritmo objetivo de carrera",
    # --- Equipo ---
    "bike": "Cervélo Soloist CSC (2008) — apta para el segmento de bici del 70.3",
    "shoes": "Sidi Iron",
    "device": "Garmin (entrenos + sueño)",
    "other_sports": "Pádel, esquí",
}

race = {
    "event": "Mallorca 70.3",
    "date": "2027-05-08",
    "start_time": "07:30",
    "location": "Alcúdia Bay",
    "segments": {"swim_km": 1.9, "bike_km": 90, "run_km": 21.1},
    "goal_total": "~5h45",
    "goal_splits": {"swim": "~45'", "bike": "~2h45'", "run": "~2h05' (5:55/km)"},
    "race_pace_run": "5:55/km",
    "stepping_stones": [
        {"event": "Simulacro olímpico propio", "date": "2027-02", "type": "Olímpico (autoorganizado)",
         "detail": "1500 nado / 40 bici / 10 run · test de ritmos y transiciones · idealmente nado en aguas abiertas"},
        {"event": "TriTour Deltebre Olímpico", "date": "2027-04", "type": "Olímpico"},
    ],
}

def _z(lo, hi):
    return f"{round(HR_MAX*lo)}-{round(HR_MAX*hi)}"

hr_zones = [
    {"zone": "Z1", "pct": "50-60%", "bpm": _z(.50,.60), "run": ">7:30/km",    "bike": "<20 km/h",  "feel": "Muy fácil. Recuperación activa."},
    {"zone": "Z2", "pct": "60-70%", "bpm": _z(.60,.70), "run": "6:45-7:30/km","bike": "22-26 km/h", "feel": "Base aeróbica. LA ZONA CLAVE del plan."},
    {"zone": "Z3", "pct": "70-80%", "bpm": _z(.70,.80), "run": "6:00-6:45/km","bike": "26-30 km/h", "feel": "Tempo. Incómodo pero sostenible."},
    {"zone": "Z4", "pct": "80-90%", "bpm": _z(.80,.90), "run": "5:15-6:00/km","bike": "30-34 km/h", "feel": "Umbral. Solo series específicas."},
    {"zone": "Z5", "pct": "90-100%","bpm": _z(.90,1.0), "run": "<5:15/km",    "bike": ">34 km/h",  "feel": "Máximo. Series cortas."},
]

# ------------------------------------------------------------------ PLANTILLA SEMANAL
# 1 natación, 2 bici, 2 run, 1 gym, descanso jueves.
# LUN nado · MAR gym/movilidad · MIÉ bici calidad · JUE descanso · VIE run calidad · SÁB bici larga · DOM run largo/brick
WEEKLY_TEMPLATE = {
    "base_build": ["swim", "gym", "bike_quality", "rest", "run_quality", "bike_long", "run_long"],
    "specific_peak": ["swim", "mobility", "bike_quality", "rest", "run_quality", "bike_long", "brick"],
    "taper": ["swim", "mobility", "bike_quality", "rest", "run_quality", "bike_long", "run_long"],
}
DAYS = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"]

# ------------------------------------------------------------------ CONFIG POR MES
# bike_long / run_long: distancia (km) por semana; deload = índice de semana de descarga (0-based)
months = [
    {"key":"2026-09","name":"Base 1","phase":"BASE","template":"base_build",
     "run_series":"6x800m a 5:40-5:45/km (90s desc)","z2_run":"7:00-7:15/km",
     "bike_quality":"Indoor Z4 · 4x5' Z4 · ~30km",
     "bike_long":[25,30,35,22],"run_long":[10,10,11,8],"run_long_pace":["7:00","7:00","7:00","7:15"],
     "deload":3},
    {"key":"2026-10","name":"Base 2","phase":"BASE","template":"base_build",
     "run_series":"6x800m a 5:30-5:40/km (90s desc)","z2_run":"6:55-7:05/km",
     "bike_quality":"Indoor Z4 · 4x5' Z4 · ~40km",
     "bike_long":[40,46,28,52],"run_long":[11,11,9,12],"run_long_pace":["6:55","6:55","7:10","6:55"],
     "deload":2},
    {"key":"2026-11","name":"Base 3","phase":"BASE","template":"base_build",
     "run_series":"6x800m a 5:25-5:30/km (90s desc)","z2_run":"6:50-7:00/km",
     "bike_quality":"Indoor Z4 · 4x5' Z4 · ~46km",
     "bike_long":[55,62,38,68],"run_long":[12,12,10,13],"run_long_pace":["6:50","6:50","7:00","6:50"],
     "deload":2},
    {"key":"2026-12","name":"Base 4","phase":"BASE","template":"base_build",
     "run_series":"6x800m a 5:15-5:20/km (90s desc)","z2_run":"6:45-6:55/km",
     "bike_quality":"Indoor Z4 · 4x5' Z4 · ~50km",
     "bike_long":[70,76,84,50],"run_long":[13,13,14,10],"run_long_pace":["6:45","6:45","6:45","7:00"],
     "deload":3},
    {"key":"2027-01","name":"Build 1","phase":"BUILD","template":"base_build",
     "run_series":"5x1000m a 5:25-5:30/km (75s desc)","z2_run":"6:35-6:45/km",
     "bike_quality":"Indoor Z4 · ~55km",
     "bike_long":[85,95,58,100],"run_long":[14,14,11,16],"run_long_pace":["6:40","6:40","6:45","6:35"],
     "deload":2},
    {"key":"2027-02","name":"Build 2","phase":"BUILD","template":"base_build",
     "run_series":"5x1000m a 5:15-5:20/km (75s desc)","z2_run":"6:25-6:35/km",
     "bike_quality":"Indoor Z4 · ~60km",
     "bike_long":[100,100,115,70],
     "brick":[{"bike":70,"run":12,"pace":"6:20"},{"bike":75,"run":12,"pace":"6:15"},
              {"bike":85,"run":12,"pace":"6:10"},{"bike":40,"run":10,"pace":"6:25","sim":"olimpico"}],
     "deload":3,"dom":"brick"},
    {"key":"2027-03","name":"Específica","phase":"SPECIFIC","template":"specific_peak",
     "run_series":"4x1500m / 3x2000m a 5:30-5:40/km (60s desc)","z2_run":"6:15-6:25/km",
     "bike_quality":"Indoor Z4 · ~65km",
     "bike_long":[100,105,115,70],
     "brick":[{"bike":80,"run":12,"pace":"6:10"},{"bike":85,"run":12,"pace":"6:05"},
              {"bike":95,"run":12,"pace":"6:00"},{"bike":45,"run":10,"pace":"6:10"}],
     "deload":3,"dom":"brick","peak_week":2},
    {"key":"2027-04","name":"Peak","phase":"PEAK","template":"specific_peak",
     "run_series":"4x1500m / 3x2000m a 5:20-5:35/km (60s desc)","z2_run":"6:10-6:20/km",
     "bike_quality":"Indoor Z4 · ~70km",
     "bike_long":[90,95,105,65],
     "brick":[{"bike":70,"run":12,"pace":"6:05"},{"bike":72,"run":12,"pace":"6:00"},
              {"bike":82,"run":12,"pace":"5:55"},{"bike":45,"run":10,"pace":"6:05"}],
     "deload":3,"dom":"brick"},
]

HOME = "Carrer de l'Avet 13b, Barcelona (Sarrià-Sant Gervasi)"
Z2_BPM = f"{round(HR_MAX*.60)}-{round(HR_MAX*.70)} ppm"   # 115-134
Z4_BPM = f"{round(HR_MAX*.80)}-{round(HR_MAX*.90)} ppm"   # 154-173
ROUTES_NOTE = "Bici de carretera: subida por Vallvidrera / Collserola (asfalto abierto) para desnivel, o costa llana para Z2 puro. Los caminos de tierra del parque (Ctra. de les Aigües) siguen cerrados."

def bike_route(dist, hilly=False):
    if hilly:
        return f"Desde {HOME}: sube por Vallvidrera y enlaza Collserola por carretera (Tibidabo / hacia Sant Cugat). Desnivel para trabajo de fuerza y Z4."
    if dist <= 30:
        return f"Desde {HOME}: baja a la costa y Passeig Marítim dir. Castelldefels; vuelta. Llano, ideal Z2."
    if dist <= 55:
        return "Costa → Castelldefels ida y vuelta por paseo/carril llano. Z2 sostenido, sin repechos."
    if dist <= 85:
        return "Costa → Castelldefels → primeros repechos del Garraf hacia Sitges y vuelta. O variante Vallvidrera-Sant Cugat para meter desnivel."
    return "Costa → Sitges por el Garraf → extensión a Vilanova y vuelta. Salida larga: lleva avituallamiento y bidones."

def session(kind, m, wk, deload):
    if kind == "swim":
        return {"sport":"swim","title":"Natación (con entrenador)","zone":"Z2-Z3","icon":"🌊",
                "detail":"~1.500m · sesión guiada por tu entrenador","structure":[],"cues":[]}
    if kind == "gym":
        return {"sport":"gym","title":"Gym — Fuerza funcional","zone":"—","icon":"🏋️",
                "detail":"Fuerza de base + core (técnica > carga)",
                "structure":["Sentadilla 4x8","Peso muerto rumano 3x10","Zancadas 3x12/pierna",
                             "Puente de glúteo 3x15","Plancha 3x45\" + plancha lateral 3x30\"/lado"],
                "cues":["Prioriza técnica y rango","Core al final","Nada al fallo: esto complementa, no fatiga"]}
    if kind == "mobility":
        return {"sport":"mobility","title":"Movilidad","zone":"Z1","icon":"🧘",
                "detail":"20' foam roller + movilidad de cadera/tobillo","structure":[],"cues":[]}
    if kind == "rest":
        return {"sport":"rest","title":"Descanso","zone":"—","icon":"💤",
                "detail":"Descanso completo o caminata suave 20-30'","structure":[],"cues":[]}
    if kind == "bike_quality":
        main = m.get("bike_quality","4x5' Z4 (5' rec)")
        return {"sport":"bike","title":"Bici calidad","zone":"Z4","icon":"🚴",
                "detail":f"Intervalos en Z4 ({Z4_BPM}) · subida Vallvidrera/Collserola o turbo indoor",
                "route":bike_route(0, hilly=True),
                "structure":["15' calentamiento progresivo hasta Z3", main, "10' enfriamiento suave Z1-Z2"],
                "cues":["Series en Z4, recuperaciones muy suaves","En subida el desnivel te sube la FC: aprovéchalo para la fuerza",
                        "Cadencia alta en llano (90-100 rpm), más baja y potente en rampa"]}
    if kind == "bike_long":
        d = m["bike_long"][wk]; tag = " · descarga" if deload else ""
        return {"sport":"bike","title":"Bici larga Z2","zone":"Z2","icon":"🚴","distance_km":d,
                "detail":f"{d} km en Z2 ({Z2_BPM}){tag}",
                "route":bike_route(d),
                "structure":[f"{d} km continuos a FC de Z2","Terreno llano de costa"],
                "cues":[f"Manda la FC: {Z2_BPM} aunque el ritmo sea bajo","Cadencia 85-90 rpm",
                        "Come/bebe cada 30-40' en salidas >90'","Es tu deporte a mejorar: constancia > intensidad"]}
    if kind == "run_quality":
        return {"sport":"run","title":"Run calidad","zone":"Z4","icon":"🏃",
                "detail":m.get("run_series",""),
                "structure":["10-12' calentamiento a ~6:30/km", m.get("run_series",""), "10' enfriamiento suave"],
                "cues":[f"Series en Z4 ({Z4_BPM})","Recupera caminando o trote muy suave","Técnica: cadencia ~170-175 ppm"]}
    if kind == "run_long":
        d = m["run_long"][wk]; p = m["run_long_pace"][wk]; tag = " · descarga" if deload else ""
        return {"sport":"run","title":"Run largo Z2","zone":"Z2","icon":"🏃","distance_km":d,"pace":p,
                "detail":f"{d} km a {p}/km en Z2 ({Z2_BPM}){tag}",
                "structure":[f"{d} km continuos a {p}/km"],
                "cues":[f"FC en Z2 ({Z2_BPM})","Ritmo conversacional","Si la FC sube, afloja aunque el ritmo baje"]}
    if kind == "brick":
        b = m["brick"][wk]
        if b.get("sim") == "olimpico":
            return {"sport":"triathlon","title":"🏁 SIMULACRO OLÍMPICO","zone":"RACE-sim","icon":"🏁",
                    "detail":"1500m nado + 40km bici + 10km run · con transiciones (T1/T2)","simulation":True,
                    "swim_m":1500,"bike_km":40,"run_km":10,
                    "structure":["1500m nado (aguas abiertas si es posible)","T1: cambio a bici",
                                 "40 km bici a ritmo objetivo","T2: cambio a run","10 km run a ritmo objetivo"],
                    "cues":["Cronometra los 3 segmentos y las transiciones por separado","Prueba avituallamiento de carrera",
                            "Objetivo: sacar foto realista antes de Deltebre (abril)"]}
        tag = " · descarga" if deload else ""
        return {"sport":"brick","title":"Brick (bici + run)","zone":"Z2","icon":"🧱",
                "bike_km":b["bike"],"run_km":b["run"],"run_pace":b["pace"],
                "detail":f"{b['bike']} km bici Z2 + {b['run']} km run a {b['pace']}/km{tag}",
                "route":bike_route(b["bike"]),
                "structure":[f"{b['bike']} km bici en Z2","Transición rápida (<5')",f"{b['run']} km run a {b['pace']}/km"],
                "cues":["Los primeros 1-2 km del run las piernas van 'de bici' — normal, no te asustes",
                        "Practica la transición como el día de carrera","Run a ritmo objetivo, no más rápido"]}
    return {"sport":"rest","title":"—","detail":"","zone":"—","icon":"·","structure":[],"cues":[]}

def week_start_dates(year, month):
    """Devuelve los lunes que caen dentro del mes."""
    d = datetime.date(year, month, 1)
    d += datetime.timedelta(days=(7 - d.weekday()) % 7)  # primer lunes
    out = []
    while d.month == month:
        out.append(d); d += datetime.timedelta(days=7)
    return out

phases_out = []
for m in months:
    year, mon = int(m["key"][:4]), int(m["key"][5:7])
    tmpl = WEEKLY_TEMPLATE[m["template"]]
    n_weeks = len(m.get("bike_long", m.get("brick", [0,0,0,0])))
    weeks = []
    mondays = week_start_dates(year, mon)
    for wk in range(n_weeks):
        deload = (wk == m.get("deload", -1))
        start = mondays[wk].isoformat() if wk < len(mondays) else None
        days = []
        for i, kind in enumerate(tmpl):
            # En meses con brick, el DOM usa 'brick' en lugar de 'run_long'
            if kind == "run_long" and m.get("dom") == "brick":
                kind = "brick"
            s = session(kind, m, wk, deload)
            s = {"day": DAYS[i], **s}
            if start:
                s["date"] = (mondays[wk] + datetime.timedelta(days=i)).isoformat()
            days.append(s)
        weeks.append({
            "week": wk + 1,
            "start_date": start,
            "deload": deload,
            "peak": (wk == m.get("peak_week", -1)),
            "days": days,
        })
    phases_out.append({
        "id": m["key"], "name": m["name"], "phase": m["phase"],
        "template": m["template"], "weeks": weeks,
    })

# --------------------------------------------------------- TAPER + CARRERA (Mayo)
taper = {
    "id":"2027-05","name":"Taper + Carrera","phase":"TAPER","template":"taper",
    "notes":"Volumen -50%, mantener algo de intensidad. Dormir mucho. Sin restricción calórica.",
    "weeks":[
        {"week":1,"start_date":"2027-05-03","deload":True,"peak":False,"days":[
            {"day":"LUN","date":"2027-05-03","sport":"swim","title":"Natación técnica","detail":"1.500m suave","zone":"Z2","icon":"🌊"},
            {"day":"MAR","date":"2027-05-04","sport":"run","title":"Run suave","detail":"5 km a 6:20/km","zone":"Z2","distance_km":5,"pace":"6:20","icon":"🏃"},
            {"day":"MIÉ","date":"2027-05-05","sport":"bike","title":"Bici suave","detail":"30 km muy suave","zone":"Z2","distance_km":30,"icon":"🚴"},
            {"day":"JUE","date":"2027-05-06","sport":"rest","title":"Descanso","detail":"Caminata 30'","zone":"—","icon":"💤"},
            {"day":"VIE","date":"2027-05-07","sport":"run","title":"Run activación","detail":"3 km muy suave a 6:30/km","zone":"Z1","distance_km":3,"pace":"6:30","icon":"🏃"},
            {"day":"SÁB","date":"2027-05-08","sport":"race","title":"🏁 CARRERA — Mallorca 70.3","detail":"1.9 km nado / 90 km bici / 21 km run · Salida 07:30 · Alcúdia","zone":"RACE","icon":"🏁"},
            {"day":"DOM","date":"2027-05-09","sport":"rest","title":"Post-carrera","detail":"¡Descansa y disfruta!","zone":"—","icon":"🎉"},
        ]},
    ],
}
phases_out.append(taper)

# --------------------------------------------------------- PROGRESIÓN DE RITMOS
pace_progression = [
    {"month":"Sep'26","phase":"Base 1","series":"6x800m a 5:40-5:45/km","rest":"90s","z2_run":"7:00-7:15/km","brick_run":None},
    {"month":"Oct'26","phase":"Base 2","series":"6x800m a 5:30-5:40/km","rest":"90s","z2_run":"6:55-7:05/km","brick_run":None},
    {"month":"Nov'26","phase":"Base 3","series":"6x800m a 5:25-5:30/km","rest":"90s","z2_run":"6:50-7:00/km","brick_run":None},
    {"month":"Dic'26","phase":"Base 4","series":"6x800m a 5:15-5:20/km","rest":"90s","z2_run":"6:45-6:55/km","brick_run":None},
    {"month":"Ene'27","phase":"Build 1","series":"5x1000m a 5:25-5:30/km","rest":"75s","z2_run":"6:35-6:45/km","brick_run":None},
    {"month":"Feb'27","phase":"Build 2","series":"5x1000m a 5:15-5:20/km","rest":"75s","z2_run":"6:25-6:35/km","brick_run":"6:10-6:20/km"},
    {"month":"Mar'27","phase":"Específica","series":"4x1500m / 3x2000m a 5:30-5:40/km","rest":"60s","z2_run":"6:15-6:25/km","brick_run":"6:00-6:10/km"},
    {"month":"Abr'27","phase":"Peak","series":"4x1500m / 3x2000m a 5:20-5:35/km","rest":"60s","z2_run":"6:10-6:20/km","brick_run":"5:55-6:05/km"},
    {"month":"8 May","phase":"CARRERA","series":"RACE PACE","rest":"—","z2_run":"5:55/km (21km)","brick_run":None},
]

plan = {
    "meta": {
        "title": "Plan Lucas — IRONMAN 70.3 Alcúdia",
        "generated": datetime.date.today().isoformat(),
        "weekly_structure": "1 natación · 2 bici · 2 run · 1 gym · descanso jueves",
        "phases_overview": "Base 1-4 (sep-dic) → Build 1-2 (ene-feb) → Específica (mar) → Peak (abr) → Taper (may)",
        "home_base": HOME,
        "bike_routes_note": ROUTES_NOTE,
        "kickoff": {
            "date": "2026-09-03",
            "sport": "run",
            "title": "🏃 Arranque — carrera de activación",
            "detail": "Ritmo objetivo 6:30/km · mantener FC < ~145 ppm",
            "target_pace": "6:30",
            "structure": ["5' calentamiento andando/trote muy suave", "Rodaje continuo a 6:30/km", "5' vuelta a la calma"],
            "cues": ["6:30/km cae en tu Z3 — deja que mande la FC (<145 ppm)", "Sin prisa: es activación, no test"],
            "note": "Sesión de activación antes del inicio oficial de Base 1 (lun 7 sep).",
        },
    },
    "athlete": athlete,
    "race": race,
    "hr_zones": hr_zones,
    "hr_zones_note": f"Zonas calculadas sobre FC máx {HR_MAX} ppm (estimada). Actualizar con test de máximo real.",
    "baseline_garmin": {
        "captured": "2026-09-02",
        "vo2max_series": [42.9, 42.9, 43.1, 42.6, 43.7, 44.1, 44.3, 44.5, 45.3],
        "resting_hr_recent": {"27ago-2sep": 52, "20-26ago": 53, "13-19ago": 52, "6-12ago": 51, "30jul-5ago": 49},
        "activities": [
            {"date": "2026-07-24", "sport": "swim", "dist_m": 1022, "time": "24:59", "pace_100m": "2:14"},
            {"date": "2026-07-22", "sport": "swim", "dist_m": 1425, "time": "36:55", "pace_100m": "2:12"},
            {"date": "2026-07-14", "sport": "swim", "dist_m": 1700, "time": "41:24", "pace_100m": "1:59"},
            {"date": "2026-06-25", "sport": "swim", "dist_m": 750,  "time": "13:58", "pace_100m": "1:52"},
            {"date": "2026-06-23", "sport": "run",  "dist_km": 4.48, "time": "29:07", "pace_km": "6:30", "label": "Roda de Berà"},
            {"date": "2026-06-22", "sport": "run",  "dist_km": 7.68, "time": "42:07", "pace_km": "5:29", "label": "Barcelona"},
            {"date": "2026-06-20", "sport": "run",  "dist_km": 4.12, "time": "26:04", "pace_km": "6:20", "label": "Barcelona"},
            {"date": "2026-06-18", "sport": "swim", "dist_m": 1475, "time": "39:25", "pace_100m": "2:02"},
            {"date": "2026-06-17", "sport": "bike", "dist_km": 23.0, "time": "1:20:00", "speed_kmh": 17.2},
            {"date": "2026-06-16", "sport": "run",  "dist_km": 4.23, "time": "28:11", "pace_km": "6:39", "label": "Sant Boi"},
            {"date": "2026-06-15", "sport": "swim", "dist_m": 1300, "time": "45:00", "pace_100m": "3:28"},
            {"date": "2026-06-12", "sport": "bike", "dist_km": 14.3, "time": "41:52", "speed_kmh": 20.5, "label": "Roda de Berà"},
            {"date": "2026-06-11", "sport": "swim", "dist_m": 575,  "time": "15:09", "pace_100m": "2:23"},
            {"date": "2026-06-09", "sport": "run",  "dist_km": 4.69, "time": "30:22", "pace_km": "6:29", "label": "Barcelona"},
        ],
    },
    "weekly_template": WEEKLY_TEMPLATE,
    "pace_progression": pace_progression,
    "phases": phases_out,
}

with open("/home/claude/plan/training-plan.json","w",encoding="utf-8") as f:
    json.dump(plan, f, ensure_ascii=False, indent=2)

# resumen
tot_w = sum(len(p["weeks"]) for p in phases_out)
print(f"OK · {len(phases_out)} fases · {tot_w} semanas generadas")
