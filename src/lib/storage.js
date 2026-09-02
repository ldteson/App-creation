import { useCallback, useEffect, useState } from 'react'

const RECORDS_KEY = 'mallorca703_records_v1'
const WEIGHT_KEY = 'mallorca703_weight_v1'

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage unavailable/full — silently skip persistence
  }
}

/**
 * Training log keyed by date, e.g. { "2026-09-12": { done, skipped, actual, notes } }.
 * See README.md "Modelo de registro (localStorage)".
 */
export function useRecords() {
  const [records, setRecords] = useState(() => readJSON(RECORDS_KEY, {}))

  useEffect(() => {
    writeJSON(RECORDS_KEY, records)
  }, [records])

  const setRecord = useCallback((date, entry) => {
    setRecords((prev) => ({ ...prev, [date]: entry }))
  }, [])

  const removeRecord = useCallback((date) => {
    setRecords((prev) => {
      const next = { ...prev }
      delete next[date]
      return next
    })
  }, [])

  return { records, setRecord, removeRecord }
}

/** Weight log: array of { date, weight_kg }, one entry per date. */
export function useWeightLog() {
  const [entries, setEntries] = useState(() => readJSON(WEIGHT_KEY, []))

  useEffect(() => {
    writeJSON(WEIGHT_KEY, entries)
  }, [entries])

  const addEntry = useCallback((date, weight_kg) => {
    setEntries((prev) => {
      const withoutDate = prev.filter((e) => e.date !== date)
      return [...withoutDate, { date, weight_kg }].sort((a, b) => a.date.localeCompare(b.date))
    })
  }, [])

  const removeEntry = useCallback((date) => {
    setEntries((prev) => prev.filter((e) => e.date !== date))
  }, [])

  return { entries, addEntry, removeEntry }
}
