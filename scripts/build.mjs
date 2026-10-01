/**
 * Construction du site — Node ≥ 20, aucune dépendance.
 *
 *   node scripts/build.mjs
 *
 * 1. lit et vérifie contenu/contenu.json (message clair en cas d'erreur de syntaxe) ;
 * 2. convertit src/scripts/motion/config.js en variables CSS ;
 * 3. assemble et allège le CSS (injecté dans la page : aucune requête bloquante) ;
 * 4. génère les pages HTML statiques (tout le contenu est lisible sans JS) ;
 * 5. calcule la Content-Security-Policy (empreintes du script et du style en ligne) ;
 * 6. écrit A-REMPLACER.md, la liste de tous les textes et images provisoires ;
 * 7. vérifie le budget de poids.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync, brotliCompressSync } from 'node:zlib';
import { createHash } from 'node:crypto';

import * as motion from '../src/scripts/motion/config.js';
import { page, SCRIPT_TETE } from '../src/templates/layout.mjs';
import { accueil } from '../src/templates/accueil.mjs';
import { pageLegale } from '../src/templates/legal.mjs';
import { estMarqueur } from '../src/templates/helpers.mjs';

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(RACINE, 'src');
const DIST = join(RACINE, 'dist');

/** Budget de poids (octets compressés gzip). Le build échoue s'il est dépassé. */
const BUDGET = {
  html: 30_000, // page d'accueil, CSS compris
  jsInitial: 12_000, // JS chargé au démarrage
  jsTotal: 22_000, // tous les modules, y compris ceux chargés à la demande
  polices: 50_000,
  premierAffichage: 90_000, // HTML + polices + JS initial (hors photos réelles)
};

/* ------------------------------------------------------------------------ */
/* 1. Contenu                                                                */
/* ------------------------------------------------------------------------ */
function lireContenu() {
  const chemin = join(RACINE, 'contenu/contenu.json');
  const brut = readFileSync(chemin, 'utf8');
  try {
    return JSON.parse(brut);
  } catch (e) {
    const pos = Number((e.message.match(/position (\d+)/) || [])[1]);
    let ou = '';
    if (!Number.isNaN(pos)) {
      const avant = brut.slice(0, pos).split('\n');
      const ligne = avant.length;
      ou = `\n  → ligne ${ligne}, colonne ${avant.at(-1).length + 1} :\n    ${brut.split('\n')[ligne - 1]?.trim()}`;
    }
    console.error(`\n✖ contenu/contenu.json contient une erreur de syntaxe.${ou}\n  Vérifiez les virgules en fin de ligne et les guillemets.\n  (${e.message})\n`);
    process.exit(1);
  }
}

/* ------------------------------------------------------------------------ */
/* 2. Variables de mouvement → CSS                                           */
/* ------------------------------------------------------------------------ */
const kebab = (s) => s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
function variablesMouvement() {
  const l = [];
  for (const [k, v] of Object.entries(motion.easing)) l.push(`--ease-${kebab(k)}:${v}`);
  for (const [k, v] of Object.entries(motion.duration)) l.push(`--dur-${kebab(k)}:${v}ms`);
  l.push(`--stagger-liste:${motion.stagger.liste}ms`, `--stagger-bloc:${motion.stagger.bloc}ms`);
  for (const [k, v] of Object.entries(motion.amplitude)) {
    l.push(`--${kebab(k)}:${k.startsWith('shift') ? `${v}px` : v}`);
  }
  return `/* Généré depuis src/scripts/motion/config.js */\n:root{${l.join(';')}}\n`;
}

/* ------------------------------------------------------------------------ */
/* 3. CSS                                                                    */
/* ------------------------------------------------------------------------ */
function allegerCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};,>])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();
}
function construireCss() {
  const dossier = join(SRC, 'styles');
  const fichiers = readdirSync(dossier).filter((f) => f.endsWith('.css')).sort();
  const brut = variablesMouvement() + fichiers.map((f) => readFileSync(join(dossier, f), 'utf8')).join('\n');
  return allegerCss(brut);
}

