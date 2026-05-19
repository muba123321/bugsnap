import { useState, useEffect } from 'react'
import { colors, fontSize } from '../theme'

const STORAGE_KEY = 'bugsnap_onboarded'

const steps = [
  {
    emoji: '🔑',
    title: 'Get Your API Key',
    description: 'Go to console.anthropic.com, sign up for free, and create an API key. Paste it into BugSnap — it stays on your device, never sent to us.',
  },
  {
    emoji: '🐛',
    title: 'Describe Your Bug',
    description: 'Type your bug description in plain English — messy is totally fine. No need to format anything. Just explain what went wrong.',
  },
  {
    emoji: '⚡',
    title: 'Get Your Report',
    description: 'BugSnap instantly generates a clean, structured bug report with steps, severity, environment, and tags. Copy it as Text or Markdown.',
  },
]

export function useOnboarding() {
  const [show, setShow] = useState(() => !localStorage.getItem(STORAGE_KEY))

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, 'true')
    setShow(false)
  }

  function reopen() {
    setShow(true)
  }

  return { show, dismiss, reopen }
}

export default function OnboardingModal({ onDismiss }) {
  const [step, setStep] = useState(0)
  const isLast = step === steps.length - 1

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onDismiss()
      if (e.key === 'ArrowRight' && !isLast) setStep(s => s + 1)
      if (e.key === 'ArrowLeft' && step > 0) setStep(s => s - 1)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [step, isLast, onDismiss])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
      fontFamily: "'DM Mono', 'Courier New', monospace",
      animation: 'fadeIn 0.2s ease',
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>

      <div style={{
        width: '100%', maxWidth: '480px',
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: '16px',
        overflow: 'hidden',
        animation: 'slideUp 0.3s ease',
      }}>
        <div style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: colors.surfaceHigh,
        }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '20px', letterSpacing: '3px', color: '#fff' }}>
            HOW IT WORKS
          </div>
          <button onClick={onDismiss} style={{
            background: 'none', border: 'none', color: colors.textMuted,
            fontSize: '18px', cursor: 'pointer', lineHeight: 1,
          }}>✕</button>
        </div>

        <div style={{ padding: '36px 32px', textAlign: 'center', minHeight: '220px' }}>
          <div style={{ fontSize: '52px', marginBottom: '16px' }}>{steps[step].emoji}</div>
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '22px', letterSpacing: '2px', color: '#fff',
            marginBottom: '12px',
          }}>
            {steps[step].title}
          </div>
          <div style={{ fontSize: fontSize.sm, color: colors.textMuted, lineHeight: '1.8', maxWidth: '340px', margin: '0 auto' }}>
            {steps[step].description}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', paddingBottom: '8px' }}>
          {steps.map((_, i) => (
            <div
              key={i}
              onClick={() => setStep(i)}
              style={{
                width: i === step ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: i === step ? colors.accent : colors.borderStrong,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>

        <div style={{ padding: '16px 24px 24px', display: 'flex', gap: '10px' }}>
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              style={{
                flex: 1, padding: '13px',
                background: 'transparent',
                border: `1px solid ${colors.borderStrong}`,
                borderRadius: '8px', color: colors.textMuted,
                fontFamily: "'DM Mono', monospace",
                fontSize: fontSize.sm, letterSpacing: '1px',
                cursor: 'pointer',
              }}
            >
              ← BACK
            </button>
          )}
          <button
            onClick={isLast ? onDismiss : () => setStep(s => s + 1)}
            style={{
              flex: 2, padding: '13px',
              background: colors.accent,
              border: 'none',
              borderRadius: '8px', color: '#fff',
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '16px', letterSpacing: '2px',
              cursor: 'pointer',
            }}
          >
            {isLast ? "LET'S GO →" : 'NEXT →'}
          </button>
        </div>
      </div>
    </div>
  )
}
