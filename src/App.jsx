import { useState } from 'react'
import { generateReport } from './lib/generateReport'
import { useApiKey } from './hooks/useApiKey'
import { useReportHistory } from './hooks/useReportHistory'
import ApiKeySetup from './components/ApiKeySetup'
import BugInput from './components/BugInput'
import ReportCard from './components/ReportCard'
import ReportHistory from './components/ReportHistory'
import OnboardingModal, { useOnboarding } from './components/OnboardingModal'
import { colors, fontSize } from './theme'

const BugIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 2l1.88 1.88M14.12 3.88 16 2M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/>
    <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6z"/>
    <path d="M12 20v-9M6.53 9C4.6 8.8 3 7.1 3 5M6 13H2M3 21c0-2.1 1.7-3.9 3.8-4M20.97 5c0 2.1-1.6 3.8-3.5 4M22 13h-4M17.2 17c2.1.1 3.8 1.9 3.8 4"/>
  </svg>
)

const howItWorksSteps = [
  { emoji: '🔑', title: 'Get API Key', desc: 'Grab a free key from console.anthropic.com' },
  { emoji: '🐛', title: 'Describe the Bug', desc: 'Type it out in plain English — messy is fine' },
  { emoji: '⚡', title: 'Get Your Report', desc: 'Copy as Text or Markdown and paste anywhere' },
]

export default function App() {
  const { apiKey, setApiKey, clearApiKey } = useApiKey()
  const { history, addReport, removeReport, clearHistory } = useReportHistory()
  const { show: showOnboarding, dismiss: dismissOnboarding, reopen: reopenOnboarding } = useOnboarding()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isInvalidKey, setIsInvalidKey] = useState(false)

  if (!apiKey) return (
    <>
      {showOnboarding && <OnboardingModal onDismiss={dismissOnboarding} />}
      <ApiKeySetup onSave={setApiKey} />
    </>
  )

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
        const detail = err.message?.startsWith('NETWORK_ERROR:')
          ? err.message.replace('NETWORK_ERROR: ', '')
          : 'Something went wrong. Please try again.'
        setError(detail)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, fontFamily: "'DM Mono', 'Courier New', monospace", color: colors.textPrimary }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&family=Bebas+Neue&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes blink { 0%,80%,100%{opacity:0.2} 40%{opacity:1} }
        @media (max-width: 600px) {
          .hero-header { padding: 24px 20px !important; }
          .app-title { font-size: 32px !important; }
          .main-content { padding: 32px 16px !important; }
          .how-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {showOnboarding && <OnboardingModal onDismiss={dismissOnboarding} />}

      <div className="hero-header" style={{ background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.surface} 100%)`, borderBottom: `1px solid ${colors.border}`, padding: '36px 40px 32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: '52px', height: '52px', background: colors.accent, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 24px rgba(255,45,45,0.4)' }}>
          <BugIcon />
        </div>
        <div>
          <div className="app-title" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '42px', letterSpacing: '3px', color: '#fff', lineHeight: 1 }}>BugSnap</div>
          <div style={{ fontSize: fontSize.xs, color: colors.textMuted, letterSpacing: '2px', textTransform: 'uppercase', marginTop: '4px' }}>AI-Powered Bug Report Generator</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={reopenOnboarding}
            title="How it works"
            style={{
              width: '32px', height: '32px',
              background: colors.surface, border: `1px solid ${colors.borderStrong}`,
              borderRadius: '50%', color: colors.textMuted,
              fontSize: fontSize.sm, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >?</button>
          <button onClick={clearApiKey} style={{ background: 'none', border: 'none', color: colors.textMuted, fontSize: fontSize.xs, cursor: 'pointer', fontFamily: "'DM Mono', monospace", letterSpacing: '1px' }}>
            Update API key
          </button>
        </div>
      </div>

      <div style={{ borderBottom: `1px solid ${colors.border}`, background: colors.surfaceHigh, padding: '20px 40px' }}>
        <div className="how-grid" style={{ maxWidth: '780px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {howItWorksSteps.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', background: colors.surface, border: `1px solid ${colors.borderStrong}`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                {s.emoji}
              </div>
              <div>
                <div style={{ fontSize: fontSize.xs, color: colors.accent, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '2px' }}>
                  Step {i + 1} — {s.title}
                </div>
                <div style={{ fontSize: fontSize.sm, color: colors.textMuted, lineHeight: '1.5' }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="main-content" style={{ maxWidth: '780px', margin: '0 auto', padding: '48px 24px' }}>
        <BugInput onGenerate={handleGenerate} loading={loading} />

        {error && (
          <div style={{ marginTop: '16px', padding: '14px 18px', background: 'rgba(255,45,45,0.06)', border: '1px solid rgba(255,45,45,0.2)', borderRadius: '8px', fontSize: fontSize.md, color: '#ff6b6b' }}>
            {error}
            {isInvalidKey && (
              <button onClick={clearApiKey} style={{ marginLeft: '8px', background: 'none', border: 'none', color: colors.accent, cursor: 'pointer', fontFamily: "'DM Mono', monospace", fontSize: fontSize.md, textDecoration: 'underline' }}>
                Update it
              </button>
            )}
          </div>
        )}

        {report && <ReportCard report={report} />}

        <ReportHistory
          history={history}
          onSelect={r => { setReport(r); setError(''); setIsInvalidKey(false) }}
          onRemove={removeReport}
          onClear={clearHistory}
        />
      </div>
    </div>
  )
}
