'use client'

import { useGame } from '@/lib/game-context'
import { Card } from '@/components/ui/Card'
import { T, SUBJ, EXAM, START, TOTAL_D, ELAPSED, daysLeft } from '@/lib/constants'
import { MILESTONES, BADGES, getNoteEstimee } from '@/lib/gamification'

const noteColor = (n: number) => n >= 14 ? T.ok : n >= 10 ? T.wip : '#DC2626'

const EPREUVES = [
  { label: 'Oral',     date: EXAM.oral,     c: '#7C3AED' },
  { label: 'Français', date: EXAM.francais, c: '#BE185D' },
  { label: 'Hist+Sc.', date: EXAM.histoire, c: '#B45309' },
  { label: 'Maths',    date: EXAM.maths,    c: '#1D4ED8' },
]

export default function BrevetPage() {
  const { notions, game } = useGame()
  const tlPct = Math.min(100, ELAPSED / TOTAL_D * 100)

  return (
    <div style={{ padding: '16px 14px 110px' }}>
      <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'Sora,sans-serif', color: T.text, marginBottom: 4 }}>
        Tableau de bord
      </div>
      <div style={{ fontSize: 11, color: T.muted, marginBottom: 16 }}>Brevet DNB — 26 au 30 juin 2026</div>

      {/* J- cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginBottom: 14 }}>
        {EPREUVES.map(e => (
          <Card key={e.label} style={{ padding: '10px 6px', textAlign: 'center', borderTop: `3px solid ${e.c}` }}>
            <div style={{ fontSize: 20, fontWeight: 900, fontFamily: 'Sora,sans-serif', color: e.c }}>
              {daysLeft(e.date)}
            </div>
            <div style={{ fontSize: 9, color: T.muted, marginTop: 2, lineHeight: 1.3 }}>{e.label}</div>
          </Card>
        ))}
      </div>

      {/* Timeline */}
      <Card style={{ padding: '14px', marginBottom: 12 }}>
        <div style={{ fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
          Timeline
        </div>
        <div style={{ position: 'relative', marginBottom: 6 }}>
          <div style={{ background: T.border, borderRadius: 999, height: 10 }}>
            <div style={{ height: '100%', width: `${tlPct}%`, background: T.text, borderRadius: 999 }} />
          </div>
          {EPREUVES.map(e => {
            const p = Math.min(100, (e.date.getTime() - START.getTime()) / (EXAM.maths.getTime() - START.getTime()) * 100)
            return (
              <div key={e.label} style={{
                position: 'absolute', top: '50%', left: `${p}%`,
                transform: 'translate(-50%,-50%)',
                width: 16, height: 16, borderRadius: '50%',
                background: T.card, border: `2.5px solid ${e.c}`,
              }} />
            )
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: T.faint }}>
          <span>17 avr.</span><span>30 juin</span>
        </div>
        {EPREUVES.map((e, i) => (
          <div key={e.label} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '8px 0', borderBottom: i < EPREUVES.length - 1 ? `1px solid ${T.border}` : 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 9, height: 9, borderRadius: '50%', border: `2px solid ${e.c}` }} />
              <span style={{ fontSize: 13, color: T.text }}>{e.label}</span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 800, fontFamily: 'Sora,sans-serif', color: e.c }}>
              J-{daysLeft(e.date)}
            </span>
          </div>
        ))}
      </Card>

      {/* Notes simulées */}
      <Card style={{ padding: '14px', marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.text, marginBottom: 12 }}>Notes simulées brevet</div>
        {SUBJ.map((s, i) => {
          const n = getNoteEstimee(notions, s.id)
          return (
            <div key={s.id} style={{ padding: '9px 0', borderBottom: i < SUBJ.length - 1 ? `1px solid ${T.border}` : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: T.text }}>{s.e} {s.label}</span>
                <span style={{ fontSize: 14, fontWeight: 900, fontFamily: 'Sora,sans-serif', color: noteColor(n) }}>{n.toFixed(1)}/20</span>
              </div>
              <div style={{ background: T.border, borderRadius: 999, height: 7 }}>
                <div style={{ height: '100%', width: `${n / 20 * 100}%`, background: s.acc, borderRadius: 999, transition: 'width .4s' }} />
              </div>
            </div>
          )
        })}
      </Card>

      {/* Badges */}
      <Card style={{ padding: '14px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.text, marginBottom: 10 }}>Badges débloqués</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {BADGES.map(b => {
            const earned = game.badges.includes(b.id)
            return (
              <div key={b.id} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 10px', borderRadius: 20,
                background: earned ? '#F0FDF4' : T.bg,
                border: `1px solid ${earned ? T.okBorder : T.border}`,
                opacity: earned ? 1 : .45,
              }}>
                <span style={{ fontSize: 14 }}>{b.emoji}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: earned ? T.ok : T.muted }}>{b.name}</span>
              </div>
            )
          })}
        </div>
      </Card>

      <Card style={{ padding: 14, marginTop: 10, background: '#F5F3FF', border: '1px solid #DDD6FE', borderLeft: `3px solid ${T.xp}` }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#5B21B6', marginBottom: 6 }}>⚠️ Nouveautés DNB 2026</div>
        <div style={{ fontSize: 11, color: '#6D28D9', lineHeight: 1.8 }}>
          • 60% épreuves finales / 40% contrôle continu{'\n'}
          • CC = moyennes annuelles 3ème uniquement{'\n'}
          • «TB avec félicitations» si &gt; 18/20
        </div>
      </Card>
    </div>
  )
}
