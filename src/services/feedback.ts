export type FeedbackVote = 'positive' | 'negative'

const API_BASES = [
  (import.meta as { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL,
  '/api',
  'http://localhost:8080/api',
].filter((v, i, a): v is string => Boolean(v) && a.indexOf(v) === i)

export async function sendFeedback(
  responseId: string,
  sessionId: string | undefined,
  vote: FeedbackVote,
): Promise<boolean> {
  for (const base of API_BASES) {
    try {
      const res = await fetch(`${base}/v1/chat/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responseId, sessionId, vote }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return true
    } catch {
      continue
    }
  }
  return false
}
