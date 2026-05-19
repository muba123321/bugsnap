import { useState } from 'react'
import { colors, fontSize } from '../theme'

const SEVERITY_COLORS = {
  Critical: '#ff2d2d', High: '#ff6b00', Medium: '#f5c400', Low: '#00c48c',
}

function formatDate(timestamp) {
  const diffMins = Math.floor((Date.now() - timestamp) / 60000)
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHrs = Math.floor(diffMins / 60)
  if (diffHrs < 24) return `${diffHrs}h ago`
  return new Date(timestamp).toLocaleDateString()
}

export default function ReportHistory({ history, onSelect, onRemove, onClear }) {
  const [collapsed, setCollapsed] = useState(false)

  if (history.length === 0) return null

  return (
    <div style={{ marginTop: '24px', background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: collapsed ? 'none' : `1px solid ${colors.border}` }}>
        <div style={{ fontSize: fontSize.xs, letterSpacing: '2px', color: colors.textMuted, textTransform: 'uppercase', fontFamily: "'DM Mono', monospace" }}>
          Recent Reports ({history.length})
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button onClick={onClear} aria-label="clear all" style={{ background: 'none', border: 'none', color: colors.textMuted, fontSize: fontSize.sm, cursor: 'pointer', fontFamily: "'DM Mono', monospace", letterSpacing: '1px' }}>
            Clear all
          </button>
          <button onClick={() => setCollapsed(c => !c)} aria-label={collapsed ? 'expand' : 'collapse'} style={{ background: 'none', border: 'none', color: colors.textMuted, fontSize: fontSize.sm, cursor: 'pointer' }}>
            {collapsed ? '▼' : '▲'}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div style={{ padding: '12px 20px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {history.map(entry => (
            <div key={entry.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '8px', padding: '10px 12px' }}>
              <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => onSelect(entry.report)}>
                <div style={{ fontSize: fontSize.xs, color: SEVERITY_COLORS[entry.severity] ?? colors.textMuted, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '3px' }}>
                  {entry.severity}
                </div>
                <div style={{ fontSize: fontSize.md, color: colors.textSecondary, lineHeight: '1.4' }}>{entry.title}</div>
                <div style={{ fontSize: fontSize.xs, color: colors.textMuted, marginTop: '4px' }}>{formatDate(entry.timestamp)}</div>
              </div>
              <button onClick={() => onRemove(entry.id)} aria-label="delete" style={{ background: 'none', border: 'none', color: colors.textMuted, fontSize: '14px', cursor: 'pointer', padding: '0 2px', lineHeight: 1, flexShrink: 0 }}>
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
