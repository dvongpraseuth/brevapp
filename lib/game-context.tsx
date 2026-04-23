'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Notion, GameStats, Reward } from './types'
import { NOTIONS, INIT_REWARDS, ST_CYCLE } from './constants'
import { BADGES, XP_GAIN, computeNewBadges } from './gamification'

interface GameContextValue {
  notions: Notion[]
  game: GameStats & { rewards: Reward[] }
  time: number
  subject: string
  toast: number | null
  setTime: (t: number) => void
  setSubject: (s: string) => void
  setToast: (v: number | null) => void
  cycleStatus: (id: string) => void
  handleAnswer: (nid: string, res: 'ok' | 'flou' | 'non', xpGain: number, streak: number) => void
  handleComplete: (isFlash: boolean) => void
  handleRequestReward: (rid: string) => void
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [notions, setNotions] = useState<Notion[]>(NOTIONS)
  const [time, setTime] = useState(20)
  const [subject, setSubject] = useState('maths')
  const [toast, setToast] = useState<number | null>(null)
  const [game, setGame] = useState<GameStats & { rewards: Reward[] }>({
    user_id: 'local',
    xp: 240,
    streak: 2,
    best_streak: 3,
    last_session: null,
    total_sessions: 1,
    flash_sessions: 0,
    badges: ['first', 'streak3'],
    rewards: INIT_REWARDS,
  })

  const cycleStatus = useCallback((id: string) => {
    setNotions(ns => ns.map(n =>
      n.id === id
        ? { ...n, st: ST_CYCLE[(ST_CYCLE.indexOf(n.st) + 1) % ST_CYCLE.length] }
        : n
    ))
  }, [])

  const handleAnswer = useCallback((
    nid: string,
    res: 'ok' | 'flou' | 'non',
    xpGain: number,
    streak: number,
  ) => {
    const stMap = { ok: 'maitrise', flou: 'en_cours_assimilation', non: 'vu_en_cours' } as const
    setNotions(ns => ns.map(n => n.id === nid ? { ...n, st: stMap[res] } : n))
    if (xpGain > 0) {
      setGame(g => {
        const newXp   = g.xp + xpGain
        const newBest = Math.max(g.best_streak, streak)
        const updated = { ...g, xp: newXp, best_streak: newBest }
        return { ...updated, badges: computeNewBadges(updated, notions) }
      })
      setToast(xpGain)
    }
  }, [notions])

  const handleComplete = useCallback((isFlash: boolean) => {
    setGame(g => {
      const updated = {
        ...g,
        xp: g.xp + XP_GAIN.session_complete,
        total_sessions: g.total_sessions + 1,
        flash_sessions: isFlash ? g.flash_sessions + 1 : g.flash_sessions,
        streak: g.streak + 1,
        last_session: new Date().toISOString(),
      }
      return { ...updated, badges: computeNewBadges(updated, notions) }
    })
    setToast(XP_GAIN.session_complete)
  }, [notions])

  const handleRequestReward = useCallback((rid: string) => {
    setGame(g => ({
      ...g,
      rewards: g.rewards.map(r => r.id === rid ? { ...r, requested: true } : r),
    }))
  }, [])

  return (
    <GameContext.Provider value={{
      notions, game, time, subject, toast,
      setTime, setSubject, setToast,
      cycleStatus, handleAnswer, handleComplete, handleRequestReward,
    }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used inside GameProvider')
  return ctx
}
