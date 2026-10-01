# Rapport de performance et d'accessibilité

Mesures du 28/09/2026 sur la version avec contenu provisoire, serveur local (gzip), Chrome 151 stable, Linux.
Les chiffres de poids sont recalculés à chaque `npm run build` (`docs/poids.json`).

## Scores Lighthouse 12.8.2

| Profil | Performance | Accessibilité | Bonnes pratiques | SEO |
|---|---|---|---|---|
| Mobile (4G simulée, CPU ÷4) | **100** | **100** | **100** | **100** |
| Ordinateur | **100** | **100** | **100** | **100** |

| Indicateur (mobile, 4G simulée) | Valeur | Seuil « bon » |
|---|---|---|
| First Contentful Paint | 1,0 s | < 1,8 s |
| Largest Contentful Paint (le titre du hero) | 1,4 s | < 2,5 s |
| Total Blocking Time | 0 ms | < 200 ms |
| Cumulative Layout Shift | **0** | < 0,1 |
| Speed Index | 1,0 s | < 3,4 s |

Le SEO est passé de 92 à 100 après deux corrections : la balise canonical n'est plus générée tant que le domaine est un
marqueur, et le lien du logo n'a plus d'`aria-label` différent du texte visible (WCAG 2.5.3).

## Poids de page (gzip)

| Élément | Taille | Budget |
|---|---|---|
| `index.html` (CSS en ligne compris) | 20,4 Ko | 29,3 Ko |
| JS chargé au démarrage (6 modules) | 3,5 Ko | 11,7 Ko |
| JS total (dont 3 modules chargés à la demande) | 6,5 Ko | 21,5 Ko |
| Polices (2 fichiers woff2) | 46,3 Ko | 48,8 Ko |
| **Premier affichage complet** | **70,2 Ko** | 87,9 Ko |

Lighthouse mesure 73 Ko transférés au total. Le budget est vérifié à chaque build, qui **échoue** s'il est dépassé.
Avec les deux vraies photos (≈ 60 + 90 Ko en AVIF), la page restera sous 230 Ko, soit environ 10 fois moins qu'un site vitrine moyen.

Principaux leviers :
- Polices instanciées et réduites au latin : 155 Ko → 46 Ko. Leurs métriques de repli ont été calculées (`size-adjust`…) pour que
  l'arrivée de la vraie police ne décale rien.
- CSS injecté dans la page (aucune requête bloquante) ; JS en modules natifs, sans framework ni bibliothèque.
- `parcours.js`, `zone.js` et `formulaire.js` ne sont téléchargés que lorsque leur section approche de l'écran.

## Fluidité (Chrome, téléphone émulé 390 px, DPR 2, CPU ralenti ×4)

| Scénario | Images/s | 95e percentile | Images > 33 ms | Calculs de mise en page |
|---|---|---|---|---|
| Hero au repos (3 formes + halo qui respirent) | 60 | 16,8 ms | 0 | **0** en 4 s |
| Défilement continu dans « le trajet » | 60 | 16,8 ms | 0 | — |

Zéro recalcul de mise en page pendant la respiration : les animations tournent entièrement sur le compositeur GPU.
Animations hors écran mises en pause (hero, ondes de la carte) ; écouteurs de scroll actifs seulement quand « le trajet » est visible.

## Tests fonctionnels automatisés (puppeteer)

| Test | Résultat |
|---|---|
| Aucun défilement horizontal à 320, 390, 768 et 1280 px | ✔ |
| Aucune erreur JS ni violation CSP | ✔ |
| Menu : ouverture, focus sur « Fermer », fermeture par Échap → focus rendu au bouton | ✔ |
| Menu : fermeture par le bouton « retour » du navigateur | ✔ |
| Menu : un lien ferme le menu, défile vers la section et y place le focus | ✔ |
| Formulaire vide : résumé des 4 erreurs avec liens, focus sur le résumé, `aria-invalid` sur les champs | ✔ |
| E-mail invalide : message clair à la sortie du champ | ✔ |
| Envoi valide (mode démo) : message de réussite affiché et focalisé | ✔ |
| « Le trajet » natif (`animation-timeline`) et repli JS simulé : fil, étapes, maison | ✔ |
| **Sans JavaScript** : tout le contenu visible, FAQ fonctionnelle, menu → navigation du pied, formulaire en envoi classique | ✔ |
| **Mouvement réduit** : 0 animation dans le hero, pas de bouton pause, pas de défilement fluide, fil plein, fondus seuls | ✔ |
| Clavier : ordre logique (lien d'évitement → logo → navigation → appel → hero → pause → FAQ…), focus visible partout | ✔ |

## Accessibilité : ce qui est en place

- Texte courant de 18 à 20 px, interligne 1,6, lignes ≤ 65 caractères. Police Atkinson Hyperlegible (conçue pour les personnes malvoyantes).
- Contrastes (palette de la carte de visite) : texte 12,6:1, texte secondaire ≥ 5,5:1, boutons 8,8:1, liens 5,5:1, bordures de champ 3,7:1, erreurs 6,7:1, focus 4,3:1 (5,8:1 sur le fond pétrole). Audit Lighthouse « contraste » : réussi.
- Cibles tactiles ≥ 48 × 48 px (56 px pour les actions principales), bien espacées.
- Téléphone cliquable (`tel:`) dans l'en-tête, le hero, le menu, le contact, le pied de page et la **barre fixe du bas** (zone sûre iOS prise en compte).
- HTML sémantique : repères (`header`, `nav`, `main`, `footer`), titres hiérarchisés, listes, `dl`, `details`, `blockquote`/`figcaption`.
- Aucun texte découpé en lettres ou en mots : les lecteurs d'écran lisent des phrases entières. Décor en `aria-hidden`.
- Animation automatique longue → bouton pause (WCAG 2.2.2), qui fonctionne aussi sans JS.
- Formulaire : libellés visibles, aides reliées par `aria-describedby`, `autocomplete`, `type="tel"`/`email`, `inputmode`,
  police ≥ 16 px (pas de zoom automatique sur iOS), messages d'erreur rédigés comme des conseils.

## Non testé (à faire avant la mise en ligne)

- **Vrais appareils** iOS Safari et Android Chrome, en portrait et en paysage : aucun appareil n'était disponible ici.
  Les tests ont été faits en émulation Chrome (écran, toucher, DPR, CPU, 4G).
- **Firefox et Safari** : Firefox n'a pas pu être lancé en mode automatisé sur cette machine. Le repli du « trajet » a été
  validé en simulant un navigateur sans `animation-timeline`, mais un passage manuel reste nécessaire.
- **Lecteurs d'écran réels** (VoiceOver iOS, TalkBack, NVDA) : la structure est conforme, mais une écoute humaine reste indispensable.
- **Test utilisateur** avec deux ou trois patients âgés : c'est le test le plus précieux pour ce site.
