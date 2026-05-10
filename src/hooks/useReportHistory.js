import { useState } from 'react'

const STORAGE_KEY = 'bugsnap_history'
const MAX_HISTORY = 10

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [] }
  catch { return [] }
}

function save(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

export function useReportHistory() {
  const [history, setHistory] = useState(load)

  function addReport(entry) {
    setHistory(prev => {
      const next = [entry, ...prev].slice(0, MAX_HISTORY)
      save(next)
      return next
    })
  }

  function removeReport(id) {
    setHistory(prev => {
      const next = prev.filter(e => e.id !== id)
      save(next)
      return next
    })
  }

  function clearHistory() {
    save([])
    setHistory([])
  }

  return { history, addReport, removeReport, clearHistory }
}
