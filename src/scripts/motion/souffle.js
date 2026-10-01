/**
 * Hero « Le souffle » — l'animation elle-même est 100 % CSS (06-mouvement.css,
 * section 2) et démarre sans JavaScript. Ce module ajoute :
 *  - la pause automatique quand le hero sort de l'écran (économie de batterie) ;
 *  - la mémorisation du choix « pause » d'une visite à l'autre ;
 *  - la classe .souffle-suspendu pour les navigateurs sans :has().
 */
const CLE = 'may:souffle-en-pause';

export function initSouffle({ reduit }) {
  const hero = document.querySelector('.hero');
  if (!hero || reduit) return () => {};
  const casePause = hero.querySelector('.souffle-pause__case');

  try {
    if (localStorage.getItem(CLE) === '1') casePause.checked = true;
  } catch { /* stockage indisponible (navigation privée) : sans importance */ }

  const synchroniser = () => {
    hero.classList.toggle('souffle-suspendu', casePause.checked);
    try {
      localStorage.setItem(CLE, casePause.checked ? '1' : '0');
    } catch { /* idem */ }
  };
  synchroniser();
  casePause.addEventListener('change', synchroniser);

  // Hors de l'écran : plus aucune image calculée pour les formes.
  const io = new IntersectionObserver(([e]) => hero.classList.toggle('hors-ecran', !e.isIntersecting));
  io.observe(hero);

  return () => {
    io.disconnect();
    casePause.removeEventListener('change', synchroniser);
    hero.classList.remove('hors-ecran', 'souffle-suspendu');
  };
}
