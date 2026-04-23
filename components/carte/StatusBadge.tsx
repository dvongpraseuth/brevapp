'use client'

import { ST_CFG } from '@/lib/constants'
import { Ring } from '@/components/game/Ring'
import type { Status } from '@/lib/types'

interface StatusBadgeProps {
  st: Status
  onClick?: () => void
}

export function StatusBadge({ st, onClick }: StatusBadgeProps) {
  const cfg = ST_CFG[st]
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        background: cfg.bg, border: `1.5px solid ${cfg.border}`,
        borderRadius: 20, padding: '3px 9px 3px 6px',
        cursor: onClick ? 'pointer' : 'default',
        flexShrink: 0, transition: 'all .15s',
      }}
    >
      <Ring st={st} size={11} />
      <span style={{ fontSize: 10, fontWeight: 700, color: cfg.c, whiteSpace: 'nowrap' }}>
        {cfg.label}
      </span>
    </button>
  )
}
