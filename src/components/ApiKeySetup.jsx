import { useState } from 'react'
import { colors, fontSize } from '../theme'

export default function ApiKeySetup({ onSave }) {
  const [key, setKey] = useState('')
  const [error, setError] = useState('')

  function handleSave() {
    if (!key.startsWith('sk-ant')) {
      setError('Invalid API key — must start with sk-ant')
      return
    }
    setError('')
    onSave(key.trim())
  }

  return (
    <div style={{
      minHeight: '100vh', background: colors.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Mono', 'Courier New', monospace", padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: '420px', textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔑</div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '28px', letterSpacing: '3px', color: '#fff', marginBottom: '8px' }}>
          CONNECT YOUR API KEY
        </div>
        <div style={{ fontSize: fontSize.md, color: colors.textMuted, marginBottom: '28px', lineHeight: '1.7' }}>
          BugSnap uses the Anthropic Claude API.<br />
          Your key is stored locally — never sent to us.
        </div>
        <input
          type="password"
          placeholder="sk-ant-api03-..."
          value={key}
          onChange={e => { setKey(e.target.value); setError('') }}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
          style={{
            width: '100%', background: colors.surface,
            border: `1px solid ${error ? colors.accent : colors.border}`,
            borderRadius: '8px', padding: '14px', color: colors.textPrimary,
            fontFamily: 'inherit', fontSize: fontSize.base, marginBottom: '8px', outline: 'none',
          }}
        />
        {error && (
          <div style={{ color: '#ff6b6b', fontSize: fontSize.sm, marginBottom: '12px', textAlign: 'left' }}>
            {error}
          </div>
        )}
        <button
          onClick={handleSave}
          disabled={!key.trim()}
          style={{
            width: '100%', padding: '14px',
            background: key.trim() ? colors.accent : colors.border,
            color: '#fff', border: 'none', borderRadius: '8px',
            fontFamily: "'Bebas Neue', sans-serif", fontSize: '18px',
            letterSpacing: '3px', cursor: key.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          SAVE &amp; CONTINUE
        </button>
        <div style={{ marginTop: '16px', fontSize: fontSize.sm, color: colors.textMuted }}>
          Get your key at console.anthropic.com
        </div>
      </div>
    </div>
  )
}
