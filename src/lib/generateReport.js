const SYSTEM_PROMPT = `You are a senior QA engineer. Given an informal bug description, generate a structured bug report in valid JSON only. No markdown, no backticks, no explanation — pure JSON.

Return this exact shape:
{
  "title": "Short clear bug title",
  "environment": {
    "browser": "e.g. Chrome 124 / Unknown",
    "device": "e.g. Mobile / Desktop / Unknown",
    "os": "e.g. iOS 17 / Windows 11 / Unknown"
  },
  "steps": ["Step 1", "Step 2", "Step 3"],
  "expected": "What should happen",
  "actual": "What actually happens",
  "severity": "Critical | High | Medium | Low",
  "tags": ["tag1", "tag2", "tag3"]
}`

async function callApi(inputText, apiKey) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: inputText }],
    }),
  })
  if (response.status === 401) throw new Error('INVALID_KEY')
  if (!response.ok) throw new Error('NETWORK_ERROR')
  const data = await response.json()
  const raw = data.content?.find(b => b.type === 'text')?.text ?? ''
  return JSON.parse(raw.replace(/```json|```/g, '').trim())
}

export async function generateReport(inputText, apiKey) {
  try {
    return await callApi(inputText, apiKey)
  } catch (err) {
    if (err.message === 'INVALID_KEY' || err.message === 'NETWORK_ERROR') throw err
    return await callApi(inputText, apiKey)
  }
}
