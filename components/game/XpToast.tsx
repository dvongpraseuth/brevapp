'use client'

import { useEffect } from 'react'
import { T } from '@/lib/constants'

interface XpToastProps {
  gain: number
  onDone: () => void
}

export function XpToast({ gain, onDone }: XpToastProps) {
  useEffect(() => {
    const t = setTimeout(onDone, 1800)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div style={{
      position: 'fixed', top: 70, left: '50%', transform: 'translateX(-50%)',
      background: T.xp, color: '#FFF', borderRadius: 99, padding: '8px 20px',
      fontSize: 14, fontWeight: 800, fontFamily: 'Sora,sans-serif',
      zIndex: 999, boxShadow: '0 4px 20px rgba(124,58,237,.4)',
      animation: 'slideDown .3s ease',
    }}>
      +{gain} XP ⚡
    </div>
  )
}
