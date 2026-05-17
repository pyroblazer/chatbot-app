import { parseNLPMeta } from '@/lib/langchain/nlp'

describe('parseNLPMeta', () => {
  const validMeta = {
    intent: 'question',
    sentiment: { label: 'positive', score: 0.85 },
    entities: [{ text: 'Paris', type: 'PLACE' }],
  }

  it('strips NLP_META comment from text', () => {
    const raw = `Hello world\n<!-- NLP_META: ${JSON.stringify(validMeta)} -->`
    const { text } = parseNLPMeta(raw)
    expect(text).toBe('Hello world')
    expect(text).not.toContain('NLP_META')
  })

  it('returns parsed NLP result', () => {
    const raw = `Answer\n<!-- NLP_META: ${JSON.stringify(validMeta)} -->`
    const { nlp } = parseNLPMeta(raw)
    expect(nlp).not.toBeNull()
    expect(nlp!.intent).toBe('question')
    expect(nlp!.sentiment.label).toBe('positive')
    expect(nlp!.sentiment.score).toBe(0.85)
    expect(nlp!.entities).toHaveLength(1)
    expect(nlp!.entities[0].text).toBe('Paris')
    expect(nlp!.entities[0].type).toBe('PLACE')
  })

  it('returns null nlp when no meta comment present', () => {
    const { text, nlp } = parseNLPMeta('Just some text with no metadata')
    expect(text).toBe('Just some text with no metadata')
    expect(nlp).toBeNull()
  })

  it('handles malformed JSON gracefully', () => {
    const raw = 'Answer <!-- NLP_META: {broken json} -->'
    const { text, nlp } = parseNLPMeta(raw)
    expect(nlp).toBeNull()
    expect(text).toBe('Answer')
  })

  it('handles empty entities array', () => {
    const meta = { intent: 'greeting', sentiment: { label: 'positive', score: 0.9 }, entities: [] }
    const raw = `Hi! <!-- NLP_META: ${JSON.stringify(meta)} -->`
    const { nlp } = parseNLPMeta(raw)
    expect(nlp!.entities).toHaveLength(0)
  })

  it('defaults missing fields gracefully', () => {
    const raw = `Response <!-- NLP_META: {} -->`
    const { nlp } = parseNLPMeta(raw)
    expect(nlp!.intent).toBe('other')
    expect(nlp!.sentiment.label).toBe('neutral')
    expect(nlp!.entities).toHaveLength(0)
  })
})
