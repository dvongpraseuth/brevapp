# Corniche Turbo — fiche de conception

Jeu imaginé par Nathan & David. Fichier jouable : `game/index.html` (ouvrir dans un navigateur).

| Question de game design | Notre réponse |
|---|---|
| **Concept** | Un jeu où je conduis une belle décapotable sur une route qui défile, et où j'évite le trafic. |
| **Boucle de jeu** | Accélérer → repérer un obstacle → changer de voie → gagner des points → recommencer. |
| **Contrôles** | 4 boutons : ◀ ▶ à gauche (volant), FREIN et GAZ à droite. Clavier : flèches. |
| **But** | Faire le meilleur score avant la fin du chrono. |
| **Défaite** | Le chrono tombe à 0. |
| **Chrono** | Au choix : 30 s (Pilote), 60 s (Normal), 90 s (Balade). Chaque checkpoint redonne du temps (mode arcade). |
| **Points** | Véhicule évité +100, frôlé +250, checkpoint +1000. Combo : ×2, ×3… tous les 5 évitements sans accident. |
| **Progression** | Chaque étape change de monde (Corniche → Provence → Canyon → Néon City) et ajoute plus de trafic, plus d'obstacles, des voitures qui changent de voie (avec clignotant !), et un bonus de temps plus petit. |
| **Bonus bouclier** | Un bouclier bleu flotte parfois sur la route. Tu le prends → 7 s d'invincibilité : tu dégommes voitures et obstacles (+300 chacun). |
| **Feedback** | Score qui monte, textes « +100 » / « FRÔLÉ ! », sons, écran qui tremble au choc, poussière hors piste, lignes de vitesse. |
| **Son** | Moteur 6 cylindres simulé (régime, 6 vitesses, pétarades au lâcher de gaz), vent, « whoosh » quand on double, choc. |
| **Ambiance** | Style casual moderne, décors colorés qui défilent, voiture personnalisable (5 couleurs). |

## Idées pour la version 2
- D'autres bonus à ramasser (nitro, +5 s)
- Plusieurs voitures à débloquer avec les points
- Un mode nuit avec les phares
- Un tableau des meilleurs scores à partager
