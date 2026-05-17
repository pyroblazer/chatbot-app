import type { NLPResult, IntentLabel, SentimentLabel, EntityType } from '@/types/chat'

// Flexible regex: handles --> or just > at end, and nested braces
export const NLP_META_REGEX = /<!--\s*NLP_META:\s*(\{[\s\S]*?\})\s*-*>/

export function parseNLPMeta(raw: string): { text: string; nlp: NLPResult | null } {
  const match = raw.match(NLP_META_REGEX)
  // Strip the comment (and any trailing whitespace) from display text
  const text = raw.replace(NLP_META_REGEX, '').replace(/\s+$/, '').trim()

  if (!match) return { text, nlp: null }

  try {
    const parsed = JSON.parse(match[1])
    const nlp: NLPResult = {
      intent: (parsed.intent as IntentLabel) ?? 'other',
      sentiment: {
        label: (parsed.sentiment?.label as SentimentLabel) ?? 'neutral',
        score: typeof parsed.sentiment?.score === 'number' ? parsed.sentiment.score : 0.5,
      },
      entities: Array.isArray(parsed.entities)
        ? parsed.entities.map((e: { text: string; type: string }) => ({
            text: String(e.text ?? ''),
            type: (e.type as EntityType) ?? 'CONCEPT',
          }))
        : [],
    }
    return { text, nlp }
  } catch {
    return { text, nlp: null }
  }
}

export function buildNLPInstruction(): string {
  // {{ and }} are escaped so LangChain does not treat them as template variables.
  return `
At the very end of EVERY response, on its own line, append exactly this comment (fill in your analysis):
<!-- NLP_META: {{"intent":"<intent>","sentiment":{{"label":"<label>","score":<0.0-1.0>}},"entities":[{{"text":"<entity>","type":"<TYPE>"}}]}} -->

Rules:
- intent: one of question, complaint, request, greeting, farewell, recommendation_request, other
- sentiment label: one of positive, neutral, negative
- entity types: one of PERSON, PLACE, DATE, PRODUCT, CONCEPT
- entities: all named entities found in the user message; empty array [] if none
- The comment MUST end with " -->" (space, dash, dash, greater-than)
- Do NOT explain or mention this metadata to the user`.trim()
}
