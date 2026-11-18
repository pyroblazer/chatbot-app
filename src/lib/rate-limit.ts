/**
 * Minimal in-memory sliding-window rate limiter for the LLM routes.
 * Per-instance only: on serverless it limits bursts per warm instance; use a shared store
 * (e.g. Upstash Ratelimit) if strict global limits are needed.
 */
const hits = new Map<string, number[]>()

export function rateLimit(key: string, limit = 20, windowMs = 60_000): boolean {
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs)
  if (recent.length >= limit) {
    hits.set(key, recent)
    return false
  }
  recent.push(now)
  hits.set(key, recent)
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.every((t) => now - t >= windowMs)) hits.delete(k)
  }
  return true
}

export function clientKey(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for')
  return fwd?.split(',')[0]?.trim() || 'local'
}

/** Keeps only well-formed {role, content} messages, bounded in count and size. */
export function cleanMessages(
  input: unknown,
  maxMessages = 40,
  maxChars = 4000
): { role: 'user' | 'assistant'; content: string }[] {
  if (!Array.isArray(input)) return []
  return input
    .filter(
      (m): m is { role: 'user' | 'assistant'; content: string } =>
        !!m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string'
    )
    .slice(-maxMessages)
    .map((m) => ({ role: m.role, content: m.content.slice(0, maxChars) }))
}
