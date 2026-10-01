/**
 * Point d'entrée. Amélioration progressive : tout le site fonctionne sans ce
 * fichier ; il ajoute le mouvement et le confort d'usage.
 *
 * Cycle de vie : chaque module expose init…() qui renvoie une fonction de
 * destruction (observateurs déconnectés, écouteurs retirés, classes nettoyées).
 * Si la personne change son réglage « réduire les animations » pendant la
 * visite, tous les modules de mouvement sont détruits puis recréés dans le bon
 * régime — sans recharger la page, sans fuite.
 */
import { observe } from './motion/config.js';
import { initReveal } from './motion/reveal.js';
import { initSouffle } from './motion/souffle.js';
import { initMenu } from './ui/menu.js';
import { initBarreAppel } from './ui/barre-appel.js';

// Signale au script de tête que le module a démarré (sinon filet de sécurité).
window.__mayPret = true;

/**
 * Charge un module seulement quand son élément approche de l'écran
 * (à moins d'un écran de distance). Renvoie une fonction de destruction qui
 * fonctionne même si le module n'est pas encore arrivé.
 */
function chargerQuandProche(selecteur, importer, demarrer) {
  const el = document.querySelector(selecteur);
  if (!el) return () => {};
  let detruire = null;
  let annule = false;
  const io = new IntersectionObserver(
    async ([entree]) => {
      if (!entree.isIntersecting) return;
      io.disconnect();
      const module = await importer();
      if (!annule) detruire = demarrer(module, el);
    },
    { rootMargin: observe.lazyMargin },
  );
  io.observe(el);
  return () => {
    annule = true;
    io.disconnect();
    detruire?.();
  };
}

const mqReduit = window.matchMedia('(prefers-reduced-motion: reduce)');
let destructeursMouvement = [];

function demarrerMouvement() {
  const reduit = mqReduit.matches;
  destructeursMouvement = [
    initReveal(),
    initSouffle({ reduit }),
    chargerQuandProche('[data-parcours]', () => import('./motion/parcours.js'), (m, el) => m.initParcours(el, { reduit })),
    chargerQuandProche('[data-zone]', () => import('./motion/zone.js'), (m, el) => m.initZone(el, { reduit })),
  ];
}
function arreterMouvement() {
  destructeursMouvement.forEach((d) => d());
  destructeursMouvement = [];
}

if ('IntersectionObserver' in window) {
  demarrerMouvement();
  mqReduit.addEventListener('change', () => {
    arreterMouvement();
    demarrerMouvement();
  });
  chargerQuandProche('[data-formulaire]', () => import('./ui/formulaire.js'), (m, el) => m.initFormulaire(el));
}
initMenu();
initBarreAppel();
