import { esc, txt, html, estMarqueur } from './helpers.mjs';
import { icone } from './icones.mjs';

/**
 * Script en ligne, exécuté avant tout affichage (≈ 400 octets) :
 * 1. remplace .no-js par .js (le CSS sait alors que les améliorations arrivent) ;
 * 2. active les apparitions au scroll seulement si IntersectionObserver existe ;
 * 3. filet de sécurité : si le module principal n'a pas démarré après 3,5 s
 *    (réseau très lent, script bloqué), on retire .reveal-ok pour que rien ne
 *    reste invisible. Le contenu ne dépend jamais du JavaScript.
 */
export const SCRIPT_TETE = `(function(d){var r=d.documentElement;r.classList.remove('no-js');r.classList.add('js');if('IntersectionObserver'in window){r.classList.add('reveal-ok');setTimeout(function(){if(!window.__mayPret)r.classList.remove('reveal-ok')},3500)}if(/[?&]reperes\\b/.test(location.search))r.classList.add('montrer-reperes')})(document);`;

export function page({ c, titre, description, corps, css, csp, cheminCanonique = '', accueil = false, prechargements = '' }) {
  const ld = accueil ? donneesStructurees(c) : '';
  return html`<!doctype html>
<html lang="${esc(c.site.langue)}" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(titre)}</title>
<meta name="description" content="${esc(description)}">
<meta http-equiv="Content-Security-Policy" content="${csp}">
<meta name="theme-color" content="#F1F6F3">
<meta name="color-scheme" content="light">
<meta name="format-detection" content="telephone=no">
${estMarqueur(c.site.url) ? '<!-- Balise canonical ajoutée automatiquement quand site.url sera renseigné -->' : `<link rel="canonical" href="${esc(c.site.url)}/${cheminCanonique}">`}
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(titre)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:locale" content="fr_BE">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="preload" href="fonts/fraunces-soft-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="fonts/atkinson-next-latin.woff2" as="font" type="font/woff2" crossorigin>
<script>${SCRIPT_TETE}</script>
<style>${css}</style>
<link rel="modulepreload" href="js/main.js">
<link rel="modulepreload" href="js/motion/config.js">
${prechargements}${ld}
</head>
<body${accueil ? ' class="page-accueil"' : ''}>
<a class="lien-evitement" href="#contenu">${txt(c.interface.lienEvitement)}</a>
${entete(c, accueil)}
<main id="contenu" tabindex="-1">
${corps}
</main>
${pied(c, accueil)}
${barreAppel(c, accueil)}
${menuMobile(c, accueil)}
<script type="module" src="js/main.js"></script>
</body>
</html>
`;
}

/** Lien vers une section : ancre simple sur l'accueil, page + ancre ailleurs. */
const lien = (cible, accueil) => (accueil ? `#${cible}` : `./#${cible}`);

function marque(c) {
  return `<a class="marque" href="./">
    <svg class="marque__signe" viewBox="0 0 40 40" width="40" height="40" aria-hidden="true" focusable="false">
      <path d="M20 4c9 0 16 6.2 16 15.4C36 29 28.8 36 19.6 36 10.5 36 4 29.5 4 20.8 4 11 11 4 20 4Z" fill="#D7EEE6"/>
      <path d="M11 26c2.2-5.5 4.6-9.5 6.4-9.5 2.3 0 1.2 7 3.4 7 2 0 3.7-5.4 8.2-10" fill="none" stroke="#165069" stroke-width="2.4" stroke-linecap="round"/>
    </svg>
    <span class="marque__texte"><span class="marque__nom">${txt(c.site.nom)}</span><span class="marque__metier">${txt(c.site.metier)}</span></span>
  </a>`;
}

function entete(c, accueil) {
  const b = c.boutons;
  return html`<header class="entete">
  <div class="entete__barre conteneur">
    ${marque(c)}
    <nav class="entete__nav" aria-label="Navigation principale">
      <ul role="list">
        ${c.navigation.map((n) => `<li><a href="${lien(n.cible, accueil)}">${txt(n.libelle)}</a></li>`).join('')}
      </ul>
    </nav>
    <a class="btn btn--primaire btn--compact entete__appel" href="tel:${esc(c.contact.telephoneLien)}">
      ${icone('telephone')}<span>${txt(c.contact.telephoneAffiche)}</span>
    </a>
    <a class="bouton-menu entete__menu" href="#navigation-pied" data-menu-ouvrir aria-haspopup="dialog">
      ${icone('menu')}<span>${txt(b.menu)}</span>
    </a>
  </div>
</header>`;
}

