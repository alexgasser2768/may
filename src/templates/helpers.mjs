/**
 * Petites fonctions partagées par tous les gabarits.
 * Aucun texte ici : tout vient de contenu/contenu.json.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const ENTITES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Échappe une valeur pour un attribut HTML ou un <title> (aucune balise). */
export const esc = (v = '') => String(v).replace(/[&<>"']/g, (c) => ENTITES[c]);

/**
 * Échappe un texte de contenu ET repère les marqueurs [À REMPLACER] :
 * chaque « [QUELQUE CHOSE] » devient <span class="ph" data-placeholder>…</span>,
 * visible à l'écran et facile à retrouver dans le code.
 */
export const txt = (v = '') =>
  esc(v).replace(/\[([^\]]+)\]/g, '<span class="ph" data-placeholder>[$1]</span>');

/** Attribut data-placeholder + commentaire HTML pour une section provisoire. */
export const ph = (bloc, chemin) =>
  bloc && bloc.provisoire ? ` data-placeholder="contenu.json → ${chemin}"` : '';
export const phComment = (bloc, chemin) =>
  bloc && bloc.provisoire ? `<!-- À REMPLACER : texte provisoire (contenu.json → ${chemin}) -->` : '';

/** true si une valeur contient encore un marqueur entre crochets. */
export const estMarqueur = (v) => typeof v === 'string' && /\[[^\]]+\]/.test(v);

/**
 * Index d'enchaînement pour les apparitions (data-i="0…5").
 * Plafonné par stagger.max pour ne jamais faire attendre un élément trop longtemps.
 */
export const idx = (i, max) => ` data-i="${Math.min(i, max)}"`;

/** Supprime les lignes vides laissées par les gabarits. */
export const html = (strings, ...vals) =>
  strings.reduce((acc, s, i) => acc + s + (i < vals.length ? (vals[i] ?? '') : ''), '');

/* ------------------------------------------------------------------------ */
/* Images                                                                    */
/* ------------------------------------------------------------------------ */

const LARGEURS = [480, 800, 1200, 1600];

/**
 * Image responsive. Si `img.fichier` est renseigné (ex. "portrait"), le gabarit
 * cherche src/assets/images/portrait-480.avif, -800.webp, -1200.jpg… et génère
 * <picture> avec srcset AVIF → WebP → JPEG. Sinon : illustration provisoire SVG
 * aux bonnes proportions (aucun décalage de mise en page au remplacement).
 */
export function image(img, { racine, sizes, classe = '', prioritaire = false, dessin = 'portrait' }) {
  const { largeur: w, hauteur: h } = img;
  if (img.fichier) {
    const dossier = join(racine, 'src/assets/images');
    const source = (ext) =>
      LARGEURS.filter((l) => existsSync(join(dossier, `${img.fichier}-${l}.${ext}`)))
        .map((l) => `images/${img.fichier}-${l}.${ext} ${l}w`)
        .join(', ');
    const avif = source('avif');
    const webp = source('webp');
    const jpg = source('jpg');
    if (!jpg) throw new Error(`Image « ${img.fichier} » : aucun fichier ${img.fichier}-{480,800,1200,1600}.jpg trouvé dans src/assets/images/`);
    const plusPetit = jpg.split(', ')[0].split(' ')[0];
    return html`<picture class="${classe}">
      ${avif ? `<source type="image/avif" srcset="${avif}" sizes="${sizes}">` : ''}
      ${webp ? `<source type="image/webp" srcset="${webp}" sizes="${sizes}">` : ''}
      <img src="${plusPetit}" srcset="${jpg}" sizes="${sizes}" width="${w}" height="${h}" alt="${esc(img.alt)}"
        ${prioritaire ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'} decoding="async">
    </picture>`;
  }
  return html`<!-- À REMPLACER : image provisoire (${esc(img.legendeProvisoire)}) -->
    <div class="img-provisoire ${classe}" data-placeholder="image">
      ${dessinProvisoire(dessin, w, h, img.alt)}
      <span class="img-provisoire__etiquette" aria-hidden="true">Image provisoire</span>
    </div>`;
}

/** Illustrations abstraites et neutres : dégradés + silhouettes arrondies. */
function dessinProvisoire(type, w, h, alt) {
  const label = `Image provisoire : ${esc(alt)}`;
  if (type === 'portrait') {
    return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${label}" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="gp" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#D7EEE6"/><stop offset="1" stop-color="#AFDCCD"/></linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#gp)"/>
      <circle cx="${w * 0.5}" cy="${h * 0.38}" r="${w * 0.17}" fill="#FAFCFB" opacity=".85"/>
      <path d="M${w * 0.14} ${h} C${w * 0.18} ${h * 0.7} ${w * 0.32} ${h * 0.6} ${w * 0.5} ${h * 0.6} S${w * 0.82} ${h * 0.7} ${w * 0.86} ${h}Z" fill="#FAFCFB" opacity=".85"/>
    </svg>`;
  }
  // Scène « séance » : deux silhouettes et une chaise, très stylisées.
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${label}" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="gs" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E3EFEA"/><stop offset="1" stop-color="#CDE6DD"/></linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#gs)"/>
    <ellipse cx="${w * 0.5}" cy="${h * 0.92}" rx="${w * 0.42}" ry="${h * 0.05}" fill="#165069" opacity=".08"/>
    <rect x="${w * 0.22}" y="${h * 0.55}" width="${w * 0.2}" height="${h * 0.06}" rx="${h * 0.02}" fill="#85A3AF"/>
    <rect x="${w * 0.23}" y="${h * 0.61}" width="${w * 0.018}" height="${h * 0.3}" fill="#85A3AF"/>
    <rect x="${w * 0.4}" y="${h * 0.61}" width="${w * 0.018}" height="${h * 0.3}" fill="#85A3AF"/>
    <circle cx="${w * 0.32}" cy="${h * 0.3}" r="${h * 0.075}" fill="#FAFCFB"/>
    <path d="M${w * 0.24} ${h * 0.56} C${w * 0.24} ${h * 0.42} ${w * 0.4} ${h * 0.4} ${w * 0.4} ${h * 0.56}Z" fill="#FAFCFB"/>
    <circle cx="${w * 0.62}" cy="${h * 0.24}" r="${h * 0.08}" fill="#FAFCFB"/>
    <path d="M${w * 0.52} ${h * 0.9} C${w * 0.5} ${h * 0.45} ${w * 0.56} ${h * 0.36} ${w * 0.64} ${h * 0.36} S${w * 0.76} ${h * 0.5} ${w * 0.74} ${h * 0.9}Z" fill="#FAFCFB"/>
    <path d="M${w * 0.56} ${h * 0.46} C${w * 0.48} ${h * 0.5} ${w * 0.43} ${h * 0.46} ${w * 0.38} ${h * 0.44}" stroke="#FAFCFB" stroke-width="${h * 0.035}" stroke-linecap="round" fill="none"/>
  </svg>`;
}
