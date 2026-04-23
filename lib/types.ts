export type Status = 'non_vu' | 'vu_en_cours' | 'en_cours_assimilation' | 'maitrise'
export type Subject = 'maths' | 'francais' | 'histoire' | 'sciences'

export interface Notion {
  id: string
  sub: Subject
  dom: string
  label: string
  p: 1 | 2  // priorité brevet
  st: Status
}

export interface GameStats {
  user_id: string
  xp: number
  streak: number
  best_streak: number
  last_session: string | null
  total_sessions: number
  flash_sessions: number
  badges: string[]
}

export interface Reward {
  id: string
  user_id: string
  label: string
  cost_xp: number
  requested: boolean
  approved: boolean
}

export interface SessionResult {
  ok: number
  flou: number
  non: number
  xp_earned: number
  duration_min: number
}