/** Barre fixe en bas d'écran sur mobile : appeler, rendez-vous, menu — à portée de pouce. */
function barreAppel(c, accueil) {
  const b = c.boutons;
  return html`<nav class="barre-appel" aria-label="Contact rapide">
  <a class="barre-appel__btn barre-appel__btn--appel" href="tel:${esc(c.contact.telephoneLien)}">
    ${icone('telephone')}<span>${txt(b.appeler)}</span>
  </a>
  <a class="barre-appel__btn" href="${lien('contact', accueil)}">
    ${icone('calendrier')}<span>${txt(b.rendezVousCourt)}</span>
  </a>
  <a class="barre-appel__btn" href="#navigation-pied" data-menu-ouvrir aria-haspopup="dialog">
    ${icone('menu')}<span>${txt(b.menu)}</span>
  </a>
</nav>`;
}

/**
 * Menu mobile : un <dialog> (piège du focus, arrière-plan inerte et touche Échap
 * natifs). Sans JavaScript il n'est jamais ouvert : les boutons « Menu » sont de
 * simples liens vers la navigation du pied de page.
 */
function menuMobile(c, accueil) {
  const b = c.boutons;
  return html`<dialog class="menu" id="menu" aria-label="Menu">
  <div class="menu__feuille">
    <div class="menu__entete">
      <p class="menu__titre" aria-hidden="true">${txt(b.menu)}</p>
      <button class="bouton-menu menu__fermer" type="button" data-menu-fermer>
        ${icone('fermer')}<span>${txt(b.fermer)}</span>
      </button>
    </div>
    <nav aria-label="Menu">
      <ul class="menu__liens" role="list">
        ${c.navigation.map((n, i) => `<li data-i="${i}"><a href="${lien(n.cible, accueil)}">${txt(n.libelle)}${icone('fleche', 'icone menu__fleche')}</a></li>`).join('')}
      </ul>
    </nav>
    <div class="menu__actions">
      <a class="btn btn--primaire btn--large" href="tel:${esc(c.contact.telephoneLien)}">${icone('telephone')}<span>${txt(b.appelerLong)} · ${txt(c.contact.telephoneAffiche)}</span></a>
    </div>
  </div>
</dialog>`;
}

function pied(c, accueil) {
  const p = c.pied;
  return html`<footer class="pied"${p.provisoire ? ' data-placeholder="contenu.json → pied"' : ''}>
  <div class="conteneur pied__grille">
    <div class="pied__marque">
      ${marque(c)}
      <p>${txt(p.texte)}</p>
      <p><a class="lien-fort" href="tel:${esc(c.contact.telephoneLien)}">${icone('telephone')} ${txt(c.contact.telephoneAffiche)}</a></p>
      <p><a class="lien-fort" href="mailto:${esc(c.contact.email)}">${icone('email')} ${txt(c.contact.email)}</a></p>
    </div>
    <nav id="navigation-pied" class="pied__nav" aria-label="${esc(p.navigationTitre)}" tabindex="-1">
      <h2 class="pied__titre">${txt(p.navigationTitre)}</h2>
      <ul role="list">
        ${c.navigation.map((n) => `<li><a href="${lien(n.cible, accueil)}">${txt(n.libelle)}</a></li>`).join('')}
      </ul>
    </nav>
    <div class="pied__legal">
      ${p.liensLegaux.length ? `<ul role="list">${p.liensLegaux.map((l) => `<li><a href="${l.page}.html">${txt(l.libelle)}</a></li>`).join('')}</ul>` : ''}
      <p class="pied__note">${txt(c.contact.urgence)}</p>
      <p class="pied__note">© ${esc(c.site.annee)} ${txt(c.site.nom)}</p>
    </div>
  </div>
</footer>`;
}

/** Données structurées schema.org : seules les valeurs réelles (sans [MARQUEUR]) sont publiées. */
function donneesStructurees(c) {
  const propre = (v) => (estMarqueur(v) ? undefined : v);
  const communes = [c.zone?.base, ...(c.zone?.communes || [])].filter(Boolean).map((x) => (typeof x === 'string' ? x : x.nom)).filter((x) => !estMarqueur(x));
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Physiotherapy',
    name: c.site.nom,
    description: propre(c.site.description),
    url: propre(c.site.url),
    telephone: estMarqueur(c.contact.telephoneAffiche) ? undefined : c.contact.telephoneLien,
    email: propre(c.contact.email),
    areaServed: communes.length ? communes : undefined,
    availableLanguage: 'fr',
  };
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>\n`;
}
