# Corniche Turbo — plan de réalisation

Point de départ : le prototype `game/index.html` (un seul fichier HTML, canvas 2D en fausse 3D façon OutRun). Il valide le gameplay et contient tout ce qui est décrit dans `CONCEPTION.md` : volant tactile, modes Classique et Destructor, bouclier, défi du jour, pause corvée, son moteur synthétisé.

Objectif : un jeu mobile au niveau graphique d'un jeu casual actuel, avec un mode « soirée » où l'on se passe le téléphone, et des missions de vie réelle configurables (corvées, pauses, révisions de thaï et de lao) à la place des pubs.

---

## Principes

- **Nouveau dépôt dédié** (`corniche-turbo`), séparé de BrevApp.
- **Stack** : Vite + TypeScript strict + Three.js. PWA installable, déployée sur Vercel. Supabase seulement à partir de la phase 5.
- **Mobile d'abord** : 60 fps visés sur un Android milieu de gamme, résolution dynamique, portrait et paysage.
- **Aucune marque** : pas de noms, logos, calandres ni signatures lumineuses reconnaissables (Porsche, Renault…). Les modèles sont *inspirés de* : proportions modifiées, détails génériques.
- **Données enfants** : pas de données personnelles, des pseudos. Le prénom « NATHAN » est remplacé par un pseudo configurable.
- Chaque phase se termine par un build jouable, testé (Playwright + capture d'écran) et déployé.

---

## Phase 0 — Socle technique
- Créer le projet Vite + TS + Three.js, ESLint et Prettier, déployé sur Vercel en preview.
- Porter la logique du prototype en modules :
  - `track/` (génération de la route à partir d'une graine, étapes, mondes),
  - `game/` (état, boucle à pas fixe, collisions, score, combo),
  - `traffic/` (apparitions, IA de voie, suivi de véhicule),
  - `audio/` (moteur flat-6, whoosh, impacts : reprendre tel quel),
  - `input/` (volant, pédales, clavier, manette),
  - `ui/` (HUD et écrans en HTML/CSS par-dessus le canvas).
- Un générateur aléatoire à graine unique pour tout ce qui touche au gameplay (indispensable pour le défi du jour et l'équité entre joueurs).

## Phase 1 — Graphismes aux standards actuels (3D)
- **Route 3D** : mesh généré à partir des segments (virages, bosses), textures d'asphalte, marquages, bordures, glissières, arche de checkpoint en 3D.
- **Rendu** : ciel en dégradé ou shader par monde, soleil directionnel avec ombres douces, brouillard de distance, *tone mapping* ACES, bloom léger (néons de Néon City, feux arrière), passage animé du jour au soir entre les mondes.
- **Voitures low-poly stylisées** (fichiers GLB faits sous Blender, ou modèles libres CC0 type Kenney ou Quaternius retouchés) :
  - Joueur : cabriolet sportif « inspiré 911 », 5 peintures, 2 personnages visibles, roues qui tournent et braquent, roulis et tangage.
  - Trafic : **break familial** (inspiré Mégane Estate, silhouette générique), **SUV urbain** (inspiré Captur 2, silhouette générique), citadine, fourgon, camion.
  - Obstacles : cônes, fûts, barrières, avec de la physique simple quand on les percute.
- **Décors par monde** avec *instancing* : palmiers et mer (Corniche), cyprès et lavande (Provence), mesas et cactus (Canyon), immeubles et lampadaires (Néon City).
- **Sensation de vitesse** : champ de vision qui s'élargit avec la vitesse, flou de mouvement léger, particules (poussière, étincelles, débris), tremblement de caméra.
- **Performance** : niveaux de détail (LOD), *instancing*, un seul matériau atlas par monde, qualité automatique basse/moyenne/haute.

## Phase 2 — Gameplay affiné
- Conduite : volant analogique avec courbe de réponse, léger dérapage contrôlé en virage, retour haptique.
- Bonus : bouclier (existant), nitro, +5 s. Mode Destructor inchangé côté règles.
- Tableau d'équilibrage centralisé (vitesses, densité du trafic par étape, bonus de temps, ralentissement en Destructor) pour régler sans toucher au code.
- Temps intermédiaires façon Trackmania (existants) et fantôme de son meilleur run.

## Phase 3 — Mode Soirée (multijoueur local, on se passe le téléphone)
- **Configuration** : 2 à 8 joueurs (pseudo, couleur de voiture, avatar), nombre de runs par joueur (par défaut 2), 1 run bonus débloqué par une mission, mode de jeu (Classique, Destructor ou mixte), chrono.
- **Équité** : même graine pour tout le monde dans une soirée (même route, même trafic).
- **Tour par tour** : écran « Passe le téléphone à Léa » → prêt → compte à rebours. Pas d'infos de score visibles entre deux tours (option « suspense »).
- **Fin de soirée** : top 10 à l'ancienne (existe déjà dans le prototype, à reprendre), podium animé, meilleurs temps par checkpoint, « dégommeur » de la soirée, carte de résultat à partager.

## Phase 4 — Missions configurables (à la place des pubs)
- **Espace parent** protégé par un code PIN.
- **Types de missions** :
  - *Corvée* : texte, durée du minuteur, validation « C'est fait ! » sur l'honneur. Exemples : débarrasser la table, mettre la table, ranger sa chambre, ranger ses jouets, se brosser les dents, se laver, sortir les recyclables, mettre son linge sale au panier…
  - *Pause* : respiration ou repos des yeux, 5 à 30 s, avec animation de respiration.
  - *Révision* : quiz à choix multiples. Il faut une bonne réponse pour débloquer le run. Paquets **Thaï débutant** et **Lao débutant** (écriture + transcription + français, avec audio plus tard).
  - *Défi physique* : squats, gainage…
- **Règles** : plages horaires (matin, midi, après-midi, soir, nuit), poids, activation par joueur, nombre maximum de runs bonus par jour.
- **Import/export** des paquets en JSON, paquets prédéfinis modifiables.
- Stockage local d'abord, synchronisation Supabase ensuite.

## Phase 5 — En ligne (défi du jour, ligues, fantômes)
- Supabase avec RLS sur toutes les tables : `profiles` (pseudo), `daily_runs` (jour, score, temps intermédiaires, trajectoire compressée), `leagues`, `league_members`.
- Connexion anonyme, puis rattachement du compte plus tard.
- Classement du jour et classement de ligue (code d'invitation).
- **Lien défi** : l'ami voit ton fantôme.
- Anti-triche minimal : cohérence des temps intermédiaires côté serveur (fonction Edge).
- Séries (🔥 jours consécutifs).

## Phase 6 — Publication
- PWA (icône, écran de démarrage, hors ligne pour le solo et la soirée).
- Build web pour CrazyGames ou Poki (leur SDK), avec le système de missions comme élément différenciant.
- Si ça prend : applis iOS et Android via Capacitor. Politique de confidentialité adaptée aux enfants.

---

## Ordre et estimation

| Phase | Contenu | Priorité |
|---|---|---|
| 0 | Socle + portage | Indispensable |
| 3 + 4 | Mode Soirée + missions | Le cœur de l'idée : à faire tôt, même en 2D |
| 1 | 3D | Gros chantier, en parallèle ou juste après |
| 2 | Finitions gameplay | Continu |
| 5 | En ligne | Quand le local est validé en famille |
| 6 | Publication | À la fin |

Conseil : les phases 3 et 4 peuvent d'abord être greffées sur le prototype 2D, pour tester l'idée en famille dès ce week-end. On passe à la 3D ensuite.
