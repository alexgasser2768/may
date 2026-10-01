# Spécification du mouvement

## Le brief en une phrase

Un site qui donne le sentiment que « quelqu'un de compétent et bienveillant vient chez moi » : chaleureux,
calme, lisible par une personne âgée sur un petit téléphone, et qui mène à un appel en un geste.

## Concept : « le soin qui respire »

Le mouvement imite le corps au repos, jamais l'écran qui s'agite. Tout ce qui bouge s'inspire d'une respiration
lente, d'un trajet vers la maison, ou d'une onde qui se propage doucement. Les entrées sont longues et se posent,
les sorties sont courtes. Le texte, les boutons d'appel et le hero ne sont **jamais** retardés par une animation.

- **Palette** (reprise de la carte de visite) : fond menthe pâle `#F1F6F3`, bleu pétrole `#165069` pour les titres, les actions et le
  contact, bleu moyen `#206A88` pour les liens, bleu `#267C9D` pour les icônes, menthe `#AFDCCD` pour les accents.
  Contrastes AA au minimum, souvent AAA (voir `01-jetons.css`).
- **Typographie** : *Fraunces* (axe « SOFT » au maximum, terminaisons arrondies) pour les titres ;
  *Atkinson Hyperlegible Next* (conçue pour les personnes malvoyantes) pour le texte, 18 → 20 px.
- **Formes** : aucun angle vif ; sections en « feuilles » aux coins arrondis qui se recouvrent, comme des draps posés.

## Variables (source unique : `src/scripts/motion/config.js`)

Le fichier est importé par les scripts **et** converti en variables CSS par le build (`--ease-*`, `--dur-*`…).

### Courbes

| Nom | Valeur | Usage |
|---|---|---|
| `souffle` | `cubic-bezier(.37,0,.63,1)` (sinusoïde) | Boucles de respiration (hero, halo) |
| `arrivee` | `cubic-bezier(.22,1,.36,1)` (ease-out quint) | Tout ce qui apparaît et se pose |
| `geste` | `cubic-bezier(.33,1,.68,1)` (ease-out cubic) | Transitions d'interface : couleur, menu, accordéon |
| `depart` | `cubic-bezier(.5,0,.75,0)` (ease-in) | Ce qui s'efface (fermeture du menu) |
| `ressort` | `linear(…)`, ζ = 0,72, dépassement 3,8 % | Retours tactiles seulement : bouton relâché, pastille remplie |

Le ressort est calculé à partir d'un vrai modèle de ressort amorti, puis échantillonné. Repli `cubic-bezier` pour Safari < 17.2.

### Durées

