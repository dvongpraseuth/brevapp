'use client'

import { T } from '@/lib/constants'
import { Ring } from '@/components/game/Ring'
import { Card } from '@/components/ui/Card'
import type { Notion } from '@/lib/types'
import type { DynQuestion } from '@/app/(app)/session/page'

interface QuestionCardProps {
  question:     DynQuestion
  notion:       Notion | undefined
  idx:          number
  total:        number
  answerStreak: number
  shown:        boolean
  onShow:       () => void
  onAnswer:     (res: 'ok' | 'flou' | 'non') => void
}

export function QuestionCard({
  question, notion, idx, total, answerStreak, shown, onShow, onAnswer,
}: QuestionCardProps) {
  return (
    <div style={{ padding: '16px 14px 110px' }}>
      {/* Barre de progression */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ flex: 1, background: T.border, borderRadius: 999, height: 5 }}>
          <div style={{
            height: '100%', width: `${idx / total * 100}%`,
            background: T.text, borderRadius: 999, transition: 'width .3s',
          }} />
        </div>
        <span style={{ fontSize: 11, color: T.muted, flexShrink: 0 }}>{idx + 1}/{total}</span>
        {answerStreak >= 3 && <span style={{ fontSize: 12 }}>🔥{answerStreak}</span>}
      </div>

      {notion && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <Ring st={notion.st} size={12} />
          <span style={{ fontSize: 11, color: T.muted }}>{notion.dom} · {notion.label}</span>
        </div>
      )}

      <Card style={{ padding: 22, minHeight: 210, marginBottom: 14, borderTop: `3px solid ${T.text}` }}>
        <div style={{ fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 12 }}>
          Question
        </div>
        <div style={{
          fontSize: 17, fontWeight: 700, fontFamily: 'Sora,sans-serif',
          color: T.text, lineHeight: 1.55, whiteSpace: 'pre-line',
        }}>
          {question.question}
        </div>

        {shown && (
          <>
            <div style={{ marginTop: 18, paddingTop: 18, borderTop: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 10, color: T.ok, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10 }}>
                ✓ Réponse
              </div>
              <div style={{
                fontSize: 14, color: T.text, whiteSpace: 'pre-line',
                lineHeight: 1.7, fontFamily: 'Sora,sans-serif',
              }}>
                {question.reponse}
              </div>
            </div>
            {question.conseil ? (
              <div style={{
                marginTop: 14, padding: '10px 14px', borderRadius: 10,
                background: T.wipBg, border: `1px solid ${T.wipBorder}`,
              }}>
                <span style={{ fontSize: 11, color: T.wip }}>💡 {question.conseil}</span>
              </div>
            ) : null}
          </>
        )}
      </Card>

      {!shown ? (
        <button
          onClick={onShow}
          style={{
            width: '100%', padding: 14, borderRadius: 12,
            border: `2px solid ${T.border}`, background: T.card,
            color: T.text, fontSize: 14, fontWeight: 700, cursor: 'pointer',
          }}
        >
          Voir la réponse
        </button>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {([
            ['non',  '#FEF2F2', '#DC2626', '#991B1B', '❌ Pas su'],
            ['flou', '#FFFBEB', '#D97706', '#92400E', '🤔 Flou'],
            ['ok',   '#F0FDF4', '#16A34A', '#166534', '✅ Su !'],
          ] as const).map(([k, bg, brdC, tc, l]) => (
            <button
              key={k}
              onClick={() => onAnswer(k)}
              style={{
                padding: '12px 6px', borderRadius: 12,
                border: `2px solid ${brdC}40`, background: bg,
                color: tc, fontSize: 12, fontWeight: 800,
                cursor: 'pointer', fontFamily: 'Sora,sans-serif',
              }}
            >{l}</button>
          ))}
        </div>
      )}
    </div>
  )
}
