import { useState } from 'react'
import { generateReport } from './lib/generateReport'
import { useApiKey } from './hooks/useApiKey'
import { useReportHistory } from './hooks/useReportHistory'
import ApiKeySetup from './components/ApiKeySetup'
import BugInput from './components/BugInput'
import ReportCard from './components/ReportCard'
import ReportHistory from './components/ReportHistory'

const BugIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 2l1.88 1.88M14.12 3.88 16 2M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/>
    <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6z"/>
    <path d="M12 20v-9M6.53 9C4.6 8.8 3 7.1 3 5M6 13H2M3 21c0-2.1 1.7-3.9 3.8-4M20.97 5c0 2.1-1.6 3.8-3.5 4M22 13h-4M17.2 17c2.1.1 3.8 1.9 3.8 4"/>
  </svg>
)

export default function App() {
  const { apiKey, setApiKey, clearApiKey } = useApiKey()
  const { history, addReport, removeReport, clearHistory } = useReportHistory()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isInvalidKey, setIsInvalidKey] = useState(false)

  if (!apiKey) return <ApiKeySetup onSave={setApiKey} />

  async function handleGenerate(inputText) {
    setLoading(true)
    setError('')
    setIsInvalidKey(false)
    setReport(null)
    try {
      const result = await generateReport(inputText, apiKey)
      setReport(result)
      addReport({
        id: crypto.randomUUID(),
        title: result.title,
        severity: result.severity,
        timestamp: Date.now(),
        report: result,
      })
    } catch (err) {
      if (err.message === 'INVALID_KEY') {
        setIsInvalidKey(true)
        setError('Invalid API key. Please update it.')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0b0c0f', fontFamily: "'DM Mono', 'Courier New', monospace", color: '#e8e6e0' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&family=Bebas+Neue&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes blink { 0%,80%,100%{opacity:0.2} 40%{opacity:1} }
        @media (max-width: 600px) {
          .hero-header { padding: 24px 20px !important; }
          .app-title { font-size: 32px !important; }
          .main-content { padding: 32px 16px !important; }
        }
      `}</style>

      <div className="hero-header" style={{ background: 'linear-gradient(135deg, #0b0c0f 0%, #111318 100%)', borderBottom: '1px solid #1e2028', padding: '36px 40px 32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: '52px', height: '52px', background: '#ff2d2d', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 24px rgba(255,45,45,0.4)' }}>
          <BugIcon />
        </div>
        <div>
          <div className="app-title" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '42px', letterSpacing: '3px', color: '#fff', lineHeight: 1 }}>BugSnap</div>
          <div style={{ fontSize: '12px', color: '#555', letterSpacing: '2px', textTransform: 'uppercase', marginTop: '4px' }}>AI-Powered Bug Report Generator</div>
        </div>
        <button onClick={clearApiKey} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#333', fontSize: '11px', cursor: 'pointer', fontFamily: "'DM Mono', monospace", letterSpacing: '1px' }}>
          Update API key
        </button>
      </div>

      <div className="main-content" style={{ maxWidth: '780px', margin: '0 auto', padding: '48px 24px' }}>
        <BugInput onGenerate={handleGenerate} loading={loading} />

        {error && (
          <div style={{ marginTop: '16px', padding: '14px 18px', background: 'rgba(255,45,45,0.06)', border: '1px solid rgba(255,45,45,0.2)', borderRadius: '8px', fontSize: '13px', color: '#ff6b6b' }}>
            {error}
            {isInvalidKey && (
              <button onClick={clearApiKey} style={{ marginLeft: '8px', background: 'none', border: 'none', color: '#ff2d2d', cursor: 'pointer', fontFamily: "'DM Mono', monospace", fontSize: '13px', textDecoration: 'underline' }}>
                Update it
              </button>
            )}
          </div>
        )}

        {report && <ReportCard report={report} />}

        <ReportHistory history={history} onSelect={r => { setReport(r); setError(''); setIsInvalidKey(false) }} onRemove={removeReport} onClear={clearHistory} />
      </div>
    </div>
  )
}
