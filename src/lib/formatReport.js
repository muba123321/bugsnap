export function formatReport(report, format) {
  if (format === 'text') return formatAsText(report)
  if (format === 'markdown') return formatAsMarkdown(report)
  throw new Error(`Unknown format: ${format}`)
}

function formatAsText(report) {
  return `BUG REPORT — ${report.title}
${'─'.repeat(50)}

SEVERITY: ${report.severity}
TAGS: ${report.tags.join(', ')}

ENVIRONMENT
  Browser : ${report.environment.browser}
  Device  : ${report.environment.device}
  OS      : ${report.environment.os}

STEPS TO REPRODUCE
${report.steps.map((s, i) => `  ${i + 1}. ${s}`).join('\n')}

EXPECTED BEHAVIOR
  ${report.expected}

ACTUAL BEHAVIOR
  ${report.actual}`.trim()
}

function formatAsMarkdown(report) {
  const tags = report.tags.map(t => `\`${t}\``).join(' ')
  const steps = report.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')
  return `## 🐛 ${report.title}

**Severity:** ${report.severity}
**Tags:** ${tags}

### Environment

| Key | Value |
|---|---|
| Browser | ${report.environment.browser} |
| Device | ${report.environment.device} |
| OS | ${report.environment.os} |

### Steps to Reproduce

${steps}

### Expected Behavior

${report.expected}

### Actual Behavior

${report.actual}`.trim()
}
