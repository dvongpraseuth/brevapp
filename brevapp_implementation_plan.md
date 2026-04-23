# BrevApp — Plan d'implémentation
> Dernière mise à jour : Avril 2026  
> Stack : Next.js 14 · Supabase · Vercel · React

---

## 🎯 Vision

Application mobile-first de révision brevet pour Noah (3ème, DNB 30 juin 2026).  
Gamifiée (XP · streaks · note simulée · badges · rewards monétisés).  
Architecture pensée pour être revendue à d'autres familles ensuite.

---

## 📦 Stack technique

```
Frontend   → Next.js 14 (App Router) + React + Tailwind
Backend    → Supabase (Auth + Postgres + Realtime)
Déploiement→ Vercel
IA         → Claude API (génération de questions contextuelles)
```

---

## 📁 Structure du projet

```
brevapp/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── layout.tsx
│   ├── (app)/
│   │   ├── layout.tsx          ← bottom nav mobile
│   │   ├── page.tsx            ← Home (accueil)
│   │   ├── carte/page.tsx      ← Carte des compétences
│   │   ├── session/page.tsx    ← Session de révision
│   │   ├── brevet/page.tsx     ← Dashboard brevet
│   │   └── rewards/page.tsx    ← Système de récompenses
│   ├── api/
│   │   ├── questions/route.ts  ← Génération questions Claude
│   │   └── progress/route.ts   ← Sync progression
│   └── layout.tsx
│
├── components/
│   ├── ui/                     ← shadcn/ui
│   ├── game/
│   │   ├── XpBar.tsx
│   │   ├── Ring.tsx            ← Status ring SVG
│   │   ├── XpToast.tsx
│   │   └── BadgeGrid.tsx
│   ├── carte/
│   │   ├── SubjectTabs.tsx
│   │   ├── DomainTree.tsx
│   │   └── StatusBadge.tsx
│   └── session/
│       ├── QuestionCard.tsx
│       └── SessionResult.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── programme.ts            ← JSON programme EN (158 notions)
│   ├── gamification.ts         ← XP, niveaux, badges, note simulée
│   └── types.ts
│
├── supabase/
│   └── migrations/
│       ├── 001_users.sql
│       ├── 002_progress.sql
│       ├── 003_sessions.sql
│       └── 004_rewards.sql
│
└── data/
    └── programme_brevet_2026.json   ← Source : fichier Excel validé
```

---

## 🗄️ Schéma base de données

```sql
-- Profils utilisateurs
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id),
  name        TEXT NOT NULL,
  role        TEXT DEFAULT 'student' CHECK (role IN ('student','parent')),
  parent_id   UUID REFERENCES profiles(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Progression par notion
CREATE TABLE progress (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  notion_id  TEXT NOT NULL,        -- ex: 'm01', 'f03'
  subject    TEXT NOT NULL,        -- maths, francais, histoire, sciences
  status     TEXT DEFAULT 'non_vu'
             CHECK (status IN ('non_vu','vu_en_cours','en_cours_assimilation','maitrise')),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, notion_id)
);

-- Sessions de révision
CREATE TABLE sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subject       TEXT NOT NULL,
  duration_min  INT NOT NULL,
  xp_earned     INT DEFAULT 0,
  score_ok      INT DEFAULT 0,
  score_flou    INT DEFAULT 0,
  score_non     INT DEFAULT 0,
  completed_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Statistiques de gamification
CREATE TABLE game_stats (
  user_id        UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  xp             INT DEFAULT 0,
  streak         INT DEFAULT 0,
  last_session   DATE,
  best_streak    INT DEFAULT 0,
  total_sessions INT DEFAULT 0,
  flash_sessions INT DEFAULT 0,
  badges         TEXT[] DEFAULT '{}',
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Objectifs de récompenses
CREATE TABLE rewards (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  label       TEXT NOT NULL,
  cost_xp     INT NOT NULL,
  requested   BOOLEAN DEFAULT FALSE,
  approved    BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

```sql
-- RLS : chaque user voit uniquement ses données
ALTER TABLE progress    ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_stats  ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards     ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_data" ON progress   USING (auth.uid() = user_id);
CREATE POLICY "own_data" ON sessions   USING (auth.uid() = user_id);
CREATE POLICY "own_data" ON game_stats USING (auth.uid() = user_id);
CREATE POLICY "own_data" ON rewards    USING (auth.uid() = user_id);

-- Parent voit les données de son enfant
CREATE POLICY "parent_sees_child" ON progress
  USING (user_id IN (
    SELECT id FROM profiles WHERE parent_id = auth.uid()
  ));
```

---

## 🎮 Logique de gamification (lib/gamification.ts)

```typescript
export const LEVELS = [
  { min:0,    name:'Novice',       emoji:'🌱' },
  { min:150,  name:'Apprenti',     emoji:'📝' },
  { min:400,  name:'Studieux',     emoji:'📚' },
  { min:800,  name:'Appliqué',     emoji:'⚡' },
  { min:1300, name:'Avancé',       emoji:'🧠' },
  { min:2000, name:'Expert',       emoji:'🔥' },
  { min:3000, name:'Brevet Ready', emoji:'🎯' },
  { min:4500, name:'As du Brevet', emoji:'🏆' },
];

