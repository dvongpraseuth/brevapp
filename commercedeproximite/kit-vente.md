# CommerceDeProximite.fr — Kit de vente v1

Contenu prêt à l'emploi. Remplacer les `[crochets]`.

---

## 1. Script d'appel — Repreneurs (canal prioritaire)

**Durée visée : 4 minutes. Objectif : paiement ou rappel fixé, jamais « je vous envoie un mail » sans date.**

### Ouverture (15 s)
> « Bonjour [Prénom], [Votre prénom] de CommerceDeProximite.fr. J'ai vu que vous aviez repris [l'épicerie / le café] de [Village] — bravo, c'est exactement ce genre d'histoire qu'on met en avant. Vous avez deux minutes ? »

### Accroche (30 s)
> « On lance un média dédié aux commerces qui font vivre nos villages : les derniers commerces, les multi-services, les producteurs en circuit court. L'idée : raconter votre histoire et vous ramener des clients du coin et des touristes. On sélectionne les 30 premiers "Commerces Fondateurs" par département. »

### Découverte (1 min) — 3 questions, puis se taire
1. « Depuis la reprise, qu'est-ce qui marche le mieux et qu'est-ce qui coince ? »
2. « Aujourd'hui, comment les gens des villages autour savent que vous existez ? »
3. « Si demain vous aviez 20 clients réguliers de plus, ça changerait quoi pour vous ? »

### Proposition (1 min)
> « Ce que je vous propose : un portrait de votre commerce — votre parcours, pourquoi vous avez repris, ce que vous proposez — publié sur le site et diffusé sur les réseaux du secteur. Plus votre fiche sur la carte avec le badge Commerce Fondateur. C'est 390 € HT, une seule fois, et le tarif fondateur est garanti. Si vous voulez juste la fiche, c'est 149 € l'année. »

### Closing (30 s)
> « Je vous envoie le lien de paiement par SMS maintenant, et je vous appelle [jeudi à 14h] pour l'interview de 20 minutes. Ça vous va ? »

### Objections

| Objection | Réponse |
|---|---|
| « C'est trop cher. » | « Je comprends. Combien vous rapporte un client régulier sur un an ? Si le portrait en ramène deux, il est remboursé. Sinon, la fiche seule est à 149 €, soit 40 centimes par jour. » |
| « Je n'ai pas le temps. » | « L'interview, c'est 20 minutes au téléphone, on s'occupe de tout le reste. Vous relisez, vous validez. » |
| « Je ne vous connais pas. » | « Normal, on démarre — c'est pour ça que les 30 premiers ont le tarif fondateur. Je vous envoie les premiers portraits publiés, vous jugez sur pièce. » |
| « Envoyez-moi un mail. » | « Avec plaisir. Je vous l'envoie maintenant et je vous rappelle [demain à 11h] pour en parler deux minutes, ça vous va ? » |
| « Je fais déjà Facebook. » | « Très bien, et on va le nourrir : le portrait vous donne un contenu à partager, écrit par un média extérieur, c'est plus crédible que de parler de soi. » |
| « Vous passez à la télé ? » | « On propose les plus belles histoires aux rédactions régionales et nationales. On ne peut rien garantir — personne ne le peut honnêtement — mais c'est là qu'elles viennent chercher. » |

---

## 2. Séquence emails (appui du téléphone)

**Email 1 — J0**
Objet : `[Village] : votre commerce fait vivre le village`
> Bonjour [Prénom],
>
> Vous avez repris [nom du commerce] à [Village] il y a [X mois]. Dans un territoire où tant de rideaux se baissent, c'est une vraie bonne nouvelle.
>
> Nous lançons CommerceDeProximite.fr, le média des commerces qui redynamisent nos clochers : derniers commerces, multi-services, producteurs du champ à l'assiette.
>
> Nous sélectionnons 30 Commerces Fondateurs par département. Portrait, fiche sur la carte, diffusion locale : [lien landing].
>
> Je vous appelle [jour] pour en parler 5 minutes.
>
> [Signature] · [Désinscription]

**Email 2 — J+3**
Objet : `Le portrait de [Commerce voisin], publié cette semaine`
> Bonjour [Prénom],
>
> Nous venons de publier l'histoire de [Nom], qui a repris [commerce] à [Village voisin] : [lien]. En 3 jours, [chiffre réel uniquement].
>
> Il reste [N] places de Commerce Fondateur sur [département]. Réserver la vôtre : [lien Stripe].
>
> [Signature] · [Désinscription]

**Email 3 — J+7 (dernière relance)**
Objet : `Je clôture la liste des Fondateurs de [département]`
> Bonjour [Prénom],
>
> Je clôture vendredi la liste des Commerces Fondateurs de [département]. Après, le tarif passe au prix normal.
>
> Si ce n'est pas le moment, aucun souci : répondez simplement « plus tard » et je ne vous relancerai pas.
>
> [Lien Stripe] · [Signature] · [Désinscription]

---

## 3. Structure de la landing page

1. **Hero** — Titre : « Le dernier commerce du village mérite d'être connu. » Sous-titre : « Le média des commerces et producteurs qui redynamisent nos clochers. » CTA : « Devenir Commerce Fondateur ». Photo : vraie devanture rurale, vrai commerçant.
2. **Le constat** (3 chiffres sourcés sur la désertification commerciale rurale — utiliser uniquement des sources vérifiées : INSEE, ANCT, CCI).
3. **Ce qu'on fait** — 3 blocs : Portrait · Carte des commerces · Diffusion locale et médias.
4. **Preuve** — les 3 premiers portraits publiés (J4 et après).
5. **Les 3 packs** — tableau de prix + bouton Stripe sous chaque pack. Mention « Tarif fondateur, 30 places par département ».
6. **Offre Mairie** — « Vous êtes élu ? Offrez la visibilité à votre dernier commerce. » → formulaire de contact.
7. **FAQ** — Délai de publication · Qui écrit · Droit de relecture · « Passerez-vous à la TV ? » (réponse honnête) · Facturation.
8. **Footer** — Mentions légales, CGV, contact, SIRET.

Outil conseillé pour aller vite : Carrd, Framer ou une page Next.js sur Vercel (même stack que les autres projets).

---

## 4. Offre Mairie — email au maire

Objet : `Soutenir [nom du commerce], dernier commerce de [Commune]`
> Madame, Monsieur le Maire,
>
> [Commune] a la chance de compter encore [nom du commerce], lieu de vie et de lien social pour vos habitants. Beaucoup de communes voisines n'ont pas cette chance.
>
> CommerceDeProximite.fr est le média des commerces qui font vivre nos villages. Nous proposons aux communes d'offrir à leur commerce un **portrait et une visibilité à l'échelle du territoire**, pour [390 / 990] € HT, sur facture à la commune.
>
> C'est un geste concret pour la redynamisation du centre-bourg, et un contenu que la commune peut relayer dans son bulletin municipal et sur ses réseaux.
>
> Je me permets de vous appeler [jour] pour en échanger.
>
> [Signature]

⚠️ Vérifier avant envoi : les modalités d'achat public (bon de commande, facture, Chorus Pro pour les collectivités).
