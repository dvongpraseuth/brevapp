# BrevApp — Spécification technique

> Version 1.0 — 26 avril 2026

---

## 1. Stack

| Couche | Technologie | Version |
|---|---|---|
| Framework | Next.js App Router | 14.2.5 |
| Langage | TypeScript (strict) | 5.x |
| Styles | Tailwind CSS | 3.x |
| Base de données | Supabase (Postgres) | — |
| Auth | Supabase Auth (magic link) | — |
| LLM (questions) | Groq SDK / llama-3.3-70b-versatile | 0.9.x |
| Déploiement | Vercel | — |
| PWA | manifest.json + icônes PNG | — |

**Contraintes TypeScript :**
- `strict: true` — pas de `any`
- `typedRoutes: true` dans next.config.js → les hrefs doivent utiliser `type Route from 'next'`
- `resolveJsonModule: true` → import direct du JSON programme

---

## 2. Structure des fichiers

```
brevapp/
├── app/
│   ├── (app)/               ← pages authentifiées (layout bottom nav)
│   │   ├── layout.tsx       ← bottom nav (Accueil, Carte, Session, Brevet, Rewards)
│   │   ├── page.tsx         ← Accueil
│   │   ├── carte/page.tsx
│   │   ├── session/page.tsx
│   │   ├── brevet/page.tsx
│   │   └── rewards/page.tsx
│   ├── auth/login/page.tsx
│   ├── parent/
│   │   ├── page.tsx         ← Server component (fetches child data)
│   │   ├── ParentSetup.tsx  ← Client component (formulaire liaison)
│   │   └── RewardActions.tsx← Client component (boutons valider/refuser)
│   └── api/
│       ├── questions/route.ts    ← POST — génération Groq
│       ├── stats/route.ts        ← GET+POST — game_stats
│       ├── rewards/route.ts      ← PATCH — Noah demande un reward
│       ├── sessions/route.ts     ← GET+POST — historique sessions
│       ├── progress/route.ts     ← PATCH — sync statut notion
│       ├── parent/route.ts       ← POST — liaison parent/enfant
│       └── parent/rewards/route.ts ← PATCH — parent approuve/refuse
├── components/
│   ├── game/                ← XpBar, Ring, XpToast, BadgeGrid
│   ├── carte/               ← DomainTree, StatusBadge, SubjectTabs
│   ├── session/             ← QuestionCard, SessionResult
│   └── ui/                  ← Card
├── lib/
│   ├── types.ts             ← Notion, GameStats, Reward, SessionResult
│   ├── constants.ts         ← T (thème), SUBJ, ST_CFG, ST_CYCLE, EXAM, QS, INIT_REWARDS
│   ├── programme.ts         ← NOTIONS (import JSON + default st:'non_vu')
│   ├── gamification.ts      ← LEVELS, BADGES, XP_GAIN, MILESTONES + fonctions
│   ├── game-context.tsx     ← GameProvider, useGame
│   ├── supabase/
│   │   ├── client.ts        ← createClient() côté client
│   │   └── server.ts        ← createClient() côté serveur (cookies)
│   └── hooks/
│       ├── useProgressSync.ts   ← sync notion status → Supabase
│       └── useStatsSync.ts      ← load/save game_stats + rewards
└── data/
    └── programme_brevet_2026.json  ← 163 notions (sans le champ st)
```

---

## 3. Base de données Supabase

Projet ID : `injywewfqdrutgjocwgh`

### 3.1 Table `profiles`
| Colonne | Type | Contrainte |
|---|---|---|
| `id` | uuid | PK, FK → auth.users.id |
| `name` | text | — |
| `role` | text | CHECK IN ('student', 'parent'), DEFAULT 'student' |
| `parent_id` | uuid | FK → profiles.id, nullable |
| `created_at` | timestamptz | DEFAULT now() |
| `updated_at` | timestamptz | DEFAULT now() |

### 3.2 Table `progress`
| Colonne | Type | Contrainte |
|---|---|---|
| `id` | uuid | PK, DEFAULT gen_random_uuid() |
| `user_id` | uuid | FK → profiles.id |
| `notion_id` | text | — |
| `subject` | text | CHECK IN ('maths','francais','histoire','sciences') |
| `status` | text | CHECK IN ('non_vu','vu_en_cours','en_cours_assimilation','maitrise'), DEFAULT 'non_vu' |
| `updated_at` | timestamptz | DEFAULT now() |

