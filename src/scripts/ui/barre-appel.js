/**
 * Barre d'appel mobile : pendant la saisie d'un champ, le clavier virtuel
 * remonte la barre fixe par-dessus le formulaire. On l'efface donc le temps de
 * la saisie (.saisie-en-cours), elle revient dès que le champ perd le focus.
 */
export function initBarreAppel() {
  const form = document.querySelector('[data-formulaire]');
  if (!form) return () => {};
  const mobile = window.matchMedia('(max-width: 63.99em)');
  const corps = document.body;

  const entree = (e) => {
    if (mobile.matches && e.target.matches('input:not([type="checkbox"]), textarea')) corps.classList.add('saisie-en-cours');
  };
  // focusout puis focusin (champ suivant) arrivent dans la même tâche : pas de clignotement.
  const sortie = () => corps.classList.remove('saisie-en-cours');

  form.addEventListener('focusin', entree);
  form.addEventListener('focusout', sortie);
  return () => {
    form.removeEventListener('focusin', entree);
    form.removeEventListener('focusout', sortie);
    sortie();
  };
}
