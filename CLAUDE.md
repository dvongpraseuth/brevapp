# BrevApp — Instructions Claude Code

## Contexte projet
Application mobile-first de révision brevet DNB 2026 pour Noah (3ème).
Papa = David Vongpraseuth (prof de 3ème + dev).
Stack : Next.js 14 App Router · Supabase · Vercel · TypeScript · Tailwind.

## Stack & conventions
- **Framework** : Next.js 14 App Router (jamais Pages Router)
- **BDD** : Supabase — toujours activer RLS sur chaque table
- **Auth** : Magic link email via Supabase Auth (pas de password)
- **Styles** : Tailwind CSS uniquement — pas de CSS modules, pas de styled-components
- **Types** : TypeScript strict — pas de `any`
- **Composants** : fonctionnels uniquement, hooks React

## Structure imposée
```
app/(app)/        ← pages authentifiées (layout avec bottom nav)
app/auth/         ← pages login
app/api/          ← route handlers
components/game/  ← XpBar, Ring, XpToast, BadgeGrid
components/carte/ ← DomainTree, StatusBadge, SubjectTabs
components/session/ ← QuestionCard, SessionResult
lib/gamification.ts ← logique XP, niveaux, badges, note simulée
lib/programme.ts  ← 158 notions du programme officiel EN
data/programme_brevet_2026.json ← source données
```

## Règles absolues
- **RLS toujours activé** sur toutes les tables Supabase
- **Jamais** de `SUPABASE_SERVICE_ROLE_KEY` côté client
- **Jamais** de `getSession()` côté serveur → toujours `getUser()`
- **Mobile first** — max-width 430px, bottom nav fixe
- Chaque composant = fichier séparé, pas de composants géants

## Gamification (logique métier)
```typescript
// XP par action
const XP = { ok: 30, flou: 10, session_complete: 50 }

// Note simulée = notions priorité 1 maîtrisées × pondération
// Niveaux : 0→Novice, 150→Apprenti, 400→Studieux, 800→Appliqué...

// Paliers rewards (XP → euros réels validés par David)
// 500 XP = 5€ / 1500 XP = 15€ / 3000 XP = 30€ / 5000 XP = 50€
```

## Variables d'environnement requises
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # server only — jamais exposé client
ANTHROPIC_API_KEY=           # génération questions par notion
```

## Ce que Claude Code peut faire sans demander
- Créer/modifier des fichiers dans ce repo
- Installer des dépendances npm
- Générer des migrations SQL
- Créer des composants React

## Ce que Claude Code doit demander avant de faire
- Modifier la logique de gamification (XP, niveaux, rewards)
- Changer le schéma de la base de données
- Supprimer des fichiers existants
- Toucher aux variables d'environnement

## Référence POC
Le fichier `data/brevapp_poc.jsx` contient le POC fonctionnel complet.
C'est la référence UI/UX — le découper en composants propres, pas le réécrire.
