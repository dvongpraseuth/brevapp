# BrevApp 🎯

Application mobile-first de révision gamifiée pour le Brevet DNB 2026.

## Pour Noah
- **Carte des compétences** — toutes les notions par matière, code couleur
- **Sessions de révision** — flashcards adaptées au temps disponible
- **XP + niveaux + streaks** — motivation journalière
- **Note simulée brevet** — voir sa progression en temps réel
- **Système de récompenses** — XP → euros validés par papa

## Stack
- **Frontend** : Next.js 14 App Router + Tailwind
- **Backend** : Supabase (Auth + Postgres + RLS)
- **IA** : Claude API (génération de questions)
- **Déploiement** : Vercel

## Démarrage rapide

```bash
# 1. Cloner et installer
git clone https://github.com/TON_COMPTE/brevapp.git
cd brevapp
npm install

# 2. Configurer les variables d'environnement
cp .env.local.template .env.local
# → Remplir avec les clés Supabase + Anthropic

# 3. Appliquer les migrations SQL dans Supabase
# → Copier-coller les fichiers supabase/migrations/ dans l'éditeur SQL de Supabase

# 4. Lancer en dev
npm run dev
# → http://localhost:3000
```

## Dispatcher une tâche à Claude Code

1. Ouvrir une issue GitHub avec le template "Claude Code Task"
2. Mentionner `@claude` dans le corps de l'issue
3. Claude Code lit les fichiers, code, ouvre une PR

## Structure
```
app/           ← Pages Next.js (App Router)
components/    ← Composants React
lib/           ← Logique métier (gamification, Supabase, types)
supabase/      ← Migrations SQL
data/          ← POC de référence + programme officiel EN
.github/       ← GitHub Actions (Claude Code agent + CI)
```

## Programme officiel
158 notions sur 4 matières basées sur les textes officiels Éduscol + annales DNB 2019-2025.
Fichier de référence : `BrevApp_Programme_Brevet_2026.xlsx`

---
Fait avec ❤️ par David pour Noah · Brevet le 30 juin 2026 · J-74
