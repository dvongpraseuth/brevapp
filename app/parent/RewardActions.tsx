'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { T } from '@/lib/constants'

interface Props {
  reward: { id: string; label: string; cost_xp: number }
}

export function RewardActions({ reward }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState<'approved' | 'rejected' | null>(null)

  const act = async (approved: boolean) => {
    setLoading(true)
    await fetch('/api/parent/rewards', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rewardId: reward.id, approved }),
    })
    setDone(approved ? 'approved' : 'rejected')
    setLoading(false)
    router.refresh()
  }

  if (done === 'approved') return (
    <div style={{ fontSize: 12, color: T.ok, fontWeight: 700, marginTop: 6 }}>✅ Validé !</div>
  )
  if (done === 'rejected') return (
    <div style={{ fontSize: 12, color: T.muted, marginTop: 6 }}>❌ Refusé</div>
  )

  return (
    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
      <button
        onClick={() => act(true)}
        disabled={loading}
        style={{
          flex: 1, padding: '8px 12px', borderRadius: 8, border: 'none',
          background: T.ok, color: '#FFF', fontSize: 12, fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
        }}
      >
        ✅ Valider
      </button>
      <button
        onClick={() => act(false)}
        disabled={loading}
        style={{
          flex: 1, padding: '8px 12px', borderRadius: 8,
          border: '1px solid #DC2626', background: '#FFF',
          color: '#DC2626', fontSize: 12, fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
        }}
      >
        ❌ Refuser
      </button>
    </div>
  )
}
