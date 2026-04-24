'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { T } from '@/lib/constants'

export function ParentSetup() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/parent', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ childEmail: email }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Erreur inconnue')
      setLoading(false)
      return
    }

    router.refresh()
  }

  return (
    <div style={{
      background: T.card, border: `1px solid ${T.border}`,
      borderRadius: 14, padding: 24, margin: '0 14px',
    }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 6 }}>
        Lier le compte de Noah
      </div>
      <div style={{ fontSize: 12, color: T.muted, marginBottom: 16, lineHeight: 1.6 }}>
        Noah doit d&apos;abord se connecter une fois avec son email pour créer son compte.
        Ensuite entre son email ici pour lier nos deux comptes.
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="email de Noah"
          required
          style={{
            width: '100%', padding: '12px 14px', borderRadius: 10,
            border: `1.5px solid ${error ? '#DC2626' : T.border}`,
            fontSize: 14, fontFamily: 'Nunito,sans-serif',
            color: T.text, background: T.bg, marginBottom: 10, boxSizing: 'border-box',
          }}
        />
        {error && (
          <div style={{ fontSize: 12, color: '#DC2626', marginBottom: 10 }}>⚠️ {error}</div>
        )}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%', padding: 13, borderRadius: 12, border: 'none',
            background: loading ? T.muted : T.text, color: '#FFF',
            fontSize: 14, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'Sora,sans-serif',
          }}
        >
          {loading ? 'Liaison…' : 'Lier le compte →'}
        </button>
      </form>
    </div>
  )
}
