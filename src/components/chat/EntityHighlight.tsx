'use client'

import type { Entity } from '@/types/chat'
import { ENTITY_COLORS } from '@/constants/colors'

interface Props {
  text: string
  entities: Entity[]
}

export default function EntityHighlight({ text, entities }: Props) {
  if (!entities.length) return <span>{text}</span>

  const parts: { text: string; entity?: Entity }[] = []
  let remaining = text

  const sorted = [...entities].sort((a, b) => {
    const ai = remaining.indexOf(a.text)
    const bi = remaining.indexOf(b.text)
    return ai - bi
  })

  for (const entity of sorted) {
    const idx = remaining.indexOf(entity.text)
    if (idx === -1) continue
    if (idx > 0) parts.push({ text: remaining.slice(0, idx) })
    parts.push({ text: entity.text, entity })
    remaining = remaining.slice(idx + entity.text.length)
  }
  if (remaining) parts.push({ text: remaining })

  return (
    <>
      {parts.map((part, i) =>
        part.entity ? (
          <mark
            key={i}
            title={part.entity.type}
            className="rounded px-0.5 font-medium not-italic"
            style={{
              backgroundColor: `${ENTITY_COLORS[part.entity.type] ?? '#ffd700'}28`,
              color: ENTITY_COLORS[part.entity.type] ?? '#ffd700',
              borderBottom: `1px solid ${ENTITY_COLORS[part.entity.type] ?? '#ffd700'}`,
            }}
          >
            {part.text}
          </mark>
        ) : (
          <span key={i}>{part.text}</span>
        )
      )}
    </>
  )
}
