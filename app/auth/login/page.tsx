'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { T } from '@/lib/constants'

export default function LoginPage() {
  const [email, setEmail]     = useState('')
  const [sent,  setSent]      = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/` },
    })
    setSent(true)
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', background: T.bg, display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📚</div>
          <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'Sora,sans-serif', color: T.text }}>
            BrevApp
          </div>
          <div style={{ fontSize: 13, color: T.muted, marginTop: 6 }}>
            Révisions brevet DNB 2026
          </div>
        </div>

        {sent ? (
          <div style={{
            background: T.okBg, border: `1px solid ${T.okBorder}`,
            borderRadius: 14, padding: 24, textAlign: 'center',
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>✉️</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.ok, marginBottom: 8 }}>
              Lien envoyé !
            </div>
            <div style={{ fontSize: 13, color: T.muted }}>
              Vérifie ta boîte mail <b>{email}</b> et clique sur le lien pour te connecter.
            </div>
          </div>
        ) : (
          <form onSubmit={handleLogin}>
            <div style={{
              background: T.card, border: `1px solid ${T.border}`,
              borderRadius: 14, padding: 24,
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 16 }}>
                Connexion sans mot de passe
              </div>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ton@email.fr"
                required
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 10,
                  border: `1.5px solid ${T.border}`, fontSize: 14,
                  fontFamily: 'Nunito,sans-serif', color: T.text,
                  background: T.bg, marginBottom: 14, boxSizing: 'border-box',
                }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: 14, borderRadius: 12, border: 'none',
                  background: loading ? T.muted : T.text, color: '#FFF',
                  fontSize: 14, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'Sora,sans-serif',
                }}
              >
                {loading ? 'Envoi...' : 'Recevoir mon lien →'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
