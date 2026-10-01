/**
 * Moment signature « Le trajet » (section séance à domicile). Chargé à la demande.
 *
 * Une « ligne de lecture » imaginaire est placée à 60 % de la hauteur de l'écran.
 *  - Le fil se remplit jusqu'à cette ligne. Dans les navigateurs récents, c'est
 *    du CSS pur (animation-timeline: view()) ; ailleurs, ce module écrit `scale`
 *    lui-même, une fois par image au maximum.
 *  - Chaque étape dont la pastille passe la ligne reçoit .est-atteinte ;
 *    la maison reçoit .est-arrive. En remontant, l'état s'inverse doucement.
 *  - Le grand compteur (écrans larges) suit l'étape en cours.
 * Les écouteurs de scroll n'existent que lorsque la section est visible.
 */
import { observe, duration, easing } from './config.js';

export function initParcours(trajet, { reduit }) {
  // Mouvement réduit : état final statique (fil plein, pastilles pleines), rien à faire.
  if (reduit) return () => {};

  const fil = trajet.querySelector('.parcours__fil');
  const trace = trajet.querySelector('[data-parcours-trace]');
  const etapes = [...trajet.querySelectorAll('[data-etape]')].map((li) => ({ li, pastille: li.querySelector('.etape__marqueur') }));
  const arrivee = trajet.querySelector('[data-parcours-arrivee] .parcours__maison');
  const compteur = document.querySelector('[data-parcours-compteur]');
  const natif = CSS.supports('animation-timeline: view()');

  // Les classes d'état sont posées sur la section entière (le compteur est dans l'autre colonne).
  const racine = trajet.closest('.parcours') ?? trajet;
  racine.classList.add('est-actif');
  let image = 0;
  let courant = 1;

  const centre = (el) => {
    const r = el.getBoundingClientRect();
    return r.top + r.height / 2;
  };

  function mesurer() {
    image = 0;
    const ligne = window.innerHeight * observe.ligneLecture;

    if (!natif) {
      const r = fil.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (ligne - r.top) / r.height));
      trace.style.scale = `1 ${p.toFixed(4)}`;
    }

    let atteintes = 0;
    for (const { li, pastille } of etapes) {
      const ok = centre(pastille) <= ligne;
      li.classList.toggle('est-atteinte', ok);
      if (ok) atteintes++;
    }
    racine.classList.toggle('est-arrive', centre(arrivee) <= ligne);
    majCompteur(Math.max(1, atteintes));
  }

  function majCompteur(n) {
    if (!compteur || n === courant) return;
    courant = n;
    compteur.textContent = String(n);
    // Web Animations API, avec les mêmes jetons que le CSS.
    compteur.animate(
      [{ opacity: 0, translate: '0 0.25em' }, { opacity: 1, translate: '0 0' }],
      { duration: duration.interface, easing: easing.arrivee },
    );
  }

  const demander = () => {
    if (!image) image = requestAnimationFrame(mesurer);
  };

  // N'écoute le scroll que lorsque la section est (presque) à l'écran.
  let ecoute = false;
  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !ecoute) {
      window.addEventListener('scroll', demander, { passive: true });
      window.addEventListener('resize', demander, { passive: true });
      ecoute = true;
      demander();
    } else if (!e.isIntersecting && ecoute) {
      window.removeEventListener('scroll', demander);
      window.removeEventListener('resize', demander);
      ecoute = false;
      demander(); // dernière mesure : état juste à la sortie
    }
  }, { rootMargin: '20% 0px' });
  io.observe(trajet);
  mesurer();

  return () => {
    io.disconnect();
    window.removeEventListener('scroll', demander);
    window.removeEventListener('resize', demander);
    cancelAnimationFrame(image);
    trace.style.removeProperty('scale');
    racine.classList.remove('est-actif', 'est-arrive');
    etapes.forEach(({ li }) => li.classList.remove('est-atteinte'));
    if (compteur) compteur.textContent = '1';
  };
}