### 3.3 Table `game_stats`
| Colonne | Type | Contrainte |
|---|---|---|
| `user_id` | uuid | PK, FK → profiles.id |
| `xp` | int | DEFAULT 0, CHECK ≥ 0 |
| `streak` | int | DEFAULT 0, CHECK ≥ 0 |
| `best_streak` | int | DEFAULT 0 |
| `last_session` | date | nullable |
| `total_sessions` | int | DEFAULT 0 |
| `flash_sessions` | int | DEFAULT 0 |
| `badges` | text[] | DEFAULT '{}' |
| `updated_at` | timestamptz | DEFAULT now() |

### 3.4 Table `rewards`
| Colonne | Type | Contrainte |
|---|---|---|
| `id` | uuid | PK, DEFAULT gen_random_uuid() |
| `user_id` | uuid | FK → profiles.id |
| `label` | text | — |
| `cost_xp` | int | CHECK > 0 |
| `requested` | bool | DEFAULT false |
| `approved` | bool | DEFAULT false |
| `approved_at` | timestamptz | nullable |
| `created_at` | timestamptz | DEFAULT now() |

### 3.5 Table `sessions`
| Colonne | Type | Contrainte |
|---|---|---|
| `id` | uuid | PK, DEFAULT gen_random_uuid() |
| `user_id` | uuid | FK → profiles.id |
| `subject` | text | — |
| `duration_min` | int | CHECK > 0 |
| `xp_earned` | int | DEFAULT 0 |
| `score_ok` | int | DEFAULT 0 |
| `score_flou` | int | DEFAULT 0 |
| `score_non` | int | DEFAULT 0 |
| `completed_at` | timestamptz | DEFAULT now() |

### 3.6 RLS (Row Level Security)
Toutes les tables ont RLS activé. Politiques :
- **student** : peut lire/écrire uniquement ses propres lignes (`auth.uid() = user_id` ou `auth.uid() = id`)
- **parent** : peut lire les données de son enfant via policies `parent_sees_child_*` (join sur `profiles.parent_id`)
- **parent rewards update** : géré via service role côté `/api/parent/rewards` (RLS ne couvre pas UPDATE parent→enfant)

### 3.7 Trigger automatique
À chaque inscription (`auth.users INSERT`) :
```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```
La fonction crée : `profiles` + `game_stats` (xp=0) + 4 `rewards` par défaut.

---

## 4. APIs Route Handlers

### Règle générale
- Toujours `getUser()` (jamais `getSession()`) côté serveur
- Erreur 401 si non authentifié
- `try/catch` avec 500 en cas d'erreur Supabase

### `POST /api/questions`
**Entrée :** `{ notionId, notionLabel, domain, subject }`
**Sortie :** `{ notionId, question, reponse, conseil }`
- Appel Groq llama-3.3-70b-versatile, `response_format: { type: 'json_object' }`
- Fallback sur `QS` (14 questions statiques) si Groq échoue
- Pas d'authentification requise (questions non personnalisées)

### `GET /api/stats`
**Sortie :** `{ stats: GameStats, rewards: Reward[] }`

### `POST /api/stats`
**Entrée :** champs de `GameStats` sans `user_id`
- Upsert sur `game_stats` avec `onConflict: 'user_id'`

### `PATCH /api/rewards`
**Entrée :** `{ id, requested: true }`
- Noah demande un reward (update `requested = true`)
- Vérifie `user_id = auth.uid()`

### `GET /api/sessions`
**Sortie :** 20 dernières sessions de l'utilisateur connecté, ordre desc

### `POST /api/sessions`
**Entrée :** `{ subject, duration_min, xp_earned, score_ok, score_flou, score_non }`
- Insert dans `sessions`

### `POST /api/parent`
**Entrée :** `{ childEmail }`
- Met à jour `profiles.role = 'parent'` pour l'utilisateur courant
- Met à jour `profiles.parent_id` de l'enfant (trouvé par email via service role)

