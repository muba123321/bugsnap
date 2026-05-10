import { useState } from 'react'

export default function ApiKeySetup({ onSave }) {
  const [key, setKey] = useState('')
  const [error, setError] = useState('')

  function handleSave() {
    if (!key.startsWith('sk-ant')) {
      setError('Invalid API key — must start with sk-ant')
      return
    }
    setError('')
    onSave(key)
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0b0c0f',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Mono', 'Courier New', monospace", padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: '420px', textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔑</div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '28px', letterSpacing: '3px', color: '#fff', marginBottom: '8px' }}>
          CONNECT YOUR API KEY
        </div>
        <div style={{ fontSize: '13px', color: '#555', marginBottom: '28px', lineHeight: '1.7' }}>
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
            width: '100%', background: '#111318',
            border: `1px solid ${error ? '#ff2d2d' : '#1e2028'}`,
            borderRadius: '8px', padding: '14px', color: '#e8e6e0',
            fontFamily: 'inherit', fontSize: '14px', marginBottom: '8px', outline: 'none',
          }}
        />
        {error && (
          <div style={{ color: '#ff6b6b', fontSize: '13px', marginBottom: '12px', textAlign: 'left' }}>
            {error}
          </div>
        )}
        <button
          onClick={handleSave}
          disabled={!key.trim()}
          style={{
            width: '100%', padding: '14px',
            background: key.trim() ? '#ff2d2d' : '#2a2d38',
            color: '#fff', border: 'none', borderRadius: '8px',
            fontFamily: "'Bebas Neue', sans-serif", fontSize: '18px',
            letterSpacing: '3px', cursor: key.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          SAVE &amp; CONTINUE
        </button>
        <div style={{ marginTop: '16px', fontSize: '11px', color: '#333' }}>
          Get your key at console.anthropic.com
        </div>
      </div>
    </div>
  )
}
