'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Notion, GameStats, Reward } from './types'
import { NOTIONS, INIT_REWARDS, ST_CYCLE } from './constants'
import { BADGES, XP_GAIN, computeNewBadges, isStreakBroken, hasSessionToday } from './gamification'
import { useProgressSync } from './hooks/useProgressSync'
import { useStatsSync } from './hooks/useStatsSync'

interface GameContextValue {
  notions:  Notion[]
  game:     GameStats & { rewards: Reward[] }
  time:     number
  subject:  string
  toast:    number | null
  loaded:   boolean
  setTime:            (t: number) => void
  setSubject:         (s: string) => void
  setToast:           (v: number | null) => void
  cycleStatus:        (id: string) => void
  handleAnswer:       (nid: string, res: 'ok' | 'flou' | 'non', xpGain: number) => void
  handleComplete:     (isFlash: boolean, score: { ok: number; flou: number; non: number }) => void
  handleRequestReward:(rid: string) => void
}

const GameContext = createContext<GameContextValue | null>(null)

const DEFAULT_GAME: GameStats & { rewards: Reward[] } = {
  user_id:        'local',
  xp:             0,
  streak:         0,
  best_streak:    0,
  last_session:   null,
  total_sessions: 0,
  flash_sessions: 0,
  badges:         [],
  rewards:        INIT_REWARDS,
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [notions, setNotions] = useState<Notion[]>(NOTIONS)
  const [time,    setTime]    = useState(20)
  const [subject, setSubject] = useState('maths')
  const [toast,   setToast]   = useState<number | null>(null)
  const [loaded,  setLoaded]  = useState(false)
  const [game, setGame] = useState<GameStats & { rewards: Reward[] }>(DEFAULT_GAME)

  const { syncStatus } = useProgressSync(notions, (updates) => {
    setNotions(ns => ns.map(n => updates[n.id] ? { ...n, st: updates[n.id] } : n))
  })

  const { saveStats, saveRewardRequest } = useStatsSync((stats, rewards) => {
    setGame(g => ({
      ...g,
      ...stats,
      rewards: rewards.length > 0 ? rewards : g.rewards,
    }))
    setLoaded(true)
  })

  const cycleStatus = useCallback((id: string) => {
    setNotions(ns => {
      const updated = ns.map(n =>
        n.id === id
          ? { ...n, st: ST_CYCLE[(ST_CYCLE.indexOf(n.st) + 1) % ST_CYCLE.length] }
          : n
      )
      const changed = updated.find(n => n.id === id)!
      syncStatus(id, changed.sub, changed.st)
      return updated
    })
  }, [syncStatus])

  const handleAnswer = useCallback((
    nid: string,
    res: 'ok' | 'flou' | 'non',
    xpGain: number,
  ) => {
    const stMap = { ok: 'maitrise', flou: 'en_cours_assimilation', non: 'vu_en_cours' } as const
    const newStatus = stMap[res]
    setNotions(ns => {
      const notion = ns.find(n => n.id === nid)
      if (notion) syncStatus(nid, notion.sub, newStatus)
      return ns.map(n => n.id === nid ? { ...n, st: newStatus } : n)
    })
    if (xpGain > 0) {
      setGame(g => {
        const updated = { ...g, xp: g.xp + xpGain }
        return { ...updated, badges: computeNewBadges(updated, notions) }
      })
      setToast(xpGain)
    }
  }, [notions])

  const handleComplete = useCallback((
    isFlash: boolean,
    score: { ok: number; flou: number; non: number },
  ) => {
    setGame(g => {
      const xpEarned = XP_GAIN.session_complete
      const today = new Date().toISOString().slice(0, 10)
      const newStreak = isStreakBroken(g.last_session)
        ? 1
        : hasSessionToday(g.last_session)
          ? g.streak
          : g.streak + 1
      const base = {
        ...g,
        xp:             g.xp + xpEarned,
        total_sessions: g.total_sessions + 1,
        flash_sessions: isFlash ? g.flash_sessions + 1 : g.flash_sessions,
        streak:         newStreak,
        best_streak:    Math.max(g.best_streak, newStreak),
        last_session:   today,
      }
      const updated = { ...base, badges: computeNewBadges(base, notions) }
      saveStats(updated)
      // Sauvegarder la session pour la vue parent
      fetch('/api/sessions', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject:      subject,
          duration_min: time,
          xp_earned:    xpEarned,
          score_ok:     score.ok,
          score_flou:   score.flou,
          score_non:    score.non,
        }),
      }).catch(() => {})
      return updated
    })
    setToast(XP_GAIN.session_complete)
  }, [notions, saveStats, subject, time])

  const handleRequestReward = useCallback((rid: string) => {
    setGame(g => ({
      ...g,
      rewards: g.rewards.map(r => r.id === rid ? { ...r, requested: true } : r),
    }))
    saveRewardRequest(rid)
  }, [saveRewardRequest])

  return (
    <GameContext.Provider value={{
      notions, game, time, subject, toast, loaded,
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
