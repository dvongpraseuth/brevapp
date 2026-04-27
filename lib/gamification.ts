import type { Notion, GameStats } from './types'

export const LEVELS = [
  { min: 0,    name: 'Novice',       emoji: '🌱' },
  { min: 150,  name: 'Apprenti',     emoji: '📝' },
  { min: 400,  name: 'Studieux',     emoji: '📚' },
  { min: 800,  name: 'Appliqué',     emoji: '⚡' },
  { min: 1300, name: 'Avancé',       emoji: '🧠' },
  { min: 2000, name: 'Expert',       emoji: '🔥' },
  { min: 3000, name: 'Brevet Ready', emoji: '🎯' },
  { min: 4500, name: 'As du Brevet', emoji: '🏆' },
]

export const XP_GAIN = { ok: 30, flou: 10, session_complete: 50 } as const

export const MILESTONES = [
  { xp: 500,  euros: 5,  label: 'Bon départ 🥉' },
  { xp: 1500, euros: 15, label: 'Sérieux 🥈'    },
  { xp: 3000, euros: 30, label: 'Engagé 🥇'     },
  { xp: 5000, euros: 50, label: 'Brevet Ready 🏆'},
]

export const BADGES = [
  { id: 'first',   emoji: '⚡', name: '1ère session',    check: (g: GameStats) => g.total_sessions >= 1 },
  { id: 'streak3', emoji: '🔥', name: '3 jours de feu',  check: (g: GameStats) => g.streak >= 3 },
  { id: 'streak7', emoji: '💥', name: 'Semaine de feu',  check: (g: GameStats) => g.streak >= 7 },
  { id: 'sniper',  emoji: '🎯', name: 'Sniper',          check: (g: GameStats) => g.best_streak >= 5 },
  { id: 'flash',   emoji: '⏱️', name: 'Flash session',   check: (g: GameStats) => g.flash_sessions >= 1 },
  { id: 'lv3',     emoji: '📚', name: 'Niveau Studieux', check: (g: GameStats) => g.xp >= 400 },
  { id: 'lv5',     emoji: '🧠', name: 'Niveau Avancé',   check: (g: GameStats) => g.xp >= 1300 },
]

export function getLevel(xp: number) {
  let lv = 0
  for (let i = 0; i < LEVELS.length; i++) if (xp >= LEVELS[i].min) lv = i
  return lv
}

export function getNextXp(xp: number) {
  const lv = getLevel(xp)
  return lv < LEVELS.length - 1 ? LEVELS[lv + 1].min : 9999
}

export function getNoteEstimee(notions: Notion[], subjectId: string): number {
  const sn = notions.filter(n => n.sub === subjectId && n.p === 1)
  if (!sn.length) return 0
  const score = sn.reduce((acc, n) =>
    acc + (n.st === 'maitrise' ? 1
         : n.st === 'en_cours_assimilation' ? 0.55
         : n.st === 'vu_en_cours' ? 0.25 : 0), 0)
  return Math.round(score / sn.length * 200) / 10
}

export function getEarnedEuros(xp: number): number {
  return MILESTONES.filter(m => m.xp <= xp).reduce((acc, m) => acc + m.euros, 0)
}

export function computeNewBadges(stats: GameStats, notions: Notion[]): string[] {
  const newBadges = [...stats.badges]
  BADGES.forEach(b => {
    if (!newBadges.includes(b.id) && b.check(stats)) newBadges.push(b.id)
  })
  return newBadges
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

function dateStr(d: string): string {
  return d.slice(0, 10)
}

export function isStreakBroken(lastSession: string | null): boolean {
  if (!lastSession) return false
  const last = dateStr(lastSession)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  return last !== todayStr() && last !== yesterday.toISOString().slice(0, 10)
}

export function hasSessionToday(lastSession: string | null): boolean {
  if (!lastSession) return false
  return dateStr(lastSession) === todayStr()
}