export const XP = { ok:30, flou:10, session_complete:50 };

export const MILESTONES = [
  { xp:500,  euros:5,  label:'Bon départ 🥉' },
  { xp:1500, euros:15, label:'Sérieux 🥈'    },
  { xp:3000, euros:30, label:'Engagé 🥇'     },
  { xp:5000, euros:50, label:'Brevet Ready 🏆'},
];

// Note estimée sur 20 basée sur les notions maîtrisées
export function getNoteEstimee(progress: Progress[], subjectId: string): number {
  const sn = progress.filter(p => p.subject === subjectId && p.priority === 1);
  if (!sn.length) return 0;
  const score = sn.reduce((acc, p) => acc + (
    p.status==='maitrise' ? 1 :
    p.status==='en_cours_assimilation' ? 0.55 :
    p.status==='vu_en_cours' ? 0.25 : 0
  ), 0);
  return Math.round(score / sn.length * 200) / 10;
}
```

---

## 🤖 Génération de questions par Claude (app/api/questions/route.ts)

```typescript
import Anthropic from '@anthropic-ai/sdk';

export async function POST(req: Request) {
  const { notionId, notionLabel, domain, subject } = await req.json();

  const client = new Anthropic();
  const response = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: `Tu es un professeur de 3ème préparant un élève au brevet DNB 2026.
      
Génère 1 question de révision sur la notion suivante :
- Matière : ${subject}
- Domaine : ${domain}  
- Notion : ${notionLabel}

Format JSON strict :
{
  "question": "...",
  "reponse": "...",
  "conseil": "..." 
}

La question doit être concise (2-3 lignes max).
La réponse doit être claire, avec la méthode si applicable.
Le conseil = astuce mnémotechnique ou piège à éviter.`
    }]
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const data = JSON.parse(text.replace(/```json|```/g, '').trim());
  return Response.json(data);
}
```

---

## 📱 PWA (Progressive Web App)

Pour que Noah puisse l'installer sur son téléphone comme une vraie app :

```json
// public/manifest.json
{
  "name": "BrevApp",
  "short_name": "BrevApp",
  "description": "Révisions brevet DNB 2026",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#F8F7F3",
  "theme_color": "#1C1917",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

---

## 🚀 Roadmap

### Semaine 1 — Infrastructure (J1-J3)
- [ ] `npx create-next-app@latest brevapp`
- [ ] Setup Supabase projet → créer les 4 tables + RLS
- [ ] Auth magic link (email) → Noah se connecte sans mdp
- [ ] Déployer sur Vercel → URL partageable

### Semaine 1 — Core features (J4-J7)
- [ ] Intégrer le JSON programme (158 notions)
- [ ] Page Carte → arborescence + cycle de statut
- [ ] Sync Supabase realtime (progression sauvegardée)
- [ ] Page Session → questions statiques du POC

### Semaine 2 — Gamification
- [ ] XP + niveaux + streaks persistés en BDD
- [ ] Note simulée brevet temps réel
- [ ] Badges → déclenchés côté serveur
- [ ] Page Rewards → objectifs + validation parent

### Semaine 2 — Claude API
- [ ] Route /api/questions → génération dynamique par notion
- [ ] Fallback questions statiques si API down
- [ ] Cache questions générées dans Supabase

### Semaine 3 — Polish
- [ ] PWA → installable sur mobile Noah
- [ ] Vue parent (David) → dashboard progression Noah
- [ ] Notifications push → rappel streak quotidien
- [ ] Intégration iCal Pronote → matières du jour auto

### V2 (Mai+)
- [ ] Multi-utilisateurs → potes de Noah
- [ ] Leaderboard hebdo
- [ ] Programme complet toutes matières (à partir du xlsx validé)
- [ ] Monétisation → 9€/mois autres familles

---

## ⚙️ Commandes de démarrage

```bash
# Init projet
npx create-next-app@latest brevapp --typescript --tailwind --app
cd brevapp

# Dépendances
npm install @supabase/ssr @supabase/supabase-js @anthropic-ai/sdk

# Variables d'env (.env.local)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ANTHROPIC_API_KEY=...

# Dev
npm run dev

# Deploy
vercel --prod
```

---

## 📎 Fichiers à récupérer du POC

| Fichier POC | Destination projet |
|---|---|
| `brevapp_poc.jsx` | Diviser en composants dans `components/` |
| `programme_brevet_2026.json` | `data/programme_brevet_2026.json` |
| `BrevApp_Programme_Brevet_2026.xlsx` | Référence pour validation |

---

## 💡 Notes importantes

- **Auth** : magic link email — pas de mot de passe pour Noah
- **RLS** : toujours actif — Noah ne voit que ses données
- **Claude API** : questions générées à la volée par notion → contenu infini
- **Streak** : calculé à la connexion quotidienne, pas à chaque session
- **Note simulée** : uniquement notions priorité 1 (🔴) dans le calcul
- **Rewards** : David approuve manuellement depuis sa vue parent
