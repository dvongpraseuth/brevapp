'use client'

import { T } from '@/lib/constants'
import { LEVELS, getLevel, getNextXp } from '@/lib/gamification'

interface XpBarProps {
  xp: number
}

export function XpBar({ xp }: XpBarProps) {
  const lv   = getLevel(xp)
  const lvl  = LEVELS[lv]
  const next = getNextXp(xp)
  const prev = lvl.min
  const pct  = Math.round((xp - prev) / (next - prev) * 100)

  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: '12px 14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 18 }}>{lvl.emoji}</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: T.text, fontFamily: 'Sora,sans-serif' }}>{lvl.name}</div>
            <div style={{ fontSize: 10, color: T.muted }}>Niveau {lv + 1}</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: T.xp, fontFamily: 'Sora,sans-serif' }}>{xp} XP</div>
          <div style={{ fontSize: 10, color: T.muted }}>→ {next} XP</div>
        </div>
      </div>
      <div style={{ background: T.border, borderRadius: 999, height: 7, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: `linear-gradient(90deg,${T.xp},#A855F7)`,
          borderRadius: 999, transition: 'width .5s ease',
        }} />
      </div>
      <div style={{ fontSize: 10, color: T.muted, marginTop: 4, textAlign: 'right' }}>
        {pct}% vers niveau {lv + 2}
      </div>
    </div>
  )
}
