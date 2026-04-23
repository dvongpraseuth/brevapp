import type { CSSProperties, ReactNode } from 'react'
import { T } from '@/lib/constants'

interface CardProps {
  children: ReactNode
  style?: CSSProperties
}

export function Card({ children, style = {} }: CardProps) {
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, ...style }}>
      {children}
    </div>
  )
}
