# BrevApp — Spécification fonctionnelle

> Version 1.0 — 26 avril 2026

---

## 1. Contexte et objectif

BrevApp est une application mobile de révision du Brevet des Collèges DNB 2026, conçue pour **Noah Vongpraseuth** (3ème). L'application transforme la révision en jeu : chaque effort génère des XP, des badges et des euros réels validés par son père David.

**Problème adressé :** La révision isolée et non structurée est peu motivante. BrevApp crée une boucle de motivation extrinsèque (argent) et intrinsèque (progression visible, streak) ancrée sur le programme officiel DNB 2026.

**Public cible :**
- Utilisateur principal : Noah (13-14 ans, élève de 3ème)
- Utilisateur secondaire : David (parent, validation des récompenses)

---

## 2. Utilisateurs

### 2.1 Élève (Noah)
- Connexion par magic link (email `noah.vongpraseuth@gmail.com`)
- Accès aux 5 pages de l'app : Accueil, Carte, Session, Brevet, Rewards
- Marque des notions, fait des sessions, réclame des récompenses

### 2.2 Parent (David)
- Connexion par magic link (email `david.vongpraseuth@hotmail.fr`)
- Accès à la page `/parent` uniquement
- Visualise la progression de Noah, valide ou refuse les demandes de récompense
- Liaison avec Noah faite une seule fois via formulaire email (/parent → ParentSetup)

---

## 3. Authentification

- **Mécanisme :** Magic link envoyé par email (Supabase Auth)
- **Pas de mot de passe.** L'élève clique sur le lien reçu par email → connecté automatiquement
- **Session persistante** : reste connecté jusqu'à expiration ou déconnexion explicite
- **Middleware** : toutes les routes `/(app)/*` et `/parent` redirigent vers `/auth/login` si non connecté

---

## 4. Programme DNB 2026

163 notions réparties en 4 matières :

| Matière | Nb notions | Domaines couverts |
|---|---|---|
| Maths | 50 | Nombres & Calcul, Fonctions, Probabilités, Statistiques, Géométrie, Algorithmique |
| Français | 44 | Lecture, Grammaire, Orthographe, Vocabulaire, Rédaction |
| Histoire-Géo | 36 | Histoire, Géographie, EMC |
| Sciences | 33 | Physique, Chimie, SVT |

Chaque notion a une **priorité** (p=1 ou p=2). Les notions p=1 entrent dans le calcul de la note simulée.

### Statuts d'une notion
| Statut | Description | Contribution note |
|---|---|---|
| `non_vu` | Non abordé | 0 |
| `vu_en_cours` | Vu en cours | 25% |
| `en_cours_assimilation` | En cours d'apprentissage | 55% |
| `maitrise` | Maîtrisé | 100% |

Le cycle de statut est linéaire et cyclique (tap sur la carte pour avancer).

---

## 5. Pages et fonctionnalités

### 5.1 Accueil (`/`)
- Barre de progression XP avec niveau actuel et nom du niveau
- Streak (nombre de jours consécutifs avec au moins 1 session)
- Note simulée globale (moyenne pondérée des 4 matières)
- Compte à rebours vers les épreuves du brevet (Oral : 15/05, Français : 26/06, Hist-Géo : 29/06, Maths : 30/06)
- Boutons de navigation rapide vers Session et Carte

### 5.2 Carte (`/carte`)
- Vue du programme complet par matière (onglets : Maths, Français, Hist.-Géo, Sciences)
- Par domaine : liste des notions avec badge statut coloré
- Tap sur une notion → cycle au statut suivant (non_vu → vu → en cours → maîtrisé)
- Synchronisation immédiate avec Supabase

### 5.3 Session (`/session`)
- Sélection de la durée (5/10/20 min) et de la matière
- Pool de questions = notions de la matière sélectionnée avec statut ≠ `non_vu`, limité à `max(3, floor(durée/5))` questions
- Questions générées dynamiquement par Groq (llama-3.3-70b) avec prefetch
- Chaque question : énoncé → afficher réponse → noter : ✅ OK / 🤔 Flou / ❌ Non
- XP par réponse : OK = +30 XP, Flou = +10 XP, Non = 0 XP
- En fin de session : +50 XP bonus, affichage du score (ok/flou/non), note simulée mise à jour
- **Flash session** : durée ≤ 10 min → comptabilisée comme flash (badge dédié)