### `PATCH /api/parent/rewards`
**Entrée :** `{ rewardId, approved: boolean }`
- Vérifie que l'utilisateur est `role = 'parent'`
- Trouve l'enfant via `profiles.parent_id = user.id`
- Si `approved: true` → `{ approved: true, approved_at: now() }`
- Si `approved: false` → `{ requested: false, approved: false, approved_at: null }`
- Utilise le service role (SUPABASE_SERVICE_ROLE_KEY) pour contourner RLS

---

## 5. Génération de questions (Groq)

**Modèle :** `llama-3.3-70b-versatile`
**Mode :** `response_format: { type: 'json_object' }` — garantit un JSON valide en sortie
**Prompt système :** "Tu es un professeur de 3ème expert en préparation au brevet DNB 2026."
**Stratégie de prefetch :** la session précharge la question N+1 pendant que l'élève répond à N (pattern `useRef` + cache `Record<string, DynQuestion>`)

**Fallback (si Groq down) :** 14 questions statiques dans `constants.ts → QS`, cherchées par `notion_id`.

---

## 6. Logique gamification (`lib/gamification.ts`)

### Streak (règle exacte)
```typescript
// Dans handleComplete (game-context.tsx)
const newStreak = isStreakBroken(g.last_session)
  ? 1                              // reset → repart à 1
  : hasSessionToday(g.last_session)
    ? g.streak                     // déjà joué aujourd'hui → inchangé
    : g.streak + 1                 // nouveau jour → +1

// isStreakBroken : last_session ≠ aujourd'hui ET ≠ hier
// hasSessionToday : last_session = aujourd'hui (comparaison YYYY-MM-DD)
```

### Note simulée (par matière)
```typescript
// Notions p=1 uniquement
score = Σ (maitrise:1 | en_cours:0.55 | vu:0.25 | non_vu:0)
note = round(score / nb_notions_p1 * 200) / 10  // sur 20, 1 décimale
```

### last_session
Stocké en type `date` Postgres (format `YYYY-MM-DD`) — ne pas stocker un timestamp complet.

---

## 7. État client (GameContext)

`GameProvider` gère l'état React global :
- `notions` : tableau de toutes les notions avec leur statut courant
- `game` : `GameStats & { rewards: Reward[] }`
- `loaded` : booléen, true une fois les stats chargées depuis Supabase

Hooks internes :
- `useProgressSync` : sync bi-directionnelle statuts notions ↔ Supabase
- `useStatsSync` : chargement initial des stats + sauvegarde après chaque session

Le statut des notions est **fusionné** au chargement : `NOTIONS` (défaut `non_vu`) + données `progress` Supabase.

---

## 8. PWA

- `public/manifest.json` : name, short_name, start_url, display: standalone, orientation: portrait, lang: fr, categories: [education]
- Icônes : `icon-192.png` et `icon-512.png` (fond `#1C1917`, générées via `scripts/generate-icons.mjs`)
- Meta `viewport` et `theme-color` dans les layouts

---

## 9. Variables d'environnement

| Variable | Côté | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | client+serveur | URL API Supabase (`https://[id].supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client+serveur | Clé publique Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | serveur uniquement | Clé admin Supabase — jamais exposée côté client |
| `GROQ_API_KEY` | serveur uniquement | Clé API Groq (partagée avec Serge Bot) |

---

## 10. Déploiement

- **Plateforme :** Vercel (projet `brevapp`)
- **URL prod :** https://brevapp-rust.vercel.app
- **Env vars :** configurées via `vercel env add` ou dashboard Vercel
- **Build :** `next build` — TypeScript + ESLint exécutés à chaque déploiement
- **Région :** Washington D.C. (iad1) — Supabase EU, latence acceptable

---

## 11. Règles de sécurité absolues

1. `SUPABASE_SERVICE_ROLE_KEY` uniquement dans les Route Handlers serveur
2. `getUser()` côté serveur — jamais `getSession()` (attaquable)
3. RLS activé sur toutes les tables
4. Validation des paramètres d'entrée dans les routes parent (vérification role, vérification ownership)
5. `GROQ_API_KEY` uniquement côté serveur (jamais dans les composants `'use client'`)
