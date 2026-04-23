'use client'

import { useGame } from '@/lib/game-context'
import { XpBar } from '@/components/game/XpBar'
import { Ring } from '@/components/game/Ring'
import { Card } from '@/components/ui/Card'
import { T, SUBJ, EXAM, daysLeft } from '@/lib/constants'
import { MILESTONES, getNoteEstimee, getEarnedEuros } from '@/lib/gamification'
import { useRouter } from 'next/navigation'

const noteColor = (n: number) => n >= 14 ? T.ok : n >= 10 ? T.wip : '#DC2626'

export default function HomePage() {
  const { notions, game, time, subject, setTime, setSubject } = useGame()
  const router = useRouter()

  const jj          = daysLeft(EXAM.maths)
  const mn          = notions.filter(n => n.sub === 'maths')
  const noteMaths   = getNoteEstimee(notions, 'maths')
  const urgent      = notions.filter(n => n.p === 1 && n.st === 'non_vu').slice(0, 3)
  const nextMilestone = MILESTONES.find(m => m.xp > game.xp)
  const earnedCoins   = getEarnedEuros(game.xp)

  return (
    <div style={{ padding: '16px 14px 110px' }}>
      {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 12, color: T.muted }}>Bonjour Noah 👋</div>
        <div style={{ fontSize: 26, fontWeight: 900, fontFamily: 'Sora,sans-serif', color: T.text, letterSpacing: -1, lineHeight: 1.1, marginTop: 3 }}>
          J-{jj} avant les Maths
        </div>
        <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Brevet du 26 au 30 juin 2026</div>
      </div>

      {/* Streak + XP */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        <Card style={{ padding: '12px 14px', borderTop: `3px solid ${T.streak}` }}>
          <div style={{ fontSize: 24 }}>{game.streak >= 3 ? '🔥' : '⏳'}</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: T.streak, fontFamily: 'Sora,sans-serif' }}>{game.streak}</div>
          <div style={{ fontSize: 10, color: T.muted }}>jour{game.streak > 1 ? 's' : ''} de streak</div>
        </Card>
        <Card style={{ padding: '12px 14px', borderTop: `3px solid ${T.xp}` }}>
          <div style={{ fontSize: 24 }}>⚡</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: T.xp, fontFamily: 'Sora,sans-serif' }}>{game.xp}</div>
          <div style={{ fontSize: 10, color: T.muted }}>XP total</div>
        </Card>
      </div>

      <XpBar xp={game.xp} />

      {/* Note simulée */}
      <Card style={{ marginTop: 10, padding: '14px', borderLeft: `4px solid ${noteColor(noteMaths)}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, color: T.muted, textTransform: 'uppercase', letterSpacing: 1 }}>Note simulée Maths</div>
            <div style={{ fontSize: 32, fontWeight: 900, fontFamily: 'Sora,sans-serif', color: noteColor(noteMaths), lineHeight: 1, marginTop: 4 }}>
              {noteMaths.toFixed(1)}<span style={{ fontSize: 16, color: T.muted }}>/20</span>
            </div>
            <div style={{ fontSize: 10, color: T.muted, marginTop: 3 }}>
              {noteMaths >= 14 ? '🏅 En route pour la mention !' : noteMaths >= 10 ? '💪 Continue, tu y es presque' : '📚 Encore du boulot !'}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            {SUBJ.map(s => {
              const n = getNoteEstimee(notions, s.id)
              return (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 11 }}>{s.e}</span>
                  <div style={{ width: 50, background: T.border, borderRadius: 999, height: 5 }}>
                    <div style={{ height: '100%', width: `${n / 20 * 100}%`, background: s.acc, borderRadius: 999 }} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: s.acc, minWidth: 28 }}>{n.toFixed(0)}/20</span>
                </div>
              )
            })}
          </div>
        </div>
      </Card>

      {/* Prochain palier */}
      {nextMilestone && (
        <Card style={{ marginTop: 10, padding: '12px 14px', background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.reward, marginBottom: 6 }}>
            💰 Prochain palier — {nextMilestone.label}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: T.text }}>{game.xp} / {nextMilestone.xp} XP</span>
            <span style={{ fontSize: 14, fontWeight: 900, color: T.reward, fontFamily: 'Sora,sans-serif' }}>+{nextMilestone.euros}€</span>
          </div>
          <div style={{ background: T.seenBorder, borderRadius: 999, height: 7 }}>
            <div style={{ height: '100%', width: `${Math.min(100, game.xp / nextMilestone.xp * 100)}%`, background: T.reward, borderRadius: 999, transition: 'width .4s' }} />
          </div>
          <div style={{ fontSize: 10, color: T.muted, marginTop: 4 }}>{earnedCoins}€ déjà débloqués 🎉</div>
        </Card>
      )}

      {/* Urgent */}
      {urgent.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
            ⚡ Priorité — pas encore vu
          </div>
          {urgent.map(n => (
            <div key={n.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: T.wipBg, border: `1px solid ${T.wipBorder}`,
              borderRadius: 10, padding: '9px 12px', marginBottom: 6,
            }}>
              <Ring st={n.st} size={12} />
              <span style={{ flex: 1, fontSize: 12, color: T.text, fontWeight: 600 }}>{n.label}</span>
              <span style={{ fontSize: 10, color: T.muted }}>{n.dom}</span>
            </div>
          ))}
        </div>
      )}

      {/* Temps */}
      <div style={{ marginTop: 14, marginBottom: 10 }}>
        <div style={{ fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>⏱ Temps disponible</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[10, 20, 30, 45].map(t => (
            <button key={t} onClick={() => setTime(t)} style={{
              flex: 1, padding: '11px 0', borderRadius: 10, cursor: 'pointer',
              border: `2px solid ${time === t ? T.text : T.border}`,
              background: time === t ? T.text : T.card,
              color: time === t ? '#FFF' : T.muted,
              fontSize: 13, fontWeight: 700, fontFamily: 'Sora,sans-serif', transition: 'all .15s',
            }}>{t}m</button>
          ))}
        </div>
      </div>

      {/* Matière */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>📚 Matière</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {SUBJ.map(s => (
            <button key={s.id} onClick={() => setSubject(s.id)} style={{
              padding: '7px 12px', borderRadius: 8, cursor: 'pointer',
              border: `2px solid ${subject === s.id ? s.acc : T.border}`,
              background: subject === s.id ? s.acc : T.card,
              color: subject === s.id ? '#FFF' : T.text,
              fontSize: 12, fontWeight: 600, transition: 'all .15s',
            }}>{s.e} {s.label}</button>
          ))}
        </div>
      </div>

      <button onClick={() => router.push('/session')} style={{
        width: '100%', padding: 16, borderRadius: 12, border: 'none',
        background: T.text, color: '#FFF', fontSize: 15, fontWeight: 800,
        cursor: 'pointer', fontFamily: 'Sora,sans-serif', letterSpacing: .3,
      }}>
        Lancer · {time} min →
      </button>
    </div>
  )
}