| Nom | ms | Usage |
|---|---|---|
| `instant` | 120 | Appui (bouton qui s'enfonce) |
| `rapide` | 220 | Survol, focus, couleur |
| `interface` | 420 | Menu, accordéon, messages de formulaire |
| `sortie` | 300 | Fermetures (~70 % de l'entrée) |
| `recit` | 950 | Apparition d'un bloc au scroll |
| `signature` | 1800 | Entrée des formes du hero, fenêtre qui s'allume |
| `souffle` | 11000 | Cycle respiratoire complet (≈ 5,5 respirations/min, rythme de la cohérence cardiaque) |

### Enchaînement

- **Bloc** (surtitre → titre → introduction) : 140 ms entre chaque élément.
- **Liste** (cartes, étapes, communes) : 90 ms entre éléments frères.
- **Plafond** : au-delà du 5e élément, les suivants partent ensemble (aucun élément n'attend plus de 450 ms).
- Ordre de lecture = ordre d'apparition : haut → bas, gauche → droite.

### Amplitudes

| Nom | Valeur | Usage |
|---|---|---|
| `shiftXs` | 2 px | Bouton qui se soulève au survol |
| `shiftSm` | 8 px | Messages d'erreur, réponses de FAQ |
| `shiftMd` | 24 px | Apparition standard |
| `shiftLg` | 40 px | Étapes du « trajet » |
| `scalePress` | 0,97 | Appui |
| `scaleLift` | 1,015 | Carte survolée |
| `scaleSouffle` | 1,06 | Respiration des formes du hero |

## Les trois moments signatures

### 1. Le souffle (hero)
Trois formes organiques respirent ensemble sur 11 s ; le halo du portrait respire en phase avec elles : toute la page
« respire » d'un seul souffle. Chaque forme tourne aussi très lentement sur elle-même (76 à 120 s par tour) :
ses coins irréguliers donnent l'illusion d'un morphing, sans aucun calcul.
- 100 % CSS, démarre sans JavaScript ; uniquement `scale`, `translate`, `rotate`, `opacity`.
- **Bouton pause** (critère WCAG 2.2.2), qui fonctionne même sans JS (case à cocher + `:has()`) ; le choix est mémorisé.
- Mise en pause automatique quand le hero sort de l'écran.
- *Choix* : WebGL écarté. Des formes floues en shader auraient été plus spectaculaires, mais pour ~150 Ko de
  bibliothèque, un coût GPU réel sur un téléphone d'entrée de gamme et une version de repli à maintenir. Des
  dégradés radiaux sur des calques composés offrent 90 % de l'effet pour 0 Ko de JS.

### 2. Le trajet (séance à domicile)
Un fil vertical se remplit au rythme du défilement, du premier appel jusqu'à une petite maison dont la fenêtre
s'allume. Sa pointe suit une « ligne de lecture » à 60 % de la hauteur d'écran ; chaque pastille d'étape se
remplit avec un léger ressort quand la ligne l'atteint. En remontant, tout s'inverse doucement.
- Navigateurs récents : CSS `animation-timeline: view()` pur. Ailleurs : `parcours.js` écrit `scale` une fois par image,
  avec des écouteurs actifs **seulement** quand la section est visible.
- Défilement 100 % natif (inertie du doigt préservée, aucun scroll-jacking).
- Grand écran : la colonne de titre reste collante et un grand compteur « 3 / 5 » suit la lecture.

### 3. Le rayonnement (zone d'intervention)
Trois ondes partent de la maison de May sur la carte, comme un caillou dans l'eau (cycle 7,5 s, ondes décalées de 2,5 s).
Survoler ou toucher une commune allume son point. Les ondes sont des éléments HTML superposés au SVG, et non des
cercles SVG : ils sont composés par le GPU au lieu de redessiner la carte à chaque image.

### Entre les pages
View Transitions API (navigation entre documents) : l'en-tête et la barre d'appel restent immobiles, le contenu
s'efface (300 ms) puis se pose (950 ms). Ignoré sans douleur par les navigateurs qui ne la connaissent pas.

## Micro-interactions

| Élément | Retour |
|---|---|
| Boutons | Appui : s'enfonce à 97 % (120 ms), revient en ressort. Survol souris : +2 px, ombre en fondu (opacité d'un pseudo-élément) |
| Cartes | Survol souris seulement : −4 px, ombre plus profonde, icône qui pivote de 6°. Purement décoratif |
| Focus clavier | L'anneau se « pose » de 7 à 3 px de distance |
| Surtitres | Le petit trait se dessine quand le bloc apparaît |
| FAQ | « + » qui tourne en « × » (ressort) ; la réponse glisse en fondu ; hauteur animée dans Chrome 131+ |
| Formulaire | Erreurs qui se posent sous le champ ; icône d'envoi qui respire pendant l'attente ; coche qui se dessine à la réussite |
| Menu mobile | Feuille qui monte du bas (420 ms), liens en cascade de 35 ms ; se ferme en 300 ms |
| Barre d'appel | Glisse hors de l'écran pendant la saisie d'un champ (le clavier virtuel l'aurait remontée sur le formulaire) |

Aucune information ni action ne dépend du survol.

## Mouvement réduit (`prefers-reduced-motion: reduce`)

Une version pensée à part entière, pas une version cassée :
- Hero : composition figée, pas de bouton pause (inutile).
- Apparitions : fondu simple de 420 ms, sans déplacement ni décalage.
- Trajet : état final statique (fil plein, pastilles pleines), pas de compteur.
- Zone : une onde fixe suggère le rayon d'action.
- Menu : fondu de 220 ms au lieu du glissement.
- Pas de défilement fluide, pas de transition entre pages.
- Changement du réglage pendant la visite : les modules sont détruits puis recréés dans le bon régime, sans rechargement.
