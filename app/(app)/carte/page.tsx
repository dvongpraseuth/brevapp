'use client'

import { useState } from 'react'
import { useGame } from '@/lib/game-context'
import { DomainTree } from '@/components/carte/DomainTree'
import { Card } from '@/components/ui/Card'
import { T, SUBJ } from '@/lib/constants'
import { getNoteEstimee } from '@/lib/gamification'

const noteColor = (n: number) => n >= 14 ? T.ok : n >= 10 ? T.wip : '#DC2626'

export default function CartePage() {
  const { notions, cycleStatus } = useGame()
  const [sub, setSub] = useState('maths')

  const subj = SUBJ.find(s => s.id === sub)
  const sn   = notions.filter(n => n.sub === sub)
  const doms = [...new Set(sn.map(n => n.dom))]
  const ok   = sn.filter(n => n.st === 'maitrise').length
  const pct  = sn.length ? Math.round(ok / sn.length * 100) : 0
  const note = getNoteEstimee(notions, sub)

  return (
    <div style={{ padding: '16px 14px 110px' }}>
      <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'Sora,sans-serif', color: T.text, marginBottom: 14 }}>
        Carte des compétences
      </div>

      {/* Sélecteur matière */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, overflowX: 'auto', paddingBottom: 4 }}>
        {SUBJ.map(s => {
          const n = getNoteEstimee(notions, s.id)
          return (
            <button key={s.id} onClick={() => setSub(s.id)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
              padding: '7px 10px', borderRadius: 10, cursor: 'pointer', flexShrink: 0,
              border: `2px solid ${sub === s.id ? s.acc : T.border}`,
              background: sub === s.id ? s.acc : T.card,
              color: sub === s.id ? '#FFF' : T.text,
            }}>
              <span style={{ fontSize: 12, fontWeight: 700 }}>{s.e} {s.label}</span>
              <span style={{ fontSize: 10, opacity: .8 }}>{n.toFixed(0)}/20</span>
            </button>
          )
        })}
      </div>

      {/* Stats matière */}
      <Card style={{ padding: '12px 14px', borderTop: `3px solid ${subj?.acc}`, marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{subj?.label}</div>
            <div style={{ fontSize: 10, color: T.muted }}>{ok}/{sn.length} maîtrisées</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 24, fontWeight: 900, fontFamily: 'Sora,sans-serif', color: subj?.acc }}>{pct}%</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: noteColor(note) }}>≈ {note.toFixed(1)}/20 brevet</div>
          </div>
        </div>
        <div style={{ background: T.border, borderRadius: 999, height: 8 }}>
          <div style={{ height: '100%', width: `${pct}%`, background: subj?.acc, borderRadius: 999, transition: 'width .4s' }} />
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
          {([['Maîtrisé', T.ok], ['En cours', T.wip], ['Vu', T.seen], ['Non vu', T.none]] as const).map(([l, c]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: c }} />
              <span style={{ fontSize: 10, color: T.muted }}>{l}</span>
            </div>
          ))}
        </div>
      </Card>

      <p style={{ fontSize: 10, color: T.faint, textAlign: 'center', marginBottom: 10 }}>
        Tape un badge pour faire avancer son statut
      </p>

      {/* Arborescence */}
      <Card style={{ padding: '4px 14px 10px' }}>
        {doms.map((dom, i) => (
          <div key={dom}>
            <DomainTree dom={dom} notions={sn.filter(n => n.dom === dom)} onCycle={cycleStatus} />
            {i < doms.length - 1 && <div style={{ height: 1, background: T.border, marginLeft: 18 }} />}
          </div>
        ))}
      </Card>
    </div>
  )
}
