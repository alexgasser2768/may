# Limites connues, compromis et prochaines étapes

## 1. Points légaux à faire vérifier (Belgique)

> Ceci n'est pas un avis juridique. C'est une liste de points à soumettre à un·e juriste, à l'association
> professionnelle (Axxon) ou au SPF Santé publique avant la mise en ligne.

**Mentions obligatoires** (page `mentions-legales.html`, modèle avec marqueurs) :
- Identité, adresse professionnelle, e-mail, numéro d'entreprise (BCE) : obligations d'information du prestataire de
  services (Code de droit économique, notamment art. III.74 et livre XII).
- Profession réglementée : titre professionnel, visa / agrément, numéro INAMI, statut de conventionnement, règles
  professionnelles applicables, régime TVA (les kinésithérapeutes en sont généralement exonérés : **à confirmer**).
- Assurance responsabilité civile professionnelle, si une mention est requise ou souhaitée.

**Communication d'une professionnelle de santé :**
- Vérifier les règles d'information et de publicité applicables aux professions de santé (loi du 22 avril 2019
  relative à la qualité de la pratique des soins de santé, et règles déontologiques de la profession).
- **Témoignages de patients** : vérifier qu'ils sont autorisés dans ce cadre. Si c'est le cas, n'utiliser que des avis
  réels, avec l'accord écrit et révocable de chaque personne, et sans détail médical identifiable. Sinon :
  `"afficher": false` dans `contenu.json` (la section disparaît, rien d'autre à changer).
- Les formulations sur le remboursement (prescription, soins à domicile, mutualité) sont volontairement laissées en
  marqueurs `[À VÉRIFIER]` : les règles INAMI sont précises et évoluent.

**RGPD (formulaire de contact) :**
- Le message peut contenir des **données de santé** (catégorie particulière, art. 9) : le formulaire demande donc un
  consentement explicite (case obligatoire) et invite à ne pas détailler son dossier médical.
- Choisir un service de formulaire de préférence hébergé dans l'UE, et signer avec lui un contrat de sous-traitance (art. 28).
- Tenir un registre des traitements (art. 30), définir une durée de conservation, compléter `confidentialite.html`.
- Le site n'utilise **ni cookies, ni mesure d'audience, ni polices ou cartes externes** : aucun bandeau cookies n'est
  nécessaire. Si un outil d'audience est ajouté plus tard, choisir un outil sans cookies (Plausible, Matomo configuré
  sans cookies…) et mettre à jour la politique.
- Accessibilité : l'European Accessibility Act exempte en principe les microentreprises de services. Le site vise
  néanmoins WCAG 2.2 AA, par respect pour le public.

## 2. Compromis assumés

| Choix | Ce qu'on a gagné | Ce qu'on a laissé |
|---|---|---|
| **Pas de WebGL** dans le hero | 0 Ko de JS, 60 i/s sur un téléphone ralenti ×4, rien à maintenir en repli | Formes un peu moins « liquides » qu'un shader |
| **Pas de GSAP ni de framework** | ~45 Ko de JS évités ; tout est en CSS natif + 6,5 Ko de JS | Chorégraphies très complexes plus longues à écrire à la main |
| **Texte et boutons du hero non animés** | LCP 1,4 s en 4G, l'appel est possible dès la première image | Pas d'entrée « spectaculaire » du titre |
| **Barre d'appel fixe en bas** (mobile) | Appeler / rendez-vous / menu à portée de pouce, partout | Environ 68 px d'écran occupés en permanence |
| **Zone remontée** avant « À propos » | Répond tôt à « vient-elle chez moi ? » | Le parcours de May arrive un peu plus bas |
| **Écriture sans point médian** (« vous », tournures neutres) | Lecture fluide, meilleure restitution par les lecteurs d'écran | — |
| **CSS injecté dans chaque page** | Aucune requête bloquante, premier affichage immédiat | ~12 Ko re-téléchargés sur les pages légales (rarement visitées) |
| **Carte stylisée**, pas de vraie carte | Aucun service tiers (RGPD), 0 Ko, lisible | Pas de géographie réelle : la liste des communes fait foi |
| **Interface en clair uniquement** | Palette chaleureuse maîtrisée, contrastes vérifiés | Pas de mode sombre |

## 3. Limites techniques connues

- **Contenu entièrement provisoire** : 68 marqueurs, 2 images, textes d'exemple (voir `A-REMPLACER.md`).
- **Formulaire masqué** (`rendezVous.formulaire.afficher: false`) : contact par téléphone, SMS ou e-mail uniquement. Pour le réafficher, configurer d'abord `formulaire.action` ; sans cela, il est en mode démonstration et n'envoie rien. Sans JavaScript,
  il poste vers `merci.html`, ce qui ne fonctionne qu'avec le serveur de développement (la plupart des hébergeurs statiques refusent un POST).
- **Non testé sur de vrais appareils**, ni dans Firefox et Safari de façon automatisée (voir `docs/RAPPORT.md`).
- **Selon le navigateur** :
  - « Le trajet » est en CSS natif dans Chrome/Edge (et Safari 26) ; ailleurs, c'est le repli JS, validé en simulation.
  - L'ouverture en hauteur de la FAQ ne s'anime que dans Chrome 131+ ; ailleurs, la réponse apparaît en fondu.
  - Les transitions entre pages (View Transitions) ne s'exécutent que dans Chrome/Edge et Safari 18.2+ ; ailleurs, navigation normale.
- **Défilement fluide vers une ancre lointaine** : environ 2 s du haut au bas de la page (durée native du navigateur).
  Si des tests utilisateurs le trouvent trop long, retirer `scroll-behavior: smooth` dans `02-base.css`.
- **Politique de sécurité (CSP)** en balise `<meta>` : la directive `frame-ancestors` n'y est pas possible.
  L'équivalent (`X-Frame-Options`) est fourni dans `_headers` et `.htaccess`.
- JS non minifié (seuls les commentaires sont retirés) : 6,5 Ko gzip au total, un minificateur ferait gagner environ 1 Ko.
- Les icônes des soins sont dessinées simplement ; un·e illustrateur·rice pourrait les harmoniser avec les photos.

## 4. Prochaines étapes suggérées

1. **Contenu** : faire relire et valider par May chaque section, remplir les marqueurs, puis passer `provisoire` à `false`.
2. **Photos** : une vraie séance chez un·e patient·e consentant·e (lumière naturelle, gestes réels), plus un portrait souriant.
   C'est le premier levier de confiance du site.
3. **Légal** : faire valider les points de la section 1, compléter les deux pages légales.
4. **Formulaire** : choisir le service (UE), configurer l'adresse, tester un envoi réel et la réception.
5. **Tests** : iPhone (Safari) et Android d'entrée de gamme, en portrait, en paysage et en 4G ; VoiceOver et TalkBack ;
   puis 2 ou 3 personnes âgées qui essaient de « prendre rendez-vous ».
6. **Mise en ligne** : nom de domaine `.be`, `site.url` renseigné, HTTPS, fiche Google Business Profile (souvent le
   premier point de contact pour un soin à domicile).
7. Plus tard, si utile : mesure d'audience sans cookies, prise de rendez-vous en ligne (en gardant le téléphone en priorité).
