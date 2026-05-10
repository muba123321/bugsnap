import { useState } from 'react'

const SparkleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.88 5.47L19 10l-5.12 1.53L12 17l-1.88-5.47L5 10l5.12-1.53L12 3z"/>
    <path d="M5 3l.88 2.47L8 6l-2.12.53L5 9l-.88-2.47L2 6l2.12-.53L5 3z"/>
    <path d="M19 15l.88 2.47L22 18l-2.12.53L19 21l-.88-2.47L16 18l2.12-.53L19 15z"/>
  </svg>
)

export default function BugInput({ onGenerate, loading }) {
  const [input, setInput] = useState('')

  return (
    <div>
      <label style={{ display: 'block', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: '#555', marginBottom: '12px' }}>
        Describe the bug (messy is fine)
      </label>
      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        disabled={loading}
        placeholder={`e.g. "the login button doesn't work on mobile after password reset..."`}
        style={{
          width: '100%', minHeight: '140px', background: '#111318',
          border: '1px solid #1e2028', borderRadius: '10px', padding: '18px',
          color: '#e8e6e0', fontFamily: "'DM Mono', monospace", fontSize: '14px',
          resize: 'vertical', outline: 'none', lineHeight: '1.7',
        }}
      />
      <button
        onClick={() => input.trim() && onGenerate(input)}
        disabled={loading || !input.trim()}
        style={{
          marginTop: '16px', width: '100%', padding: '16px', background: '#ff2d2d',
          color: '#fff', border: 'none', borderRadius: '10px',
          fontFamily: "'Bebas Neue', sans-serif", fontSize: '20px', letterSpacing: '3px',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '10px', opacity: (loading || !input.trim()) ? 0.5 : 1, transition: 'all 0.2s',
        }}
      >
        {loading ? (
          <span>
            <span style={{ animation: 'blink 1.2s infinite' }}>●</span>
            <span style={{ animation: 'blink 1.2s infinite', animationDelay: '0.2s' }}>●</span>
            <span style={{ animation: 'blink 1.2s infinite', animationDelay: '0.4s' }}>●</span>
          </span>
        ) : (
          <><SparkleIcon /> GENERATE REPORT</>
        )}
      </button>
    </div>
  )
}
