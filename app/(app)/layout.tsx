'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Route } from 'next'
import { GameProvider, useGame } from '@/lib/game-context'
import { XpToast } from '@/components/game/XpToast'
import { T, EXAM, daysLeft } from '@/lib/constants'
import type { ReactNode } from 'react'

const TABS: { href: Route; icon: string; label: string }[] = [
  { href: '/',         icon: '⌂', label: 'Accueil' },
  { href: '/carte',    icon: '⊞', label: 'Carte'   },
  { href: '/session',  icon: '▷', label: 'Session'  },
  { href: '/brevet',   icon: '◈', label: 'Brevet'   },
  { href: '/rewards',  icon: '💰', label: 'Rewards'  },
]

function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { game, toast, setToast } = useGame()

  return (
    <div style={{
      fontFamily: 'Nunito,sans-serif', background: T.bg, minHeight: '100vh',
      color: T.text, maxWidth: 430, margin: '0 auto', position: 'relative',
    }}>
      {toast && <XpToast gain={toast} onDone={() => setToast(null)} />}

      {/* Header */}
      <div style={{
        background: T.card, borderBottom: `1px solid ${T.border}`, padding: '11px 14px',
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 900, fontFamily: 'Sora,sans-serif', letterSpacing: -.5 }}>BrevApp</div>
          <div style={{ fontSize: 9, color: T.muted }}>Brevet DNB 2026</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {game.streak >= 3 && <span style={{ fontSize: 14 }}>🔥{game.streak}</span>}
          <div style={{
            background: T.text, borderRadius: 8, padding: '5px 11px',
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#EF4444', animation: 'blink 2s infinite' }} />
            <span style={{ fontSize: 13, fontWeight: 800, color: '#FFF', fontFamily: 'Sora,sans-serif' }}>
              J-{daysLeft(EXAM.maths)}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ overflowY: 'auto', height: 'calc(100vh - 52px - 62px)', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
        {children}
      </div>

      {/* Bottom Nav */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 430, zIndex: 100,
        background: T.card, borderTop: `1px solid ${T.border}`, display: 'flex',
      }}>
        {TABS.map(t => {
          const active = pathname === t.href
          return (
            <Link key={t.href} href={t.href} style={{
              flex: 1, padding: '9px 0 13px', border: 'none', background: 'transparent',
              cursor: 'pointer', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 2, position: 'relative', textDecoration: 'none',
            }}>
              {active && (
                <div style={{
                  position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                  width: 24, height: 2, background: T.text, borderRadius: 999,
                }} />
              )}
              <span style={{ fontSize: 17, marginTop: 4, opacity: active ? 1 : .45 }}>{t.icon}</span>
              <span style={{ fontSize: 9, fontWeight: active ? 800 : 500, color: active ? T.text : T.muted }}>
                {t.label}
              </span>
            </Link>
          )
        })}
      </div>

      <style>{`
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}
        @keyframes slideDown{from{opacity:0;transform:translate(-50%,-10px)}to{opacity:1;transform:translate(-50%,0)}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{display:none}
        a{font-family:Nunito,sans-serif}
      `}</style>
    </div>
  )
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <GameProvider>
      <AppShell>{children}</AppShell>
    </GameProvider>
  )
}
