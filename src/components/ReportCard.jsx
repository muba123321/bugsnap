import ExportMenu from './ExportMenu'
import { colors, fontSize } from '../theme'

const SEVERITY_COLORS = {
  Critical: { bg: '#ff2d2d', text: '#fff' },
  High:     { bg: '#ff6b00', text: '#fff' },
  Medium:   { bg: '#f5c400', text: '#1a1a1a' },
  Low:      { bg: '#00c48c', text: '#fff' },
}

const sectionLabel = {
  fontSize: fontSize.xs, letterSpacing: '2.5px', textTransform: 'uppercase',
  color: colors.accent, marginBottom: '10px',
}

export default function ReportCard({ report }) {
  const severityColor = SEVERITY_COLORS[report.severity] ?? { bg: '#333', text: '#fff' }

  return (
    <div style={{ marginTop: '40px', background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '14px', overflow: 'hidden', animation: 'slideUp 0.4s ease' }}>
      <div style={{ padding: '20px 24px', borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', background: colors.surfaceHigh }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '22px', letterSpacing: '1.5px', color: colors.textPrimary, lineHeight: '1.2', flex: 1 }}>
          {report.title}
        </div>
        <div role="status" aria-label={`Severity: ${report.severity}`} style={{ padding: '5px 12px', borderRadius: '6px', fontSize: fontSize.xs, fontWeight: 500, letterSpacing: '1.5px', textTransform: 'uppercase', flexShrink: 0, background: severityColor.bg, color: severityColor.text }}>
          {report.severity}
        </div>
      </div>

      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <div style={sectionLabel}>Environment</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {Object.entries(report.environment).map(([k, v]) => (
              <div key={k} style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: '8px', padding: '12px' }}>
                <div style={{ fontSize: fontSize.xs, color: colors.textMuted, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '4px' }}>{k}</div>
                <div style={{ fontSize: fontSize.md, color: colors.textSecondary }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={sectionLabel}>Steps to Reproduce</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {report.steps.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '24px', height: '24px', background: colors.border, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: fontSize.xs, color: colors.accent, flexShrink: 0, marginTop: '1px' }}>
                  {i + 1}
                </div>
                <div style={{ fontSize: fontSize.md, color: colors.textSecondary, lineHeight: '1.6' }}>{step}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {[['Expected', report.expected], ['Actual', report.actual]].map(([label, text]) => (
            <div key={label}>
              <div style={sectionLabel}>{label}</div>
              <div style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: '8px', padding: '14px 16px', fontSize: fontSize.md, color: colors.textSecondary, lineHeight: '1.6' }}>
                {text}
              </div>
            </div>
          ))}
        </div>

        <div>
          <div style={sectionLabel}>Tags</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {report.tags.map(tag => (
              <div key={tag} style={{ background: colors.surfaceHigh, border: `1px solid ${colors.borderStrong}`, borderRadius: '6px', padding: '5px 12px', fontSize: fontSize.sm, color: colors.textMuted, letterSpacing: '0.5px' }}>
                #{tag}
              </div>
            ))}
          </div>
        </div>

        <ExportMenu report={report} />
      </div>
    </div>
  )
}
