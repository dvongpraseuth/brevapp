# BrevApp — Suivi de projet

> Dernière mise à jour : 26 avril 2026

---

## Contexte
Application mobile-first de révision brevet DNB 2026 pour **Noah** (fils de David, 3ème).
Gamifiée : XP · streak · note simulée · badges · rewards monétisés (vrais euros).
Repo : `C:\Perso\Dev\brevapp` — GitHub : `dvongpraseuth/brevapp`

---

## URLs clés
| Quoi | URL |
|---|---|
| Production | https://brevapp-rust.vercel.app |
| Vue parent (David) | https://brevapp-rust.vercel.app/parent |
| Supabase | https://supabase.com/dashboard/project/injywewfqdrutgjocwgh |
| GitHub | https://github.com/dvongpraseuth/brevapp |
| Vercel | https://vercel.com/david-vongpraseuths-projects/brevapp |

---

## Stack
- Next.js 14 App Router · TypeScript strict · Tailwind CSS
- Supabase (Auth magic link + Postgres + RLS)
- Groq llama-3.3-70b-versatile (questions générées, gratuit)
- Vercel (déploiement prod)
- PWA installable mobile

---

## Comptes Supabase (au 26 avril 2026)
| Email | Rôle | Statut |
|---|---|---|
| `david.vongpraseuth@hotmail.fr` | parent | Rôle parent ✅ — **pas encore lié à Noah** (à faire via /parent) |
| `noah.vongpraseuth@gmail.com` | student | Actif — 750 XP · streak corrigé (1) · badges: first / lv3 / streak3 |

> `ocoke07@hotmail.com` — purgé le 26/04/2026.

---

## Ce qui est fait

### Sprint 0–2 — Fondations
- [x] Infrastructure complète (Next.js, auth, middleware)
- [x] 5 tables Supabase + RLS (profiles, progress, game_stats, rewards, sessions)
- [x] Trigger auto : profil + game_stats + 4 rewards créés au 1er login
- [x] 5 pages mobile-first (Accueil, Carte, Session, Brevet, Rewards)
- [x] Gamification complète (XP, 8 niveaux, 7 badges, streak, note simulée, euros)
- [x] Persistence Supabase (XP / streak / badges sauvegardés, plus de perte au refresh)
- [x] Questions dynamiques Groq (prefetch, fallback statique, conseil affiché)
- [x] Sync progress notions (Carte + Session → Supabase)
- [x] PWA (manifest + icônes)
- [x] Vue parent `/parent` (notes simulées, XP, badges, historique sessions)
- [x] API sessions (durée, score ok/flou/non, XP, sauvegardée à chaque fin de session)
- [x] Fix : réponses session → table `progress` (manquait avant)
- [x] Déploiement Vercel prod

### Sprint A — Maintenance
- [x] **A1** — Purge compte `ocoke07`, streak Noah corrigé en BDD (5 → 1)
- [x] **A2** — Fix streak quotidien : `hasSessionToday()` + `isStreakBroken()` branchés dans `handleComplete` · +1/jour max · reset à 1 si jour sauté

### Sprint B — Programme complet
- [x] **B1** — 163 notions DNB 2026 (Maths: 50 · Français: 44 · Histoire-Géo: 36 · Sciences: 33)
- [x] **B2** — Données externalisées dans `data/programme_brevet_2026.json` + `lib/programme.ts`

### Sprint C — Vue parent complète
- [x] **C1** — Boutons ✅ Valider / ❌ Refuser dans `/parent` · API `PATCH /api/parent/rewards` (service role)
- [x] **C2** — Noah voit "🎉 Papa a validé !" dans sa page rewards quand `approved = true`
- [x] **C3** — `router.refresh()` dans `RewardActions` → vue parent se met à jour immédiatement après validation

---

## Fonctionnalités et tests

> Référence complète : `docs/cahier-de-tests.md`

### Authentification
| Fonctionnalité | Statut | Tests | Résultat |
|---|---|---|---|
| Magic link email (Supabase Auth) | ✅ En prod | F-AUTH-01 | ✅ Vérifié |
| Redirection si non connecté | ✅ En prod | F-AUTH-02 | ✅ Vérifié |
| Expiration lien | ✅ Géré par Supabase | F-AUTH-03 | Non testé |

### Carte — Programme DNB 2026
| Fonctionnalité | Statut | Tests | Résultat |
|---|---|---|---|
| Affichage 163 notions par matière/domaine | ✅ En prod | F-CARTE-04 | ✅ Vérifié |
| Cycle de statut (tap → non_vu → vu → en cours → maîtrisé) | ✅ En prod | F-CARTE-01, F-CARTE-02 | ✅ Vérifié |
| Persistance du statut (reload) | ✅ En prod | F-CARTE-03 | ✅ Vérifié |
| Sync immédiate vers Supabase | ✅ En prod | I-PROG (hors cahier) | ✅ Vérifié |

