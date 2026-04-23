import type { Notion, Reward } from './types'

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

// ─── PROGRAMME (extrait représentatif) ───────────────────────────────────────
export const NOTIONS: Notion[] = [
  // MATHS - Nombres & Calcul
  { id: 'm01', sub: 'maths', dom: 'Nombres & Calcul', label: 'Fractions',             p: 1, st: 'maitrise' },
  { id: 'm02', sub: 'maths', dom: 'Nombres & Calcul', label: 'Puissances',            p: 1, st: 'maitrise' },
  { id: 'm03', sub: 'maths', dom: 'Nombres & Calcul', label: 'Notation scientifique', p: 1, st: 'vu_en_cours' },
  { id: 'm04', sub: 'maths', dom: 'Nombres & Calcul', label: 'Racines carrées',       p: 1, st: 'vu_en_cours' },
  { id: 'm05', sub: 'maths', dom: 'Nombres & Calcul', label: 'Distributivité',        p: 1, st: 'maitrise' },
  { id: 'm06', sub: 'maths', dom: 'Nombres & Calcul', label: 'Identité (a+b)²',       p: 1, st: 'vu_en_cours' },
  { id: 'm07', sub: 'maths', dom: 'Nombres & Calcul', label: 'Identité (a-b)²',       p: 1, st: 'non_vu' },
  { id: 'm08', sub: 'maths', dom: 'Nombres & Calcul', label: 'Identité (a+b)(a-b)',   p: 1, st: 'non_vu' },
  { id: 'm09', sub: 'maths', dom: 'Nombres & Calcul', label: 'Factorisation',         p: 1, st: 'en_cours_assimilation' },
  { id: 'm10', sub: 'maths', dom: 'Nombres & Calcul', label: 'Équation 1er degré',    p: 1, st: 'en_cours_assimilation' },
  { id: 'm11', sub: 'maths', dom: 'Nombres & Calcul', label: 'Équation produit A×B=0', p: 1, st: 'non_vu' },
  { id: 'm12', sub: 'maths', dom: 'Nombres & Calcul', label: 'Mise en équation',      p: 1, st: 'non_vu' },
  // MATHS - Fonctions
  { id: 'm13', sub: 'maths', dom: 'Fonctions', label: 'Image & antécédent',    p: 1, st: 'vu_en_cours' },
  { id: 'm14', sub: 'maths', dom: 'Fonctions', label: 'Tableau de valeurs',    p: 1, st: 'maitrise' },
  { id: 'm15', sub: 'maths', dom: 'Fonctions', label: 'Fonction affine ax+b',  p: 1, st: 'non_vu' },
  { id: 'm16', sub: 'maths', dom: 'Fonctions', label: 'Lire un graphe',        p: 1, st: 'maitrise' },
  { id: 'm17', sub: 'maths', dom: 'Fonctions', label: 'Pourcentages',          p: 1, st: 'maitrise' },
  // MATHS - Probabilités
  { id: 'm18', sub: 'maths', dom: 'Probabilités', label: 'Notion de probabilité', p: 1, st: 'maitrise' },
  { id: 'm19', sub: 'maths', dom: 'Probabilités', label: 'Calcul de probabilité', p: 1, st: 'maitrise' },
  { id: 'm20', sub: 'maths', dom: 'Probabilités', label: 'Arbre de probabilités',  p: 1, st: 'vu_en_cours' },
  { id: 'm21', sub: 'maths', dom: 'Probabilités', label: 'Tableau croisé',         p: 1, st: 'non_vu' },
  { id: 'm22', sub: 'maths', dom: 'Statistiques', label: 'Moyenne & médiane',      p: 1, st: 'maitrise' },
  // MATHS - Géométrie
  { id: 'm23', sub: 'maths', dom: 'Géométrie', label: 'Thalès — énoncé',       p: 1, st: 'vu_en_cours' },
  { id: 'm24', sub: 'maths', dom: 'Géométrie', label: 'Thalès — longueur',     p: 1, st: 'en_cours_assimilation' },
  { id: 'm25', sub: 'maths', dom: 'Géométrie', label: 'Réciproque Thalès',     p: 1, st: 'non_vu' },
  { id: 'm26', sub: 'maths', dom: 'Géométrie', label: 'Trigo — cos/sin/tan',   p: 1, st: 'vu_en_cours' },
  { id: 'm27', sub: 'maths', dom: 'Géométrie', label: 'Trigo — longueur',      p: 1, st: 'non_vu' },
  { id: 'm28', sub: 'maths', dom: 'Géométrie', label: 'Trigo — angle',         p: 1, st: 'non_vu' },
  { id: 'm29', sub: 'maths', dom: 'Géométrie', label: 'Pythagore',             p: 1, st: 'maitrise' },
  { id: 'm30', sub: 'maths', dom: 'Géométrie', label: 'Réciproque Pythagore',  p: 1, st: 'vu_en_cours' },
  { id: 'm31', sub: 'maths', dom: 'Géométrie', label: 'Volumes solides',       p: 1, st: 'non_vu' },
  // MATHS - Algo
  { id: 'm32', sub: 'maths', dom: 'Algorithmique', label: 'Variables & conditions', p: 1, st: 'non_vu' },
  { id: 'm33', sub: 'maths', dom: 'Algorithmique', label: 'Boucles',                p: 1, st: 'non_vu' },
  { id: 'm34', sub: 'maths', dom: 'Algorithmique', label: 'Lire un algorithme',     p: 1, st: 'non_vu' },
  // FRANÇAIS
  { id: 'f01', sub: 'francais', dom: 'Lecture',     label: 'Comprendre un texte',     p: 1, st: 'vu_en_cours' },
  { id: 'f02', sub: 'francais', dom: 'Lecture',     label: 'Narrateur & point de vue', p: 1, st: 'en_cours_assimilation' },
  { id: 'f03', sub: 'francais', dom: 'Lecture',     label: 'Procédés stylistiques',    p: 1, st: 'non_vu' },
  { id: 'f04', sub: 'francais', dom: 'Lecture',     label: 'Texte argumentatif',       p: 1, st: 'non_vu' },
  { id: 'f05', sub: 'francais', dom: 'Grammaire',   label: 'Fonctions grammaticales',  p: 1, st: 'maitrise' },
  { id: 'f06', sub: 'francais', dom: 'Grammaire',   label: 'Subordonnée relative',     p: 1, st: 'vu_en_cours' },
  { id: 'f07', sub: 'francais', dom: 'Grammaire',   label: 'Subordonnée complétive',   p: 1, st: 'non_vu' },
  { id: 'f08', sub: 'francais', dom: 'Grammaire',   label: 'Discours direct/indirect', p: 1, st: 'non_vu' },
  { id: 'f09', sub: 'francais', dom: 'Orthographe', label: 'Accord sujet-verbe',       p: 1, st: 'maitrise' },
  { id: 'f10', sub: 'francais', dom: 'Orthographe', label: 'Accord participe passé',   p: 1, st: 'non_vu' },
  { id: 'f11', sub: 'francais', dom: 'Orthographe', label: 'Subjonctif présent',        p: 1, st: 'non_vu' },
  { id: 'f12', sub: 'francais', dom: 'Rédaction',   label: 'Texte narratif',            p: 1, st: 'en_cours_assimilation' },
  { id: 'f13', sub: 'francais', dom: 'Rédaction',   label: 'Paragraphe argumenté',      p: 1, st: 'non_vu' },
  { id: 'f14', sub: 'francais', dom: 'Rédaction',   label: 'Réécrire un texte',         p: 1, st: 'non_vu' },
  // HISTOIRE
  { id: 'h01', sub: 'histoire', dom: 'Histoire',   label: '1ère Guerre mondiale',    p: 1, st: 'maitrise' },
  { id: 'h02', sub: 'histoire', dom: 'Histoire',   label: 'Régimes totalitaires',    p: 1, st: 'maitrise' },
  { id: 'h03', sub: 'histoire', dom: 'Histoire',   label: '2e Guerre mondiale',      p: 1, st: 'vu_en_cours' },
  { id: 'h04', sub: 'histoire', dom: 'Histoire',   label: 'Vichy & collaboration',   p: 1, st: 'non_vu' },
  { id: 'h05', sub: 'histoire', dom: 'Histoire',   label: 'Guerre Froide',           p: 1, st: 'non_vu' },
  { id: 'h06', sub: 'histoire', dom: 'Histoire',   label: 'Décolonisation',          p: 1, st: 'non_vu' },
  { id: 'h07', sub: 'histoire', dom: 'Géographie', label: 'Mondialisation',          p: 1, st: 'non_vu' },
  { id: 'h08', sub: 'histoire', dom: 'Géographie', label: 'Espaces urbains',         p: 1, st: 'vu_en_cours' },
  { id: 'h09', sub: 'histoire', dom: 'Géographie', label: 'Inégalités mondiales',    p: 1, st: 'non_vu' },
  { id: 'h10', sub: 'histoire', dom: 'EMC',        label: 'Institutions françaises', p: 1, st: 'non_vu' },
  { id: 'h11', sub: 'histoire', dom: 'EMC',        label: 'Droits fondamentaux',     p: 1, st: 'vu_en_cours' },
  // SCIENCES
  { id: 's01', sub: 'sciences', dom: 'Physique', label: 'Forces & mouvements',   p: 1, st: 'non_vu' },
  { id: 's02', sub: 'sciences', dom: 'Physique', label: 'Circuits électriques',  p: 1, st: 'non_vu' },
  { id: 's03', sub: 'sciences', dom: 'Physique', label: "Loi d'Ohm",             p: 1, st: 'non_vu' },
  { id: 's04', sub: 'sciences', dom: 'Chimie',   label: 'Réactions chimiques',   p: 1, st: 'non_vu' },
  { id: 's05', sub: 'sciences', dom: 'Chimie',   label: 'Acides et bases',       p: 1, st: 'non_vu' },
  { id: 's06', sub: 'sciences', dom: 'SVT',      label: 'ADN & génétique',       p: 1, st: 'vu_en_cours' },
  { id: 's07', sub: 'sciences', dom: 'SVT',      label: 'Hérédité',              p: 1, st: 'non_vu' },
  { id: 's08', sub: 'sciences', dom: 'SVT',      label: 'Évolution & sélection', p: 1, st: 'non_vu' },
  { id: 's09', sub: 'sciences', dom: 'SVT',      label: 'Système immunitaire',   p: 1, st: 'non_vu' },
  { id: 's10', sub: 'sciences', dom: 'SVT',      label: 'Écosystèmes',           p: 1, st: 'non_vu' },
]

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
