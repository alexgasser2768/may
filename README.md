# Site de May Van Overveldt — kinésithérapeute à domicile

Site statique, rapide et accessible. **Aucune dépendance** : Node.js suffit pour le construire,
et le résultat (`dist/`) est un simple dossier de fichiers HTML/JS/polices à déposer chez n'importe quel hébergeur.

| Document | Contenu |
|---|---|
| `contenu/contenu.json` | **Tous les textes du site** — le seul fichier à modifier |
| `A-REMPLACER.md` | Liste générée de tout ce qui est provisoire (68 marqueurs, 2 images, textes d'exemple) |
| `docs/MOUVEMENT.md` | Concept, spécification du mouvement, variables, moments signatures |
| `docs/RAPPORT.md` | Performance et accessibilité : scores mesurés, poids, mouvement réduit |
| `LIMITES.md` | Limites connues, points légaux à vérifier, prochaines étapes |

## Installation

Prérequis : [Node.js](https://nodejs.org) 20 ou plus récent (testé avec 24.14). Rien d'autre à installer.

```bash
npm run dev      # construit, ouvre http://localhost:4321 et reconstruit à chaque modification
npm run build    # construit seulement (dossier dist/)
npm run serve    # sert dist/ sans reconstruire
```

Astuce : ajoutez `?reperes` à l'adresse (http://localhost:4321/?reperes) pour entourer chaque bloc provisoire.

## Modifier les textes

1. Ouvrez `contenu/contenu.json` avec un éditeur de texte (VS Code, Notepad++, TextEdit en mode texte brut).
2. Modifiez uniquement le texte entre guillemets, à droite des deux-points.
3. Lancez `npm run build`. En cas d'erreur de virgule ou de guillemet, le programme indique la ligne exacte.

- `"provisoire": true` → la section est un texte d'exemple (repéré dans le code par `data-placeholder`
  et `<!-- À REMPLACER -->`). Passez-le à `false` une fois validée.
- `"afficher": false` → masque une section entière (utile pour les témoignages, voir `LIMITES.md`).
- Tout `[TEXTE ENTRE CROCHETS]` s'affiche surligné sur le site tant qu'il n'est pas remplacé.
- Le téléphone s'écrit deux fois : `telephoneAffiche` (« 0470 12 34 56 ») et `telephoneLien` (« +32470123456 »).

## Remplacer une image

Deux images provisoires : le portrait (`accueil.image`, format 4:5) et la photo « en séance » (`aPropos.image`, format 4:3).

1. Exportez chaque photo en plusieurs largeurs et formats, nommés ainsi, dans `src/assets/images/` :
   `portrait-480.jpg`, `portrait-800.jpg`, `portrait-1200.jpg` (+ les mêmes en `.webp` et `.avif`, recommandés).
   Par exemple avec [Squoosh](https://squoosh.app) (gratuit, dans le navigateur), qualité 70-80.
2. Dans `contenu.json`, remplacez `"fichier": null` par `"fichier": "portrait"`, et mettez `largeur`/`hauteur`
   aux dimensions réelles de la plus grande version. Relisez aussi le texte `alt` (description pour les
   personnes aveugles).
3. `npm run build` génère automatiquement le `<picture>` avec AVIF → WebP → JPEG et le bon `srcset`.

Budget conseillé : portrait ≤ 60 Ko en 800 px AVIF, photo « séance » ≤ 90 Ko.

## Configurer le formulaire

Tant que `rendezVous.formulaire.action` est entre crochets, le formulaire est en **mode démonstration** (rien n'est envoyé).
Pour le brancher, créez un point de réception chez un service de formulaires et collez son adresse
(ex. `https://…/f/abc123`). Le site accepte toute réponse `2xx` à un `POST` classique.
Choisissez de préférence un service hébergé dans l'UE (voir `LIMITES.md`, RGPD). La politique de sécurité (CSP)
est mise à jour automatiquement pour autoriser ce domaine.

## Mise en ligne

Déposez le **contenu** du dossier `dist/` à la racine du site :

- **Netlify / Cloudflare Pages** : glisser-déposer `dist/`, ou relier le dépôt avec la commande `npm run build`
  et le dossier de publication `dist`. Le fichier `_headers` fournit sécurité et cache.
- **Hébergeur classique (OVH, Combell, one.com…)** : envoyer `dist/` par FTP. Le fichier `.htaccess` fait le même travail.

Avant la mise en ligne : renseigner `site.url` (active la balise canonical), remplacer tous les marqueurs,
vérifier les points légaux de `LIMITES.md`.

## Structure du code

```
contenu/contenu.json          tous les textes
scripts/build.mjs             construction : gabarits → HTML, CSS, CSP, liste À REMPLACER, budget de poids
scripts/serve.mjs             serveur de développement
src/templates/                gabarits HTML (une fonction par section)
src/styles/                   CSS, assemblé dans l'ordre des numéros puis injecté dans la page
  00-polices · 01-jetons · 02-base · 03-mise-en-page · 04-composants · 05-sections · 06-mouvement
src/scripts/
  main.js                     démarrage, chargement à la demande, cycle de vie
  motion/config.js            SYSTÈME DE MOUVEMENT (source unique → aussi converti en variables CSS)
  motion/reveal.js            apparitions au scroll
  motion/souffle.js           hero : pause hors écran, mémorisation de la pause
  motion/parcours.js          « le trajet » (chargé à la demande)
  motion/zone.js              carte de la zone (chargé à la demande)
  ui/menu.js · ui/barre-appel.js · ui/formulaire.js (à la demande)
src/assets/fonts/             polices hébergées localement (sous-ensembles latins)
src/static/                   favicon, robots.txt, _headers, .htaccess
```

## Structure du site (ajustée par rapport au brief)

Accueil → Soins → Déroulement d'une séance → **Zone** → À propos → Tarifs → Témoignages → FAQ → Contact.

La zone d'intervention est remontée juste après les soins : après « peut-elle m'aider ? », la question suivante
d'un patient (ou d'un proche) est « vient-elle jusque chez moi ? ». Le parcours de May (« À propos ») arrive
ensuite pour installer la confiance avant les questions pratiques. Le hero contient déjà un visage et trois
réassurances (zone, prescription, conventionnement), et la barre d'appel mobile rend l'appel possible à tout moment.
