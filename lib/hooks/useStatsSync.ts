'use client'

import { useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { GameStats, Reward } from '@/lib/types'
import { isStreakBroken } from '@/lib/gamification'

type OnLoad = (stats: Partial<GameStats>, rewards: Reward[]) => void

export function useStatsSync(onLoad: OnLoad) {
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      fetch('/api/stats')
        .then(r => r.json())
        .then(({ stats, rewards }) => {
          if (!stats) return
          const streak = isStreakBroken(stats.last_session) ? 0 : (stats.streak ?? 0)
          onLoad({ ...stats, streak }, rewards ?? [])
        })
        .catch(() => {})
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const saveStats = useCallback((stats: Omit<GameStats, 'user_id'>) => {
    fetch('/api/stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        xp:             stats.xp,
        streak:         stats.streak,
        best_streak:    stats.best_streak,
        last_session:   stats.last_session,
        total_sessions: stats.total_sessions,
        flash_sessions: stats.flash_sessions,
        badges:         stats.badges,
      }),
    }).catch(() => {})
  }, [])

  const saveRewardRequest = useCallback((rewardId: string) => {
    fetch('/api/rewards', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: rewardId, requested: true }),
    }).catch(() => {})
  }, [])

  return { saveStats, saveRewardRequest }
}
