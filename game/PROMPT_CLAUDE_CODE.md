# Prompt de reprise pour Claude Code

Copie-colle le bloc ci-dessous dans une nouvelle session Claude Code, lancée dans le nouveau dépôt `corniche-turbo`, avec accès en lecture au dépôt `brevapp`, branche `claude/video-game-design-1znbv5`.

---

```
Tu reprends le projet de jeu « Corniche Turbo », conçu avec mon fils Nathan.
Réponds en français, de façon concise. Liste toujours tes actions avant de les exécuter.

## Contexte
- Le prototype jouable est dans le dépôt brevapp, branche claude/video-game-design-1znbv5 :
  - game/index.html : un seul fichier HTML, canvas 2D en fausse 3D façon OutRun
    (route par segments, trafic, bouclier, modes Classique et Destructor, défi du jour,
    pause corvée, volant tactile, moteur flat-6 synthétisé en Web Audio).
  - game/CONCEPTION.md : la fiche de game design (règles, points, progression).
  - game/PLAN.md : le plan de réalisation en 6 phases. C'EST TA FEUILLE DE ROUTE.
- Lis ces 3 fichiers en entier avant de commencer. Le prototype est la référence
  gameplay et UX : on porte et on améliore, on ne réinvente pas les règles.

## Objectif
Transformer le prototype en jeu mobile aux standards graphiques actuels (Three.js),
avec :
- un mode Soirée (multijoueur local, on se passe le téléphone : N joueurs, N runs
  par joueur configurables, plus 1 run bonus débloqué par une mission) ;
- des missions configurables par un parent (corvées, pauses, révisions de thaï et de
  lao en quiz, défis physiques) à la place des pubs.

## Stack et conventions
- Nouveau dépôt « corniche-turbo » : Vite + TypeScript strict (pas de any) + Three.js.
  UI en HTML/CSS par-dessus le canvas. PWA. Déploiement Vercel.
- Mobile d'abord : 60 fps sur un Android milieu de gamme, portrait et paysage,
  safe areas, contrôles tactiles (volant analogique à gauche, FREIN/GAZ à droite) et clavier.
- Gameplay déterministe : un seul générateur aléatoire à graine pour la route et le trafic
  (défi du jour, équité en mode Soirée).
- Code modulaire : track/, game/, traffic/, audio/, input/, render/, ui/, missions/, party/.
  Un fichier = une responsabilité. Constantes d'équilibrage centralisées dans balance.ts.
- Textes du jeu en français. Aucun nom de marque, logo, calandre ou signature lumineuse
  reconnaissable. Le trafic comprend un « break familial » (silhouette inspirée d'une
  Mégane 3 Estate) et un « SUV urbain » (inspiré d'un Captur 2), avec des proportions
  et des détails modifiés pour rester génériques. Le joueur conduit un cabriolet sportif
  générique.
- Pas de données personnelles : des pseudos. Remplace « NATHAN » (plaque, panneau)
  par le pseudo du joueur.

## Règles de travail
- Avance phase par phase selon game/PLAN.md. Ordre demandé :
  Phase 0 → Phases 3+4 (Soirée + missions) → Phase 1 (3D) → Phase 2 → Phase 5 → Phase 6.
- À la fin de chaque phase : build OK, lint OK, test Playwright qui joue une partie
  (aucune erreur console) et capture d'écran mobile, commit clair, push, puis un court
  résumé avec ce qui reste à décider.
- Demande-moi avant : de créer des tables Supabase ou de modifier leur schéma
  (toujours avec RLS), d'ajouter une dépendance payante ou un service externe,
  de supprimer une fonctionnalité du prototype, de modifier l'équilibrage des
  points ou des bonus.
- Les listes de vocabulaire thaï et lao : prépare un petit paquet de départ
  (salutations, merci, chiffres 1-10, couleurs) avec écriture + transcription + français,
  marqué « À VÉRIFIER PAR DAVID ». N'invente pas de mots incertains.

## Missions (phase 4) : ce qu'il faut modéliser
- Types : corvée (texte + minuteur 5-60 s + « C'est fait ! »), pause (respiration),
  révision (QCM, bonne réponse obligatoire), défi physique.
- Réglages : plages horaires, poids, activation par joueur, nombre maximum de runs
  bonus par jour, espace parent avec code PIN, import/export JSON.
- Paquet « Maison » de départ : débarrasser la table, mettre la table, ranger sa
  chambre, ranger ses jouets, se brosser les dents, se laver, sortir les recyclables,
  mettre son linge sale au panier, préparer son sac, aider pour le dîner.

## Commence par
1. Lire les 3 fichiers de référence et me résumer en 10 lignes ce que tu as compris.
2. Proposer l'arborescence du nouveau projet et le découpage de la Phase 0.
3. Attendre mon feu vert, puis exécuter la Phase 0.
```
