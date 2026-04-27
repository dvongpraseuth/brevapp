import type { Reward } from './types'
export { NOTIONS } from './programme'

// ─── THEME ────────────────────────────────────────────────────────────────────
export const T = {
  bg: '#F8F7F3', card: '#FFFFFF', border: '#E8E5DC',
  text: '#1C1917', muted: '#78716C', faint: '#D6D3CA',
  ok: '#15803D', okBg: '#F0FDF4', okBorder: '#BBF7D0',
  wip: '#B45309', wipBg: '#FFFBEB', wipBorder: '#FDE68A',
  seen: '#1D4ED8', seenBg: '#EFF6FF', seenBorder: '#BFDBFE',
  none: '#9CA3AF', noneBg: '#F9FAFB', noneBorder: '#E5E7EB',
  xp: '#7C3AED', streak: '#EA580C', reward: '#0369A1',
}

// ─── SUJETS ───────────────────────────────────────────────────────────────────
export const SUBJ = [
  { id: 'maths',    e: '📐', label: 'Maths',     acc: '#1D4ED8', pts: 100 },
  { id: 'francais', e: '📖', label: 'Français',  acc: '#BE185D', pts: 100 },
  { id: 'histoire', e: '🌍', label: 'Hist.-Géo', acc: '#B45309', pts: 50  },
  { id: 'sciences', e: '🔬', label: 'Sciences',  acc: '#0F766E', pts: 50  },
] as const

// ─── STATUTS ──────────────────────────────────────────────────────────────────
export const ST_CFG = {
  non_vu:                { label: 'Non vu',   pct: 0,    c: T.none, bg: T.noneBg, border: T.noneBorder },
  vu_en_cours:           { label: 'Vu',       pct: 0.33, c: T.seen, bg: T.seenBg, border: T.seenBorder },
  en_cours_assimilation: { label: 'En cours', pct: 0.66, c: T.wip,  bg: T.wipBg,  border: T.wipBorder  },
  maitrise:              { label: 'Maîtrisé', pct: 1,    c: T.ok,   bg: T.okBg,   border: T.okBorder   },
} as const

export const ST_CYCLE = ['non_vu', 'vu_en_cours', 'en_cours_assimilation', 'maitrise'] as const

// ─── EXAMENS ──────────────────────────────────────────────────────────────────
export const EXAM = {
  oral:     new Date('2026-05-15'),
  francais: new Date('2026-06-26'),
  histoire: new Date('2026-06-29'),
  maths:    new Date('2026-06-30'),
}

export const START = new Date('2026-04-17')

export const daysLeft = (d: Date) => Math.max(0, Math.ceil((d.getTime() - Date.now()) / 864e5))

export const TOTAL_D = (EXAM.maths.getTime() - START.getTime()) / 864e5
export const ELAPSED = Math.min(TOTAL_D, (Date.now() - START.getTime()) / 864e5)

// ─── QUESTIONS ────────────────────────────────────────────────────────────────
export const QS = [
  { id: 'q1',  nid: 'm26', q: 'Comment calcule-t-on cos(A)\ndans un triangle rectangle ?',      a: 'cos(A) = côté adjacent / hypoténuse\n\n💡 SOH-CAH-TOA\nSin=Opp/Hyp · Cos=Adj/Hyp · Tan=Opp/Adj' },
  { id: 'q2',  nid: 'm06', q: 'Développe (a + b)²',                                              a: 'a² + 2ab + b²\n\nEx : (x+3)² = x²+6x+9' },
  { id: 'q3',  nid: 'm09', q: 'Factorise : 6x² + 4x',                                           a: '2x(3x + 2)\nFacteur commun = 2x' },
  { id: 'q4',  nid: 'm23', q: 'Complète le théorème de Thalès :\nSi MN // BC, AM/AB = … = …',  a: 'AM/AB = AN/AC = MN/BC' },
  { id: 'q5',  nid: 'm20', q: '3 rouges + 2 bleues, sans remise.\nP(tirer 2 rouges) = ?',       a: "3/5 × 2/4 = 6/20 = 3/10\nOn multiplie les branches de l'arbre" },
  { id: 'q6',  nid: 'm29', q: 'Cathètes = 3 et 4.\nCalcule l\'hypoténuse.',                     a: 'h² = 9+16 = 25\nh = 5 🔥 Triple 3-4-5' },
  { id: 'q7',  nid: 'm10', q: 'Résous : 3x − 5 = 7 + x',                                       a: '2x = 12\nx = 6' },
  { id: 'q8',  nid: 'm13', q: 'f(x) = 2x² − 3\nImage de 4 ? Antécédent de 29 ?',              a: 'f(4) = 29\nAntécédent : x² = 16 → x = ±4' },
  { id: 'q9',  nid: 'f06', q: 'Quelle est la fonction de la\nsubordonnée relative ?',            a: 'Complément du nom (antécédent)\nIntroduite par qui, que, dont, où\n\nEx : "Le livre que je lis" → que je lis = subordonnée relative' },
  { id: 'q10', nid: 'h01', q: 'Cite 2 causes directes\nde la 1ère Guerre mondiale.',             a: '1. Assassinat de François-Ferdinand (28 juin 1914)\n2. Jeu des alliances — engrenage automatique' },
  { id: 'q11', nid: 'h02', q: 'Cite 2 traits communs\ndes régimes totalitaires.',               a: '1. Parti unique + culte du chef\n2. Propagande + terreur d\'État' },
  { id: 'q12', nid: 's06', q: "Qu'est-ce qu'un gène ?",                                         a: "Séquence d'ADN portant l'information\npour la synthèse d'une protéine\n\nLocalisé sur un chromosome" },
  { id: 'q13', nid: 'f09', q: 'Accord sujet-verbe :\n"L\'ensemble des élèves … parti(s)"',     a: '"est parti" (accord avec "l\'ensemble", singulier)\n\nSi on insiste sur les élèves : "sont partis" (acceptable)' },
  { id: 'q14', nid: 'm17', q: 'Un prix passe de 80€ à 96€.\nCalcule le taux d\'augmentation.', a: '(96-80)/80 × 100 = 20%\nCoefficient multiplicateur = 96/80 = 1,2' },
]

// ─── REWARDS ──────────────────────────────────────────────────────────────────
export const INIT_REWARDS: Reward[] = [
  { id: 'r1', user_id: '', label: '🎮 Manette PS5',      cost_xp: 5000, requested: false, approved: false },
  { id: 'r2', user_id: '', label: '🎬 Ciné + McDo',      cost_xp: 2500, requested: false, approved: false },
  { id: 'r3', user_id: '', label: '👟 Nouvelles baskets', cost_xp: 4000, requested: false, approved: false },
  { id: 'r4', user_id: '', label: '🏖️ Week-end choisi', cost_xp: 6000, requested: false, approved: false },
]
