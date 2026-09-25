# Corniche Turbo — fiche de conception

Jeu imaginé par Nathan & David. Fichier jouable : `game/index.html` (ouvrir dans un navigateur).

| Question de game design | Notre réponse |
|---|---|
| **Concept** | Un jeu où je conduis une belle décapotable sur une route qui défile, et où j'évite le trafic. |
| **Boucle de jeu** | Accélérer → repérer un obstacle → changer de voie → gagner des points → recommencer. |
| **Contrôles** | Un volant tactile à gauche (plus le doigt est loin du centre, plus ça tourne), FREIN et GAZ à droite. Clavier : flèches. |
| **Modes** | *Classique* : on évite tout. *Destructor* : bouclier infini, on dégomme tout (+150) mais chaque choc freine un peu → il vaut mieux quand même éviter. |
| **Défi du jour** | Même route et même trafic pour tout le monde, règles qui alternent (Classique / Destructor). 2 essais gratuits par jour, liste des checkpoints vs référence (25 s par étape), carte émojis à copier et partager. |
| **Essai bonus** | Pas de pub : une *pause corvée* selon l'heure (lit, table, cartable, squats…) ou une pause express de 5 s (respirer, reposer ses yeux). Le bouton « C'est fait ! » se débloque à la fin du compte à rebours. |
| **But** | Faire le meilleur score avant la fin du chrono. |
| **Défaite** | Le chrono tombe à 0. |
| **Chrono** | Au choix : 30 s (Pilote), 60 s (Normal), 90 s (Balade). Chaque checkpoint redonne du temps (mode arcade). |
| **Points** | Véhicule évité +100, frôlé +250, checkpoint +1000. Combo : ×2, ×3… tous les 5 évitements sans accident. |
| **Progression** | Chaque étape change de monde (Corniche → Provence → Canyon → Néon City) et ajoute plus de trafic, plus d'obstacles, des voitures qui changent de voie (avec clignotant !), et un bonus de temps plus petit. |
| **Bonus bouclier** | Un bouclier bleu flotte parfois sur la route. Tu le prends → 7 s d'invincibilité : tu dégommes voitures et obstacles (+300 chacun). |
| **Temps intermédiaires** | Comme dans Trackmania : à chaque checkpoint, le temps s'affiche avec l'écart sur ton meilleur passage (vert = plus rapide, rouge = plus lent). |
| **Nom & Top 10** | Nom de pilote dans le menu (affiché sur la plaque et le panneau « ALLEZ … ! »). Tableau des 10 meilleurs scores à l'ancienne (police pixel, or/argent/bronze) par mode, par chrono et par défi du jour ; saisie du nom en fin de partie si on entre dans le top. |
| **Feedback** | Score qui monte, textes « +100 » / « FRÔLÉ ! », sons, écran qui tremble au choc, poussière hors piste, lignes de vitesse. |
| **Son** | Moteur 6 cylindres simulé (régime, 6 vitesses, pétarades au lâcher de gaz), vent, « whoosh » quand on double, choc. |
| **Ambiance** | Style casual moderne, décors colorés qui défilent, voiture personnalisable (5 couleurs). |

## Pistes (voir discussion viralité)
- Lien défi avec fantôme de l'ami
- Ligues entre potes + classement du jour (Supabase)
- Salon à code pour jouer à 2-4 en direct

## Idées pour la version 2
- D'autres bonus à ramasser (nitro, +5 s)
- Plusieurs voitures à débloquer avec les points
- Un mode nuit avec les phares
- Un tableau des meilleurs scores à partager
