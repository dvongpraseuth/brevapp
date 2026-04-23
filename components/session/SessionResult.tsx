'use client'

import { T } from '@/lib/constants'
import { Card } from '@/components/ui/Card'

interface SessionResultProps {
  score: { ok: number; flou: number; non: number }
  total: number
  onRestart: () => void
}

export function SessionResult({ score, total, onRestart }: SessionResultProps) {
  const pctOk    = Math.round(score.ok / total * 100)
  const xpEarned = score.ok * 30 + score.flou * 10 + 50

  return (
    <div style={{ padding: '24px 14px 110px', textAlign: 'center' }}>
      <div style={{ fontSize: 52, marginBottom: 12 }}>
        {pctOk >= 80 ? '🔥' : pctOk >= 50 ? '💪' : '📚'}
      </div>
      <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'Sora,sans-serif', color: T.text }}>
        {pctOk}%
      </div>
      <div style={{ fontSize: 13, color: T.muted, marginBottom: 20 }}>
        {pctOk >= 80 ? 'Excellent !' : pctOk >= 50 ? 'Continue comme ça !' : 'Revois ces notions demain.'}
      </div>

      <Card style={{ padding: '14px 20px', marginBottom: 14, display: 'flex', justifyContent: 'space-around' }}>
        {([
          [score.ok,   T.ok,   '✅ Su'],
          [score.flou, T.wip,  '🤔 Flou'],
          [score.non,  T.none, '❌ Pas su'],
        ] as const).map(([v, c, l]) => (
          <div key={l}>
            <div style={{ fontSize: 26, fontWeight: 900, color: c, fontFamily: 'Sora,sans-serif' }}>{v}</div>
            <div style={{ fontSize: 11, color: T.muted }}>{l}</div>
          </div>
        ))}
      </Card>

      <div style={{
        background: '#F5F3FF', border: '1px solid #DDD6FE',
        borderRadius: 12, padding: '12px 16px', marginBottom: 16,
      }}>
        <div style={{ fontSize: 16, fontWeight: 900, color: T.xp, fontFamily: 'Sora,sans-serif' }}>
          +{xpEarned} XP gagnés ⚡
        </div>
        <div style={{ fontSize: 11, color: '#6D28D9' }}>
          Session complète +50 · Su ×{score.ok} · Flou ×{score.flou}
        </div>
      </div>

      <button
        onClick={onRestart}
        style={{
          width: '100%', padding: 14, borderRadius: 12,
          border: `1.5px solid ${T.border}`, background: T.card,
          color: T.text, fontSize: 14, fontWeight: 700, cursor: 'pointer',
        }}
      >
        Recommencer
      </button>
    </div>
  )
}
