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
  const [{ data: progress }, { data: stats }, { data: rewards }] = await Promise.all([
    supabase.from('progress').select('notion_id, subject, status').eq('user_id', childId),
    supabase.from('game_stats').select('*').eq('user_id', childId).single(),
    supabase.from('rewards').select('*').eq('user_id', childId).order('cost_xp'),
  ])

  return { childId, childName, progress, stats, rewards }
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

  const { childName, progress, stats, rewards } = data

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
