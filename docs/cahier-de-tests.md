# BrevApp — Cahier de tests

> Version 1.0 — 26 avril 2026

---

## Convention

| Symbole | Signification |
|---|---|
| ✅ PASS | Comportement attendu observé |
| ❌ FAIL | Comportement incorrect |
| ⚠️ | Cas limite à surveiller |
| 🔧 | Prérequis / setup |

---

## 1. Tests unitaires — Logique gamification (`lib/gamification.ts`)

### 1.1 `isStreakBroken(lastSession)`

| ID | Entrée | Attendu | Justification |
|---|---|---|---|
| U-STR-01 | `null` | `false` | Pas encore joué → pas cassé |
| U-STR-02 | Aujourd'hui (YYYY-MM-DD) | `false` | Déjà joué aujourd'hui |
| U-STR-03 | Hier (YYYY-MM-DD) | `false` | Joué hier → streak intact |
| U-STR-04 | Avant-hier (YYYY-MM-DD) | `true` | 2 jours sans session → cassé |
| U-STR-05 | Timestamp ISO complet (aujourd'hui) | `false` | `dateStr()` extrait les 10 premiers chars |

### 1.2 `hasSessionToday(lastSession)`

| ID | Entrée | Attendu |
|---|---|---|
| U-HST-01 | `null` | `false` |
| U-HST-02 | Aujourd'hui | `true` |
| U-HST-03 | Hier | `false` |
| U-HST-04 | Timestamp ISO complet (aujourd'hui) | `true` |

### 1.3 Calcul du streak dans `handleComplete`

| ID | État initial `last_session` | `streak` initial | Résultat attendu | Règle |
|---|---|---|---|---|
| U-SC-01 | `null` | 0 | streak = 1 | Première session |
| U-SC-02 | Hier | 3 | streak = 4 | Jour suivant → +1 |
| U-SC-03 | Aujourd'hui | 3 | streak = 3 | Déjà joué → inchangé |
| U-SC-04 | Avant-hier | 5 | streak = 1 | Cassé → repart à 1 |
| U-SC-05 | Avant-hier | 5 | best_streak = 5 | `best_streak` préservé |

### 1.4 `getNoteEstimee(notions, subject)`

| ID | Setup | Attendu |
|---|---|---|
| U-NOTE-01 | Toutes notions p=1 : `maitrise` | 20.0 |
| U-NOTE-02 | Toutes notions p=1 : `non_vu` | 0.0 |
| U-NOTE-03 | 50% `maitrise` + 50% `non_vu` | 10.0 |
| U-NOTE-04 | Toutes `en_cours_assimilation` | `round(0.55 × 20, 1)` = 11.0 |
| U-NOTE-05 | Toutes `vu_en_cours` | `round(0.25 × 20, 1)` = 5.0 |
| U-NOTE-06 | Aucune notion p=1 | 0 (pas de division par zéro) |

### 1.5 `computeNewBadges(stats, notions)`

| ID | Stats | Badges attendus ajoutés |
|---|---|---|
| U-BAD-01 | `total_sessions: 1` | `'first'` |
| U-BAD-02 | `streak: 3` | `'streak3'` |
| U-BAD-03 | `streak: 7` | `'streak3'` + `'streak7'` |
| U-BAD-04 | `best_streak: 5` | `'sniper'` |
| U-BAD-05 | `flash_sessions: 1` | `'flash'` |
| U-BAD-06 | `xp: 400` | `'lv3'` |
| U-BAD-07 | `xp: 1300` | `'lv3'` + `'lv5'` |
| U-BAD-08 | Badge déjà présent | Pas de doublon dans le tableau |

### 1.6 `getEarnedEuros(xp)`

| ID | XP | Euros attendus |
|---|---|---|
| U-EUR-01 | 0 | 0 |
| U-EUR-02 | 499 | 0 |
| U-EUR-03 | 500 | 5 |
| U-EUR-04 | 1500 | 20 |
| U-EUR-05 | 3000 | 50 |
| U-EUR-06 | 5000 | 100 |
| U-EUR-07 | 9999 | 100 (plafond) |

---

## 2. Tests d'intégration — APIs

> 🔧 Prérequis : compte Supabase valide, variables d'env configurées

### 2.1 `POST /api/questions`

| ID | Entrée | Attendu | Code HTTP |
|---|---|---|---|
| I-Q-01 | notion valide (m01, maths) | JSON `{ notionId, question, reponse, conseil }` | 200 |
| I-Q-02 | notion inconnue (xyz) | Groq génère quand même / fallback si notionId dans QS | 200 |
| I-Q-03 | Groq indisponible (simulé) | Fallback statique si `nid` dans QS, sinon 500 | 200 ou 500 |
| I-Q-04 | Body vide | Erreur 500 (parsing fail) | 500 |

### 2.2 `GET /api/stats`

| ID | Contexte | Attendu | Code HTTP |
|---|---|---|---|
| I-ST-01 | Utilisateur connecté | `{ stats: {...}, rewards: [...] }` | 200 |
| I-ST-02 | Non authentifié | `{ error: 'Non authentifié' }` | 401 |
| I-ST-03 | Premier login (aucune game_stats) | stats = null (trigger pas encore déclenché) | 200 |

### 2.3 `POST /api/stats`

| ID | Contexte | Corps | Attendu | Code HTTP |
|---|---|---|---|---|
| I-ST-04 | Utilisateur connecté | `{ xp: 100, streak: 2, ... }` | `{ success: true }`, upsert en BDD | 200 |
| I-ST-05 | Non authentifié | n/a | 401 | 401 |
| I-ST-06 | 2ème appel (update) | xp augmenté | Mise à jour sans doublon | 200 |

### 2.4 `POST /api/sessions`

| ID | Corps | Attendu | Code HTTP |
|---|---|---|---|
| I-SES-01 | Session valide | `{ success: true }`, ligne créée | 200 |
| I-SES-02 | `duration_min: 0` | Erreur Supabase (CHECK > 0) | 500 |
| I-SES-03 | Non authentifié | 401 | 401 |

### 2.5 `PATCH /api/rewards`

| ID | Corps | Attendu | Code HTTP |
|---|---|---|---|
| I-REW-01 | `{ id: validId, requested: true }` | `{ success: true }`, `requested = true` en BDD | 200 |
| I-REW-02 | ID d'un reward appartenant à un autre user | Aucune mise à jour (filtre `user_id`) | 200 (0 rows) |
| I-REW-03 | Non authentifié | 401 | 401 |

### 2.6 `PATCH /api/parent/rewards`

| ID | Contexte | Corps | Attendu | Code HTTP |
|---|---|---|---|---|
| I-PR-01 | David (parent, enfant lié) | `{ rewardId, approved: true }` | `approved=true`, `approved_at` défini | 200 |
| I-PR-02 | David (parent, enfant lié) | `{ rewardId, approved: false }` | `requested=false`, `approved=false` | 200 |
| I-PR-03 | Noah (student) | n/a | `{ error: 'Accès refusé' }` | 403 |
| I-PR-04 | David (parent sans enfant lié) | n/a | `{ error: 'Enfant introuvable' }` | 404 |
| I-PR-05 | Non authentifié | n/a | 401 | 401 |
| I-PR-06 | `approved` non booléen | `{ rewardId, approved: "oui" }` | `{ error: 'Paramètres invalides' }` | 400 |

### 2.7 `POST /api/parent`

| ID | Corps | Attendu | Code HTTP |
|---|---|---|---|
| I-PAR-01 | `{ childEmail: 'noah@...' }` | `parent_id` de Noah mis à jour | 200 |
| I-PAR-02 | Email inexistant | Erreur (user not found) | 500 |

---

## 3. Tests fonctionnels — Parcours utilisateur

### 3.1 Authentification

| ID | Scénario | Étapes | Attendu |
|---|---|---|---|
| F-AUTH-01 | Connexion élève | 1. Aller sur `/auth/login` · 2. Saisir `noah.vongpraseuth@gmail.com` · 3. Cliquer "Envoyer le lien" · 4. Ouvrir email · 5. Cliquer lien | Redirection vers `/` (Accueil) connecté |
| F-AUTH-02 | Accès sans connexion | Aller sur `/carte` sans être connecté | Redirection vers `/auth/login` |
| F-AUTH-03 | Lien expiré | Cliquer sur un magic link expiré (>1h) | Message d'erreur Supabase |

### 3.2 Carte — Gestion des notions

| ID | Scénario | Étapes | Attendu |
|---|---|---|---|
| F-CARTE-01 | Changer statut d'une notion | Taper sur badge d'une notion `non_vu` | Statut passe à `vu_en_cours`, mis à jour en BDD |
| F-CARTE-02 | Cycle complet | Taper 4 fois sur la même notion | `non_vu → vu → en_cours → maîtrisé → non_vu` |
| F-CARTE-03 | Persistance | Changer statut, recharger la page | Statut toujours `vu_en_cours` (lu depuis Supabase) |
| F-CARTE-04 | Changer de matière | Cliquer sur onglet "Français" | Affiche les 44 notions de français |

### 3.3 Session de révision

| ID | Scénario | Étapes | Attendu |
|---|---|---|---|
| F-SES-01 | Pool vide | Aller en session sans aucune notion marquée | Message "Marque d'abord des notions !" |
| F-SES-02 | Session complète | 1. Marquer 3 notions · 2. Lancer session · 3. Répondre à toutes | Écran résultat + XP gagné + toast |
| F-SES-03 | XP correct | Répondre : 2 OK + 1 Flou + fin de session | +30+30+10+50 = +120 XP |
| F-SES-04 | Flash session | Durée 5 min, finir session | `flash_sessions + 1`, badge `flash` si premier |
| F-SES-05 | Statut mis à jour | Répondre OK à une notion | Statut de la notion passe à `maitrise` |
| F-SES-06 | Statut mis à jour | Répondre Non à une notion | Statut passe à `vu_en_cours` |
| F-SES-07 | Prefetch | Observer les requêtes réseau | Question N+1 chargée pendant la réponse à N |

### 3.4 Gamification — Streak

| ID | Scénario | Attendu |
|---|---|---|
| F-STR-01 | Première session | streak = 1 |
| F-STR-02 | 2e session le même jour | streak inchangé |
| F-STR-03 | Session le lendemain | streak = 2 |
| F-STR-04 | Pas de session pendant 2 jours | Prochain session : streak = 1 (reset) |
| F-STR-05 | best_streak après reset | best_streak conservé même si streak revient à 1 |

### 3.5 Rewards — Côté Noah

| ID | Scénario | Étapes | Attendu |
|---|---|---|---|
| F-REW-01 | Reward verrouillé | XP < cost_xp | Bouton absent, affiché "encore X XP" |
| F-REW-02 | Demande reward | 1. XP ≥ cost_xp · 2. Cliquer "Demander à papa →" | Statut → "⏳ En attente de papa" |
| F-REW-03 | Reward validé par David | David valide depuis /parent | Noah voit "🎉 Papa a validé !" |

### 3.6 Vue parent

| ID | Scénario | Étapes | Attendu |
|---|---|---|---|
| F-PAR-01 | Connexion parent sans lien | Se connecter avec email parent | Page de setup (formulaire email enfant) |
| F-PAR-02 | Liaison parent/enfant | Saisir email Noah dans formulaire | Page rechargée avec données Noah |
| F-PAR-03 | Voir données Noah | Accéder à /parent lié | Tableau de bord complet (XP, streak, sessions, notes) |
| F-PAR-04 | Valider un reward | 1. Noah demande reward · 2. David clique ✅ Valider | Reward approved=true, alerte disparaît, Noah notifié |
| F-PAR-05 | Refuser un reward | David clique ❌ Refuser | Reward `requested=false`, Noah peut re-demander |
| F-PAR-06 | Accès /parent par Noah | Noah tente /parent | ⚠️ Actuellement non bloqué par role (à corriger en V2) |

---

## 4. Tests de non-régression

À exécuter après chaque déploiement :

| ID | Scénario | Durée estimée |
|---|---|---|
| NR-01 | Magic link Noah fonctionne | 2 min |
| NR-02 | Accueil charge correctement (XP, streak, note) | 30s |
| NR-03 | Carte affiche toutes les matières + notions | 1 min |
| NR-04 | Session démarre et génère une question | 1 min |
| NR-05 | XP sauvegardé après session (refresh page) | 2 min |
| NR-06 | Vue /parent accessible à David | 1 min |
| NR-07 | PWA installable (Chrome → "Ajouter à l'écran d'accueil") | 2 min |

---

## 5. Tests de sécurité

| ID | Test | Attendu |
|---|---|---|
| S-01 | Accès à `/api/stats` sans cookie de session | 401 |
| S-02 | PATCH `/api/rewards` avec un ID reward appartenant à un autre user | 0 lignes modifiées |
| S-03 | PATCH `/api/parent/rewards` avec un compte `student` | 403 |
| S-04 | `SUPABASE_SERVICE_ROLE_KEY` absente des sources JS côté client | Grep : clé introuvable dans `.next/static/` |
| S-05 | `GROQ_API_KEY` absente du bundle client | Idem |

---

## 6. Tests de performance

| ID | Scénario | Seuil acceptable |
|---|---|---|
| P-01 | Génération question Groq | < 3 secondes |
| P-02 | Chargement Accueil (first load JS) | < 200 kB (actuel : ~159 kB) |
| P-03 | Chargement vue /parent | < 2s en 4G |
| P-04 | Sync statut notion (tap sur Carte) | Pas de freeze perceptible |

---

## 7. Matrice de couverture

| Fonctionnalité | Unit | Intégration | Fonctionnel | NR |
|---|---|---|---|---|
| Streak | ✅ | — | ✅ | ✅ |
| XP | ✅ | ✅ | ✅ | ✅ |
| Note simulée | ✅ | — | — | — |
| Badges | ✅ | — | — | — |
| Rewards (Noah) | ✅ | ✅ | ✅ | — |
| Rewards (parent) | — | ✅ | ✅ | — |
| Questions Groq | — | ✅ | ✅ | ✅ |
| Auth magic link | — | — | ✅ | ✅ |
| Carte / notions | — | — | ✅ | ✅ |
| Session | — | ✅ | ✅ | ✅ |
| Vue parent | — | ✅ | ✅ | ✅ |
| PWA | — | — | — | ✅ |
| Sécurité API | — | ✅ | — | — |