### Session de révision
| Fonctionnalité | Statut | Tests | Résultat |
|---|---|---|---|
| Pool de questions selon matière + statut ≠ non_vu | ✅ En prod | F-SES-01 | ✅ Vérifié |
| Génération Groq avec prefetch N+1 | ✅ En prod | I-Q-01, F-SES-07 | ✅ Vérifié |
| Fallback questions statiques si Groq down | ✅ En prod | I-Q-03 | Non testé en prod |
| XP par réponse (OK+30 / Flou+10 / Non+0) | ✅ En prod | F-SES-03 | ✅ Vérifié |
| Bonus +50 XP fin de session | ✅ En prod | F-SES-03 | ✅ Vérifié |
| Mise à jour statut notion après réponse | ✅ En prod | F-SES-05, F-SES-06 | ✅ Vérifié |
| Flash session (durée ≤ 10 min) | ✅ En prod | F-SES-04 | Non testé |

### Gamification — XP & Niveaux
| Fonctionnalité | Statut | Tests | Résultat |
|---|---|---|---|
| Calcul XP cumulatif | ✅ En prod | U-EUR-01→07 | ✅ Logique vérifiée |
| 8 niveaux (Novice → As du Brevet) | ✅ En prod | — | ✅ Vérifié visuellement |
| Toast XP animé | ✅ En prod | — | ✅ Vérifié visuellement |

### Gamification — Streak
| Fonctionnalité | Statut | Tests | Résultat |
|---|---|---|---|
| +1 streak par jour (premier session seulement) | ✅ En prod | U-SC-01→04, F-STR-01→03 | ✅ Logique vérifiée |
| Inchangé si déjà joué aujourd'hui | ✅ En prod | U-SC-03, F-STR-02 | ✅ Logique vérifiée |
| Reset à 1 si jour sauté | ✅ En prod | U-SC-04, F-STR-04 | ✅ Logique vérifiée |
| `best_streak` préservé après reset | ✅ En prod | U-SC-05, F-STR-05 | ✅ Logique vérifiée |

### Gamification — Badges (7)
| Fonctionnalité | Statut | Tests | Résultat |
|---|---|---|---|
| 1ère session → badge `first` | ✅ En prod | U-BAD-01 | ✅ Noah a le badge |
| Streak 3 → badge `streak3` | ✅ En prod | U-BAD-02 | ✅ Noah a le badge |
| Streak 7 → badge `streak7` | ✅ En prod | U-BAD-03 | Non atteint |
| best_streak ≥ 5 → badge `sniper` | ✅ En prod | U-BAD-04 | Non atteint |
| Flash session → badge `flash` | ✅ En prod | U-BAD-05 | Non atteint |
| XP ≥ 400 → badge `lv3` | ✅ En prod | U-BAD-06 | ✅ Noah a le badge |
| XP ≥ 1300 → badge `lv5` | ✅ En prod | U-BAD-07 | Non atteint |
| Pas de doublon | ✅ En prod | U-BAD-08 | ✅ Logique vérifiée |

### Note simulée
| Fonctionnalité | Statut | Tests | Résultat |
|---|---|---|---|
| Calcul sur notions p=1 uniquement | ✅ En prod | U-NOTE-01→05 | ✅ Logique vérifiée |
| Pas de division par zéro | ✅ En prod | U-NOTE-06 | ✅ Logique vérifiée |
| Affichage par matière dans /parent et /brevet | ✅ En prod | F-PAR-03 | ✅ Vérifié |

### Rewards — Côté Noah
| Fonctionnalité | Statut | Tests | Résultat |
|---|---|---|---|
| Affichage paliers XP → euros | ✅ En prod | U-EUR-01→07 | ✅ Vérifié |
| Bouton "Demander à papa" si XP ≥ cost_xp | ✅ En prod | F-REW-01, F-REW-02 | ✅ Vérifié |
| Statut "⏳ En attente de papa" après demande | ✅ En prod | F-REW-02 | ✅ Vérifié |
| Statut "🎉 Papa a validé !" après approbation | ✅ En prod | F-REW-03 | ✅ Vérifié |