/* ------------------------------------------------------------------------ */
/* 4. JavaScript : copie, sans les commentaires de documentation             */
/* ------------------------------------------------------------------------ */
function copierJs(dossier = join(SRC, 'scripts'), cible = join(DIST, 'js')) {
  mkdirSync(cible, { recursive: true });
  for (const f of readdirSync(dossier)) {
    const p = join(dossier, f);
    if (statSync(p).isDirectory()) copierJs(p, join(cible, f));
    else if (f.endsWith('.js')) {
      const js = readFileSync(p, 'utf8')
        .replace(/\/\*\*[\s\S]*?\*\//g, '') // blocs /** … */
        .replace(/^\s*\/\/.*$/gm, '') // lignes de commentaire seules
        .replace(/\n{2,}/g, '\n');
      writeFileSync(join(cible, f), js);
    }
  }
}

/* ------------------------------------------------------------------------ */
/* 5. Sécurité                                                               */
/* ------------------------------------------------------------------------ */
const empreinte = (s) => `'sha256-${createHash('sha256').update(s).digest('base64')}'`;
function csp(css, c) {
  const { action, afficher } = c.rendezVous.formulaire;
  const origine = afficher === false || estMarqueur(action) ? '' : ` ${new URL(action).origin}`;
  return [
    "default-src 'self'",
    `script-src 'self' ${empreinte(SCRIPT_TETE)}`,
    `style-src 'self' ${empreinte(css)}`,
    "img-src 'self' data:",
    "font-src 'self'",
    `connect-src 'self'${origine}`,
    `form-action 'self'${origine}`,
    "base-uri 'self'",
    "object-src 'none'",
  ].join('; ');
}

/* ------------------------------------------------------------------------ */
/* 6. Liste de ce qui reste à remplacer                                      */
/* ------------------------------------------------------------------------ */
function listeARemplacer(c) {
  const marqueurs = [];
  const provisoires = [];
  const images = [];
  const parcourir = (v, chemin, provisoire) => {
    if (v && typeof v === 'object') {
      if (v.afficher === false) return; // section masquée : rien à remplacer
      const p = provisoire || v.provisoire === true;
      if ('fichier' in v && 'alt' in v && !v.fichier) images.push({ chemin, v });
      for (const [k, x] of Object.entries(v)) {
        if (k.startsWith('_') || ['provisoire', 'afficher', 'icone', 'cible', 'page', 'fichier', 'largeur', 'hauteur', 'telephoneLien', 'langue'].includes(k)) continue;
        parcourir(x, Array.isArray(v) ? `${chemin}[${k}]` : chemin ? `${chemin}.${k}` : k, p);
      }
    } else if (typeof v === 'string') {
      const m = v.match(/\[[^\]]+\]/g);
      if (m) marqueurs.push({ chemin, m: [...new Set(m)] });
      else if (provisoire) provisoires.push({ chemin, v });
    }
  };
  parcourir(c, '', false);
  const court = (s) => (s.length > 90 ? `${s.slice(0, 87)}…` : s);
  const md = `# À remplacer avant la mise en ligne

> Fichier généré automatiquement par \`npm run build\` à partir de \`contenu/contenu.json\`.
> Ne le modifiez pas : il se met à jour à chaque construction. Pour repérer ces éléments
> directement sur le site, ouvrez-le avec \`?reperes\` à la fin de l'adresse
> (ex. http://localhost:4321/?reperes).

## 1. Informations à fournir — ${marqueurs.length} textes contiennent un [MARQUEUR]

Ces valeurs ne doivent **jamais** être inventées : elles doivent venir de May.

| Emplacement dans contenu.json | Marqueurs |
|---|---|
${marqueurs.map((x) => `| \`${x.chemin}\` | ${x.m.join(' · ')} |`).join('\n')}

${c.contact.telephoneLien === '+32000000000' ? 'Et aussi : `contact.telephoneLien` (valeur factice) — le numéro réel au format international.\n' : ''}
## 2. Images provisoires — ${images.length}

| Emplacement | Format attendu | Description |
|---|---|---|
${images.map((x) => `| \`${x.chemin}\` | ${x.v.largeur} × ${x.v.hauteur} px (au moins) | ${x.v.alt} |`).join('\n')}

Pour remplacer une image : voir README.md, « Remplacer une image ».

## 3. Textes d'exemple à relire ou réécrire — ${provisoires.length}

