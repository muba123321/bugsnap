import { useState } from 'react'

const STORAGE_KEY = 'bugsnap_api_key'

export function useApiKey() {
  const [apiKey, setApiKeyState] = useState(() => localStorage.getItem(STORAGE_KEY))

  function setApiKey(key) {
    localStorage.setItem(STORAGE_KEY, key)
    setApiKeyState(key)
  }

  function clearApiKey() {
    localStorage.removeItem(STORAGE_KEY)
    setApiKeyState(null)
  }

  return { apiKey, setApiKey, clearApiKey }
}