### Rewards — Côté Parent
| Fonctionnalité | Statut | Tests | Résultat |
|---|---|---|---|
| Alerte rewards en attente | ✅ En prod | F-PAR-04 | ✅ Vérifié |
| Bouton ✅ Valider → `approved = true` | ✅ En prod | I-PR-01, F-PAR-04 | ✅ Vérifié |
| Bouton ❌ Refuser → `requested = false` | ✅ En prod | I-PR-02, F-PAR-05 | ✅ Vérifié |
| Refresh vue parent immédiat après action | ✅ En prod | — | ✅ Vérifié |
| Accès refusé si `role ≠ parent` | ✅ En prod | I-PR-03 | Non testé |

### Vue parent
| Fonctionnalité | Statut | Tests | Résultat |
|---|---|---|---|
| Setup initial (formulaire email Noah) | ✅ En prod | F-PAR-01, F-PAR-02 | **⚠️ Pas encore fait** |
| Tableau de bord (XP, streak, sessions, euros) | ✅ En prod | F-PAR-03 | Non testé (liaison manquante) |
| Historique sessions (date, durée, score, barre) | ✅ En prod | F-PAR-03 | Non testé |
| Badges débloqués | ✅ En prod | F-PAR-03 | Non testé |

### Sécurité
| Fonctionnalité | Statut | Tests | Résultat |
|---|---|---|---|
| 401 sur APIs si non authentifié | ✅ En prod | I-ST-02, I-SES-03, I-REW-03, I-PR-05 | ✅ Vérifié |
| 403 si student appelle API parent | ✅ En prod | I-PR-03 | Non testé |
| RLS : un user ne voit pas les données d'un autre | ✅ En prod | I-REW-02 | Non testé |
| Service role key absente du bundle client | ✅ En prod | S-04, S-05 | Non testé |

### PWA
| Fonctionnalité | Statut | Tests | Résultat |
|---|---|---|---|
| Installable sur mobile (Chrome) | ✅ En prod | NR-07 | Non testé |
| Icônes 192px et 512px | ✅ En prod | — | ✅ Vérifié |

---

## Bugs connus
- **Liaison parent/enfant non faite** : David doit ouvrir /parent et entrer l'email de Noah (`noah.vongpraseuth@gmail.com`) — à faire avant de tester la vue parent.
- **Accès /parent non restreint par rôle côté client** : Noah peut techniquement accéder à l'URL `/parent`. La page renvoie `null` (pas d'enfant trouvé pour son id) donc rien ne s'affiche, mais il n'est pas redirigé. À corriger en V2 (test F-PAR-06).

---

## Plan — À faire

### Sprint D — Leaderboard (priorité basse, ~3h)
- [ ] **D1** — Champ `display_name` sur profiles + page `/profil`
- [ ] **D2** — Page `/leaderboard` (opt-in, classement XP, pseudo, niveau, streak)

### V2 — Hors scope actuel
- Notifications push quand David valide une récompense
- Intégration Pronote (notes réelles)
- Compte multi-enfants côté parent
- Redirection /parent si `role ≠ parent` (fix bug F-PAR-06)

---

## Variables d'environnement (.env.local + Vercel)
```
NEXT_PUBLIC_SUPABASE_URL=https://injywewfqdrutgjocwgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...  (dans .env.local)
SUPABASE_SERVICE_ROLE_KEY=eyJ...      (dans .env.local, jamais exposé client)
GROQ_API_KEY=gsk_v9Tj...              (clé partagée avec Serge Bot — dans HA secrets.yaml)
```

---

## Notes techniques importantes
- Ne jamais utiliser `getSession()` côté serveur → toujours `getUser()`
- RLS activé sur toutes les tables — parent voit données enfant via policy `parent_sees_child_*`
- La clé Groq est partagée avec Serge Bot (même clé dans HA secrets.yaml)
- `last_session` est de type `date` Postgres (YYYY-MM-DD) — ne pas stocker un timestamp complet
- Streak calculé dans `handleComplete` : `isStreakBroken` → 1 · `hasSessionToday` → inchangé · sinon +1
- `NOTIONS` vient de `lib/programme.ts` (import JSON `data/programme_brevet_2026.json`) — ne plus toucher à `constants.ts` pour les notions
- Les questions statiques (14 dans `constants.ts → QS`) servent de fallback si Groq est down
- Rewards parent : `/api/parent/rewards` utilise le service role car RLS ne couvre pas UPDATE parent→enfant

---

## Décisions prises
- Groq au lieu d'Anthropic/Gemini : gratuit, clé déjà dispo via Serge Bot
- Pas de notifications push (trop complexe pour le gain, V2)
- Pas de Pronote (V2)
- Service role uniquement côté serveur pour les opérations parent → enfant

---

## Documents de référence
| Document | Chemin |
|---|---|
| Spécification fonctionnelle | `docs/spec-fonctionnelle.md` |
| Spécification technique | `docs/spec-technique.md` |
| Cahier de tests | `docs/cahier-de-tests.md` |
