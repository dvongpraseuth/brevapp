import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { T, SUBJ } from '@/lib/constants'
import { getNoteEstimee, MILESTONES, BADGES, LEVELS } from '@/lib/gamification'
import { ParentSetup } from './ParentSetup'
import type { Notion, GameStats, Reward } from '@/lib/types'

async function getChildData(parentId: string) {
  const supabase = await createClient()

  // Récupérer les enfants de ce parent
  const { data: children } = await supabase
    .from('profiles')
    .select('id, name')
    .eq('parent_id', parentId)

  if (!children?.length) return null

  const childId = children[0].id
  const childName = children[0].name

  // Données de l'enfant (RLS : parent peut lire grâce à parent_sees_child_*)
  const [{ data: progress }, { data: stats }, { data: rewards }, { data: sessions }] = await Promise.all([
    supabase.from('progress').select('notion_id, subject, status').eq('user_id', childId),
    supabase.from('game_stats').select('*').eq('user_id', childId).single(),
    supabase.from('rewards').select('*').eq('user_id', childId).order('cost_xp'),
    supabase.from('sessions').select('*').eq('user_id', childId).order('completed_at', { ascending: false }).limit(20),
  ])

  return { childId, childName, progress, stats, rewards, sessions }
}

export default async function ParentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const data = await getChildData(user.id)

  if (!data) {
    return (
      <div style={{ fontFamily: 'Nunito,sans-serif', background: T.bg, minHeight: '100vh', color: T.text, maxWidth: 430, margin: '0 auto' }}>
        <div style={{ background: T.card, borderBottom: `1px solid ${T.border}`, padding: '16px 14px' }}>
          <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'Sora,sans-serif' }}>👨‍👦 Vue parent</div>
          <div style={{ fontSize: 11, color: T.muted }}>Configuration initiale</div>
        </div>
        <div style={{ padding: '32px 0 0', textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👶</div>
          <div style={{ fontSize: 17, fontWeight: 800, fontFamily: 'Sora,sans-serif', color: T.text }}>Lier le compte de Noah</div>
          <div style={{ fontSize: 12, color: T.muted, marginTop: 6 }}>À faire une seule fois</div>
        </div>
        <ParentSetup />
      </div>
    )
  }

  const { childName, progress, stats, rewards, sessions } = data

  // Reconstituer les notions avec leur statut depuis la BDD
  const { NOTIONS } = await import('@/lib/constants')
  const notions: Notion[] = NOTIONS.map(n => {
    const saved = progress?.find(p => p.notion_id === n.id)
    return saved ? { ...n, st: saved.status as Notion['st'] } : n
  })

  const gs = stats as GameStats | null
  const xp = gs?.xp ?? 0
  const currentLevel = LEVELS.findLast(l => xp >= l.min) ?? LEVELS[0]
  const earnedEuros = MILESTONES.filter(m => m.xp <= xp).reduce((s, m) => s + m.euros, 0)
  const nextMilestone = MILESTONES.find(m => m.xp > xp)
  const pendingRewards = (rewards ?? []).filter(r => r.requested && !r.approved)

  const noteColor = (n: number) => n >= 14 ? T.ok : n >= 10 ? T.wip : '#DC2626'

  return (
    <div style={{
      fontFamily: 'Nunito,sans-serif', background: T.bg, minHeight: '100vh',
      color: T.text, maxWidth: 430, margin: '0 auto', padding: '0 0 40px',
    }}>
      {/* Header */}
      <div style={{
        background: T.card, borderBottom: `1px solid ${T.border}`,
        padding: '16px 14px', position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'Sora,sans-serif' }}>
          👨‍👦 Vue parent
        </div>
        <div style={{ fontSize: 11, color: T.muted }}>Progression de {childName}</div>
      </div>

      <div style={{ padding: '16px 14px' }}>

        {/* Alertes rewards en attente */}
        {pendingRewards.length > 0 && (
          <div style={{
            background: '#FEF3C7', border: '1px solid #FCD34D',
            borderRadius: 12, padding: '14px', marginBottom: 14,
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#92400E', marginBottom: 8 }}>
              💰 {pendingRewards.length} reward{pendingRewards.length > 1 ? 's' : ''} en attente de validation
            </div>
            {pendingRewards.map(r => (
              <RewardRow key={r.id} reward={r} supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL!} />
            ))}
          </div>
        )}

        {/* Stats globales */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
          <StatCard label="XP total" value={`${xp}`} unit="XP" color={T.xp} />
          <StatCard label="Streak" value={`${gs?.streak ?? 0}`} unit="jours" color={T.streak} />
          <StatCard label="Sessions" value={`${gs?.total_sessions ?? 0}`} unit="total" color={T.text} />
          <StatCard label="Gains débloqués" value={`${earnedEuros}€`} unit={`/ ${MILESTONES[MILESTONES.length-1].euros}€`} color={T.reward} />
        </div>

        {/* Historique sessions */}
        <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
          Historique des sessions ({sessions?.length ?? 0})
        </div>
        {!sessions?.length ? (
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16, marginBottom: 12, fontSize: 12, color: T.muted, textAlign: 'center' }}>
            Aucune session terminée pour l&apos;instant
          </div>
        ) : (
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
            {sessions.map((s, i) => {
              const subj = SUBJ.find(x => x.id === s.subject)
              const total = s.score_ok + s.score_flou + s.score_non
              const pctOk = total ? Math.round(s.score_ok / total * 100) : 0
              const date  = new Date(s.completed_at)
              const label = date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
              const heure = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
              return (
                <div key={s.id} style={{
                  padding: '12px 14px',
                  borderBottom: i < sessions.length - 1 ? `1px solid ${T.border}` : 'none',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>
                        {subj?.e} {subj?.label ?? s.subject} · {s.duration_min} min
                      </div>
                      <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{label} à {heure}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 14, fontWeight: 900, fontFamily: 'Sora,sans-serif', color: T.xp }}>+{s.xp_earned} XP</div>
                      <div style={{ fontSize: 11, color: pctOk >= 70 ? T.ok : pctOk >= 40 ? T.wip : '#DC2626', fontWeight: 700 }}>
                        {pctOk}% réussi
                      </div>
                    </div>
                  </div>
                  {/* Barre score */}
                  <div style={{ display: 'flex', height: 8, borderRadius: 999, overflow: 'hidden', gap: 2 }}>
                    {s.score_ok   > 0 && <div style={{ flex: s.score_ok,   background: T.ok,   borderRadius: '999px 0 0 999px' }} title={`${s.score_ok} su`} />}
                    {s.score_flou > 0 && <div style={{ flex: s.score_flou, background: T.wip                                   }} title={`${s.score_flou} flou`} />}
                    {s.score_non  > 0 && <div style={{ flex: s.score_non,  background: '#DC2626', borderRadius: '0 999px 999px 0' }} title={`${s.score_non} pas su`} />}
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 5, fontSize: 10, color: T.muted }}>
                    <span style={{ color: T.ok,     fontWeight: 700 }}>✅ {s.score_ok} su</span>
                    <span style={{ color: T.wip,    fontWeight: 700 }}>🤔 {s.score_flou} flou</span>
                    <span style={{ color: '#DC2626',fontWeight: 700 }}>❌ {s.score_non} pas su</span>
                    <span>{total} question{total > 1 ? 's' : ''}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Niveau */}
        <div style={{
          background: T.card, border: `1px solid ${T.border}`, borderRadius: 12,
          padding: '14px', marginBottom: 12,
          borderLeft: `4px solid ${T.xp}`,
        }}>
          <div style={{ fontSize: 12, color: T.muted, marginBottom: 4 }}>Niveau actuel</div>
          <div style={{ fontSize: 20, fontWeight: 900, fontFamily: 'Sora,sans-serif' }}>
            {currentLevel.emoji} {currentLevel.name}
          </div>
          {nextMilestone && (
            <>
              <div style={{ background: T.border, borderRadius: 999, height: 6, margin: '10px 0 4px' }}>
                <div style={{
                  height: '100%', borderRadius: 999, background: T.xp,
                  width: `${Math.min(100, xp / nextMilestone.xp * 100)}%`,
                }} />
              </div>
              <div style={{ fontSize: 11, color: T.muted }}>
                {xp} / {nextMilestone.xp} XP → +{nextMilestone.euros}€
              </div>
            </>
          )}
        </div>

        {/* Notes simulées par matière */}
        <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
          Notes simulées brevet
        </div>
        <div style={{
          background: T.card, border: `1px solid ${T.border}`, borderRadius: 12,
          padding: '4px 14px 10px', marginBottom: 14,
        }}>
          {SUBJ.map((s, i) => {
            const note = getNoteEstimee(notions, s.id)
            const mastered = notions.filter(n => n.sub === s.id && n.st === 'maitrise').length
            const total    = notions.filter(n => n.sub === s.id).length
            return (
              <div key={s.id} style={{
                padding: '10px 0',
                borderBottom: i < SUBJ.length - 1 ? `1px solid ${T.border}` : 'none',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13 }}>{s.e} {s.label}</span>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 16, fontWeight: 900, fontFamily: 'Sora,sans-serif', color: noteColor(note) }}>
                      {note.toFixed(1)}/20
                    </span>
                    <div style={{ fontSize: 10, color: T.muted }}>{mastered}/{total} maîtrisées</div>
                  </div>
                </div>
                <div style={{ background: T.border, borderRadius: 999, height: 7 }}>
                  <div style={{ height: '100%', width: `${note / 20 * 100}%`, background: s.acc, borderRadius: 999 }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Badges */}
        <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
          Badges débloqués ({gs?.badges?.length ?? 0}/{BADGES.length})
        </div>
        <div style={{
          background: T.card, border: `1px solid ${T.border}`, borderRadius: 12,
          padding: 14, marginBottom: 14, display: 'flex', flexWrap: 'wrap', gap: 8,
        }}>
          {BADGES.map(b => {
            const earned = gs?.badges?.includes(b.id) ?? false
            return (
              <div key={b.id} style={{
                padding: '6px 10px', borderRadius: 20,
                background: earned ? '#F0FDF4' : T.bg,
                border: `1px solid ${earned ? T.okBorder : T.border}`,
                opacity: earned ? 1 : 0.4,
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <span style={{ fontSize: 14 }}>{b.emoji}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: earned ? T.ok : T.muted }}>{b.name}</span>
              </div>
            )
          })}
        </div>

        {/* Tous les rewards */}
        <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
          Objectifs de Noah
        </div>
        {(rewards ?? []).map(r => (
          <div key={r.id} style={{
            background: T.card, border: `1px solid ${T.border}`, borderRadius: 12,
            padding: '12px 14px', marginBottom: 8,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>{r.label}</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: T.reward, fontFamily: 'Sora,sans-serif' }}>{r.cost_xp} XP</span>
            </div>
            <div style={{ background: T.border, borderRadius: 999, height: 6, marginBottom: 8 }}>
              <div style={{ height: '100%', width: `${Math.min(100, xp / r.cost_xp * 100)}%`, background: T.reward, borderRadius: 999 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 10, color: T.muted }}>{Math.min(xp, r.cost_xp)}/{r.cost_xp} XP</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: r.approved ? T.ok : r.requested ? T.wip : T.muted }}>
                {r.approved ? '✅ Validé' : r.requested ? '⏳ En attente' : '🔒 Pas encore'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatCard({ label, value, unit, color }: { label: string; value: string; unit: string; color: string }) {
  return (
    <div style={{
      background: T.card, border: `1px solid ${T.border}`,
      borderTop: `3px solid ${color}`, borderRadius: 12, padding: '12px 14px',
    }}>
      <div style={{ fontSize: 10, color: T.muted, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 900, fontFamily: 'Sora,sans-serif', color }}>{value}</div>
      <div style={{ fontSize: 10, color: T.muted }}>{unit}</div>
    </div>
  )
}

function RewardRow({ reward }: { reward: { id: string; label: string; cost_xp: number }; supabaseUrl: string }) {
  return (
    <div style={{ fontSize: 12, color: '#92400E', marginBottom: 4 }}>
      • {reward.label} ({reward.cost_xp} XP)
    </div>
  )
}
