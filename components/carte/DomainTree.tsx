'use client'

import { useState } from 'react'
import { T } from '@/lib/constants'
import { StatusBadge } from './StatusBadge'
import { Ring } from '@/components/game/Ring'
import type { Notion } from '@/lib/types'

interface DomainTreeProps {
  dom: string
  notions: Notion[]
  onCycle: (id: string) => void
}

export function DomainTree({ dom, notions, onCycle }: DomainTreeProps) {
  const [open, setOpen] = useState(true)
  const ok = notions.filter(n => n.st === 'maitrise').length

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 8,
          background: 'none', border: 'none', cursor: 'pointer', padding: '10px 0', textAlign: 'left',
        }}
      >
        <span style={{
          fontSize: 9, color: T.muted,
          transform: open ? 'rotate(90deg)' : 'none',
          transition: 'transform .2s', display: 'inline-block', width: 10,
        }}>▶</span>
        <span style={{ flex: 1, fontSize: 12, fontWeight: 700, color: T.text }}>{dom}</span>
        <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          {notions.map(n => (
            <div key={n.id} style={{
              width: 5, height: 5, borderRadius: '50%',
              background: n.st === 'maitrise' ? T.ok
                        : n.st === 'en_cours_assimilation' ? T.wip
                        : n.st === 'vu_en_cours' ? T.seen : T.faint,
            }} />
          ))}
          <span style={{ fontSize: 10, color: T.muted, marginLeft: 4, minWidth: 24, textAlign: 'right' }}>
            {ok}/{notions.length}
          </span>
        </div>
      </button>

      {open && (
        <div style={{ marginLeft: 18, borderLeft: `2px solid ${T.border}`, marginBottom: 4 }}>
          {notions.map((n, i) => (
            <div key={n.id} style={{ display: 'flex', alignItems: 'center', position: 'relative', paddingLeft: 14 }}>
              <div style={{
                position: 'absolute', left: 0, top: '50%', width: 10, height: 1.5,
                background: T.faint, transform: 'translateY(-50%)',
              }} />
              <div style={{
                flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0',
                borderBottom: i === notions.length - 1 ? 'none' : `1px solid ${T.border}30`,
              }}>
                {n.p === 1 && <span style={{ fontSize: 8, flexShrink: 0, opacity: .5 }}>🔴</span>}
                <span style={{
                  flex: 1, fontSize: 12,
                  color: n.st === 'maitrise' ? T.muted : T.text,
                  textDecoration: n.st === 'maitrise' ? 'line-through' : 'none',
                  transition: 'all .2s',
                }}>{n.label}</span>
                <StatusBadge st={n.st} onClick={() => onCycle(n.id)} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
