import { T, ST_CFG } from '@/lib/constants'
import type { Status } from '@/lib/types'

interface RingProps {
  st: Status
  size?: number
}

export function Ring({ st, size = 16 }: RingProps) {
  const cfg = ST_CFG[st]
  const r = (size - 3) / 2
  const mid = size / 2
  const circ = 2 * Math.PI * r
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ flexShrink: 0, display: 'block' }}
    >
      <circle cx={mid} cy={mid} r={r} fill="none" stroke={T.border} strokeWidth="2" />
      {cfg.pct > 0 && (
        <circle
          cx={mid} cy={mid} r={r} fill="none" stroke={cfg.c} strokeWidth="2.5"
          strokeDasharray={`${cfg.pct * circ} ${circ}`} strokeLinecap="round"
          transform={`rotate(-90 ${mid} ${mid})`}
        />
      )}
      {st === 'maitrise' && <circle cx={mid} cy={mid} r={3} fill={cfg.c} />}
    </svg>
  )
}
