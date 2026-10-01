/**
 * Zone d'intervention. Chargé à la demande.
 *  - Les ondes (CSS, 06-mouvement.css section 4) ne tournent que carte visible.
 *  - Survoler ou toucher une commune de la liste allume son point sur la carte.
 *    Pur bonus : la liste se suffit à elle-même.
 */
export function initZone(carte, { reduit }) {
  const liste = document.querySelector('.communes');
  const points = carte.querySelectorAll('[data-point]');

  let io = null;
  if (!reduit) {
    io = new IntersectionObserver(([e]) => carte.classList.toggle('est-en-vue', e.isIntersecting));
    io.observe(carte);
  }

  let actif = null;
  const activer = (i) => {
    if (i === actif) return;
    actif = i;
    liste?.querySelectorAll('[data-commune]').forEach((li) => li.classList.toggle('est-active', li.dataset.commune === i));
    points.forEach((p) => p.classList.toggle('est-active', p.dataset.point === i));
  };
  const surPointeur = (e) => activer(e.target.closest?.('[data-commune]')?.dataset.commune ?? null);
  const quitter = () => activer(null);
  liste?.addEventListener('pointerover', surPointeur);
  liste?.addEventListener('pointerleave', quitter);

  return () => {
    io?.disconnect();
    carte.classList.remove('est-en-vue');
    liste?.removeEventListener('pointerover', surPointeur);
    liste?.removeEventListener('pointerleave', quitter);
    activer(null);
  };
}