Rédigés pour tester la mise en page, avec un ton et une longueur réalistes.
Ils sont plausibles mais **n'ont pas été validés par May** : chaque affirmation (soins proposés,
déroulement, durée, conditions) est à confirmer. Une fois une section validée, passez
son \`"provisoire"\` à \`false\`.

| Emplacement | Début du texte |
|---|---|
${provisoires.map((x) => `| \`${x.chemin}\` | ${court(x.v).replace(/\|/g, '\\|')} |`).join('\n')}
`;
  writeFileSync(join(RACINE, 'A-REMPLACER.md'), md);
  return { marqueurs: marqueurs.length, images: images.length, provisoires: provisoires.length };
}

/* ------------------------------------------------------------------------ */
/* 7. Poids                                                                  */
/* ------------------------------------------------------------------------ */
const JS_INITIAL = ['js/main.js', 'js/motion/config.js', 'js/motion/reveal.js', 'js/motion/souffle.js', 'js/ui/menu.js', 'js/ui/barre-appel.js'];
function poids() {
  const lister = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? lister(join(d, f)) : [join(d, f)]));
  const t = {};
  for (const f of lister(DIST)) {
    const b = readFileSync(f);
    t[relative(DIST, f)] = { brut: b.length, gzip: gzipSync(b, { level: 9 }).length, br: brotliCompressSync(b).length };
  }
  const somme = (filtre, cle = 'gzip') => Object.entries(t).filter(([f]) => filtre(f)).reduce((s, [, v]) => s + v[cle], 0);
  const r = {
    html: t['index.html'].gzip,
    jsInitial: somme((f) => JS_INITIAL.includes(f)),
    jsTotal: somme((f) => f.endsWith('.js')),
    polices: somme((f) => f.endsWith('.woff2')),
  };
  r.premierAffichage = r.html + r.jsInitial + r.polices;
  const ko = (n) => `${(n / 1024).toFixed(1)} Ko`.padStart(9);
  console.log('\n  Fichier                              brut      gzip    brotli');
  for (const [f, v] of Object.entries(t).sort()) console.log(`  ${f.padEnd(32)}${ko(v.brut)} ${ko(v.gzip)} ${ko(v.br)}`);
  console.log('\n  Budget (gzip)');
  let depasse = false;
  for (const [k, v] of Object.entries(r)) {
    const ok = v <= BUDGET[k];
    depasse ||= !ok;
    console.log(`  ${ok ? '✔' : '✖'} ${k.padEnd(18)}${ko(v)} / ${ko(BUDGET[k])}`);
  }
  writeFileSync(join(RACINE, 'docs/poids.json'), JSON.stringify({ fichiers: t, totaux: r, budget: BUDGET }, null, 2));
  return depasse;
}

/* ------------------------------------------------------------------------ */
/* Construction                                                              */
/* ------------------------------------------------------------------------ */
const c = lireContenu();
rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });
mkdirSync(join(RACINE, 'docs'), { recursive: true });

const css = construireCss();
const politique = csp(css, c);
const ctx = { racine: RACINE, stagger: motion.stagger };

const pages = [
  { fichier: 'index.html', accueil: true, titre: c.site.titrePage, description: c.site.description, corps: accueil(c, ctx) },
  ...Object.entries(c.pagesLegales).filter(([, p]) => p.afficher !== false).map(([cle, p]) => ({
    fichier: `${cle}.html`,
    titre: `${p.titre} — ${c.site.nom}`,
    description: c.site.description,
    corps: pageLegale(p, cle, c),
    cheminCanonique: `${cle}.html`,
    prechargements: cle === 'merci' ? '<meta name="robots" content="noindex">\n' : '',
  })),
];
for (const p of pages) {
  writeFileSync(join(DIST, p.fichier), page({ c, css, csp: politique, ...p }));
}

copierJs();
cpSync(join(SRC, 'assets/fonts'), join(DIST, 'fonts'), { recursive: true });
if (existsSync(join(SRC, 'assets/images'))) cpSync(join(SRC, 'assets/images'), join(DIST, 'images'), { recursive: true });
cpSync(join(SRC, 'static'), DIST, { recursive: true });

const reste = listeARemplacer(c);
console.log(`✔ Site construit dans dist/ (${pages.length} pages).`);
console.log(`  À remplacer : ${reste.marqueurs} marqueurs, ${reste.images} images, ${reste.provisoires} textes d'exemple → A-REMPLACER.md`);
if (poids()) {
  console.error('\n✖ Budget de poids dépassé.');
  process.exit(1);
}