### 5.4 Brevet (`/brevet`)
- Vue synthétique de la progression vers le brevet
- Note simulée par matière (calculée sur les notions p=1 maîtrisées)
- Progression globale et par matière en barres

### 5.5 Rewards (`/rewards`)
- Solde d'euros débloqués (cumulatif par paliers XP)
- **Paliers XP → euros réels :**
  - 500 XP → 5€ (Bon départ)
  - 1 500 XP → +15€ (Sérieux) → 20€ cumulés
  - 3 000 XP → +30€ (Engagé) → 50€ cumulés
  - 5 000 XP → +50€ (Brevet Ready) → 100€ cumulés max
- **Objectifs personnalisés** : 4 rewards créés automatiquement au 1er login (Manette PS5 / Ciné+McDo / Baskets / Week-end choisi)
- Noah peut demander un reward quand son XP ≥ `cost_xp` → bouton "Demander à papa →"
- Statuts : 🔒 Pas encore / ⏳ En attente de papa / 🎉 Papa a validé !

### 5.6 Vue parent (`/parent`)
- Accès restreint au compte avec `role = 'parent'`
- **Setup initial** : formulaire pour lier le compte Noah (email) → fait une seule fois
- **Tableau de bord** : XP total, streak, nb sessions, euros débloqués
- **Historique des sessions** : date, heure, matière, durée, barre ok/flou/non, % réussite, XP
- **Niveau actuel** avec barre de progression vers le prochain palier
- **Notes simulées** par matière avec barre colorée
- **Badges débloqués** (7 badges au total)
- **Rewards en attente** : alerte jaune + boutons ✅ Valider / ❌ Refuser pour chaque reward demandé
- **Tous les objectifs** : liste avec barre de progression XP

---

## 6. Gamification

### 6.1 XP
- Gagné par réponse correcte (+30), floue (+10), et à chaque fin de session (+50)
- Jamais perdu
- Affiché en temps réel avec toast d'animation

### 6.2 Niveaux (8 paliers)
| Niveau | Min XP | Nom | Emoji |
|---|---|---|---|
| 0 | 0 | Novice | 🌱 |
| 1 | 150 | Apprenti | 📝 |
| 2 | 400 | Studieux | 📚 |
| 3 | 800 | Appliqué | ⚡ |
| 4 | 1 300 | Avancé | 🧠 |
| 5 | 2 000 | Expert | 🔥 |
| 6 | 3 000 | Brevet Ready | 🎯 |
| 7 | 4 500 | As du Brevet | 🏆 |

### 6.3 Streak
- Compte le nombre de jours consécutifs avec au moins 1 session
- Règles :
  - +1 si nouvelle session aujourd'hui (premier session du jour seulement)
  - Inchangé si déjà joué aujourd'hui
  - Remis à 1 si dernier jour joué = avant-hier ou plus
- Meilleur streak (`best_streak`) conservé même si le streak courant se casse

### 6.4 Badges (7)
| Badge | Condition | Emoji |
|---|---|---|
| 1ère session | ≥ 1 session au total | ⚡ |
| 3 jours de feu | streak ≥ 3 | 🔥 |
| Semaine de feu | streak ≥ 7 | 💥 |
| Sniper | best_streak ≥ 5 | 🎯 |
| Flash session | ≥ 1 flash session | ⏱️ |
| Niveau Studieux | xp ≥ 400 | 📚 |
| Niveau Avancé | xp ≥ 1 300 | 🧠 |

Les badges sont permanents et ne peuvent pas être perdus.

### 6.5 Note simulée
Calculée par matière sur les notions **priorité 1** uniquement :

```
note = round( (Σ poids_statuts / nb_notions_p1) × 20, 1 )
```

Pondération : maîtrisé = 1,0 · en cours = 0,55 · vu = 0,25 · non vu = 0

---

## 7. Contraintes

- **Mobile first** : max-width 430px, bottom navigation fixe
- **Offline partiel** : PWA installable, questions statiques en fallback si Groq indisponible
- **Pas de notifications push** (V2)
- **Pas d'intégration Pronote** (V2)

---

## 8. Ce qui n'est pas dans le scope actuel (V2)

- Leaderboard entre pairs (Sprint D — structure déjà planifiée)
- Notifications push quand David valide une récompense
- Intégration Pronote (notes réelles)
- Compte multi-enfants côté parent
