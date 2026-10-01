/**
 * Apparitions au scroll : ajoute .est-visible aux éléments [data-reveal] quand
 * ils entrent dans l'écran. Toute la chorégraphie (durée, courbe, décalage,
 * version réduite) est en CSS (06-mouvement.css, section 1) : ce module ne fait
 * que dire « maintenant ». Une seule fois par élément.
 */
import { observe } from './config.js';

export function initReveal() {
  if (!document.documentElement.classList.contains('reveal-ok')) return () => {};

  const io = new IntersectionObserver(
    (entrees) => {
      for (const e of entrees) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('est-visible');
        io.unobserve(e.target);
      }
    },
    { rootMargin: observe.revealMargin, threshold: observe.revealThreshold },
  );
  document.querySelectorAll('[data-reveal]:not(.est-visible)').forEach((el) => io.observe(el));

  return () => io.disconnect();
}
