import { useState, useEffect } from 'react'
import { formatReport } from '../lib/formatReport'
import { colors, fontSize, radius } from '../theme'

const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
)

function CopyButton({ label, format, report }) {
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!copied) return
    const id = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(id)
  }, [copied])

  useEffect(() => {
    if (!error) return
    const id = setTimeout(() => setError(false), 2000)
    return () => clearTimeout(id)
  }, [error])

  function handleCopy() {
    navigator.clipboard.writeText(formatReport(report, format))
      .then(() => setCopied(true))
      .catch(() => setError(true))
  }

  return (
    <button
      onClick={handleCopy}
      style={{
        flex: 1, padding: '13px', background: 'transparent',
        border: `1px solid ${copied ? '#00c48c' : error ? colors.accent : colors.borderStrong}`,
        borderRadius: radius.md,
        color: copied ? '#00c48c' : error ? '#ff6b6b' : colors.textMuted,
        fontFamily: "'DM Mono', monospace", fontSize: fontSize.sm,
        cursor: 'pointer', display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: '8px', letterSpacing: '1px', transition: 'all 0.2s',
      }}
    >
      <CopyIcon />
      {copied ? 'COPIED!' : error ? 'FAILED' : label}
    </button>
  )
}

export default function ExportMenu({ report }) {
  return (
    <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
      <CopyButton label="COPY TEXT" format="text" report={report} />
      <CopyButton label="COPY MARKDOWN" format="markdown" report={report} />
    </div>
  )
}
