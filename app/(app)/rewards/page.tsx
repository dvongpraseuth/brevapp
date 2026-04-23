'use client'

import { useGame } from '@/lib/game-context'
import { Card } from '@/components/ui/Card'
import { T } from '@/lib/constants'
import { MILESTONES, getEarnedEuros } from '@/lib/gamification'

export default function RewardsPage() {
  const { game, handleRequestReward } = useGame()
  const earned = getEarnedEuros(game.xp)

  return (
    <div style={{ padding: '16px 14px 110px' }}>
      <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'Sora,sans-serif', color: T.text, marginBottom: 4 }}>
        Mes récompenses
      </div>
      <div style={{ fontSize: 11, color: T.muted, marginBottom: 16 }}>
        Chaque XP = 1 pièce · Les paliers débloquent de l&apos;argent réel
      </div>

      {/* Solde */}
      <Card style={{ padding: '16px', marginBottom: 14, borderTop: `3px solid ${T.reward}`, textAlign: 'center' }}>
        <div style={{ fontSize: 11, color: T.muted, textTransform: 'uppercase', letterSpacing: 1 }}>Disponible</div>
        <div style={{ fontSize: 40, fontWeight: 900, fontFamily: 'Sora,sans-serif', color: T.reward, lineHeight: 1.1 }}>
          {earned}€
        </div>
        <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>
          sur {MILESTONES[MILESTONES.length - 1].euros}€ max
        </div>
      </Card>

      {/* Paliers XP */}
      <div style={{ fontSize: 11, fontWeight: 700, color: T.text, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
        Paliers XP
      </div>
      <Card style={{ padding: '4px 14px 10px', marginBottom: 14 }}>
        {MILESTONES.map((m, i) => {
          const unlocked = game.xp >= m.xp
          return (
            <div key={m.xp} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 0', borderBottom: i < MILESTONES.length - 1 ? `1px solid ${T.border}` : 'none',
            }}>
              <div style={{ fontSize: 20 }}>{unlocked ? '✅' : '🔒'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: unlocked ? T.text : T.muted }}>{m.label}</div>
                <div style={{ fontSize: 11, color: T.muted }}>{m.xp} XP requis</div>
                {!unlocked && (
                  <div style={{ background: T.border, borderRadius: 999, height: 5, marginTop: 4 }}>
                    <div style={{ height: '100%', width: `${Math.min(100, game.xp / m.xp * 100)}%`, background: T.reward, borderRadius: 999 }} />
                  </div>
                )}
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'Sora,sans-serif', color: unlocked ? T.reward : T.faint }}>
                +{m.euros}€
              </div>
            </div>
          )
        })}
      </Card>

      {/* Objectifs */}
      <div style={{ fontSize: 11, fontWeight: 700, color: T.text, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
        Mes objectifs
      </div>
      {game.rewards.map(r => (
        <Card key={r.id} style={{ padding: '12px 14px', marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{r.label}</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: T.reward, fontFamily: 'Sora,sans-serif' }}>{r.cost_xp} XP</span>
          </div>
          <div style={{ background: T.border, borderRadius: 999, height: 6, marginBottom: 8 }}>
            <div style={{ height: '100%', width: `${Math.min(100, game.xp / r.cost_xp * 100)}%`, background: T.reward, borderRadius: 999, transition: 'width .4s' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 10, color: T.muted }}>{Math.min(game.xp, r.cost_xp)}/{r.cost_xp} XP</span>
            {r.requested ? (
              <span style={{ fontSize: 11, color: T.ok, fontWeight: 700 }}>✅ Demandé à papa</span>
            ) : game.xp >= r.cost_xp ? (
              <button onClick={() => handleRequestReward(r.id)} style={{
                padding: '6px 14px', borderRadius: 20, border: 'none',
                background: T.reward, color: '#FFF', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}>Demander à papa →</button>
            ) : (
              <span style={{ fontSize: 10, color: T.muted }}>encore {r.cost_xp - game.xp} XP</span>
            )}
          </div>
        </Card>
      ))}

      <div style={{ fontSize: 11, color: T.faint, textAlign: 'center', marginTop: 12, lineHeight: 1.6 }}>
        Papa valide les retraits ✓{'\n'}XP = effort réel, pas les notes
      </div>
    </div>
  )
}
