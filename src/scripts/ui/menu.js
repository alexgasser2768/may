/**
 * Menu mobile (<dialog> modal).
 *
 * Sans JavaScript, les boutons « Menu » sont des liens vers la navigation du
 * pied de page. Avec JavaScript :
 *  - ouverture : showModal() (focus piégé, arrière-plan inerte), puis la
 *    feuille monte du bas (transition CSS, 06-mouvement.css section 6) ;
 *  - fermeture : bouton, touche Échap, toucher le fond assombri, OU bouton
 *    « retour » du téléphone — une entrée d'historique est ajoutée à
 *    l'ouverture et consommée à la fermeture ;
 *  - le focus revient au bouton qui a ouvert le menu ;
 *  - un lien du menu ferme d'abord le menu, puis amène à la section et y place
 *    le focus (utile aux lecteurs d'écran).
 */
import { duration, reducedMotion } from '../motion/config.js';

export function initMenu() {
  const dialog = document.getElementById('menu');
  if (!dialog || typeof dialog.showModal !== 'function') return () => {};

  const feuille = dialog.querySelector('.menu__feuille');
  const racine = document.documentElement;
  const ouvreurs = document.querySelectorAll('[data-menu-ouvrir]');
  let declencheur = null;
  let enFermeture = false;
  let apresFermeture = null;

  function ouvrir(e) {
    e.preventDefault();
    if (dialog.open) return;
    declencheur = e.currentTarget;
    dialog.showModal();
    racine.classList.add('menu-ouvert');
    // Force le calcul de l'état initial (feuille en bas) pour que la transition parte de là.
    feuille.getBoundingClientRect();
    dialog.classList.add('est-ouvert');
    history.pushState({ mayMenu: true }, '');
  }

  /** Demande de fermeture : passe par l'historique si le menu y a laissé une entrée. */
  function demanderFermeture(puis = null) {
    if (!dialog.open || enFermeture) return;
    apresFermeture = puis;
    if (history.state?.mayMenu) history.back(); // → popstate → fermer()
    else fermer();
  }

  function fermer() {
    if (!dialog.open || enFermeture) return;
    enFermeture = true;
    dialog.classList.remove('est-ouvert');
    let minuterie = 0;
    const fin = () => {
      clearTimeout(minuterie);
      feuille.removeEventListener('transitionend', surFin);
      dialog.close();
      racine.classList.remove('menu-ouvert');
      enFermeture = false;
      const suite = apresFermeture;
      apresFermeture = null;
      if (suite) suite();
      else declencheur?.focus();
    };
    const surFin = (ev) => {
      if (ev.target === feuille) fin();
    };
    feuille.addEventListener('transitionend', surFin);
    // Filet : si aucune transition n'a lieu (mouvement réduit, onglet en arrière-plan).
    minuterie = setTimeout(fin, duration.sortie + 100);
  }

  function allerA(href) {
    const url = new URL(href, location.href);
    const cible = url.pathname === location.pathname && url.hash ? document.getElementById(url.hash.slice(1)) : null;
    if (!cible) {
      location.href = href;
      return;
    }
    history.pushState(null, '', url.hash);
    cible.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
    if (!cible.hasAttribute('tabindex')) cible.setAttribute('tabindex', '-1');
    cible.focus({ preventScroll: true });
  }

  const surClicLien = (e) => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    e.preventDefault();
    const href = a.getAttribute('href');
    demanderFermeture(() => allerA(href));
  };
  const surAnnulation = (e) => {
    e.preventDefault(); // Échap : on anime la sortie au lieu de fermer sèchement
    demanderFermeture();
  };
  const surClicFond = (e) => {
    if (e.target === dialog) demanderFermeture();
  };
  const surRetour = () => {
    if (dialog.open) fermer();
  };
  const boutonFermer = dialog.querySelector('[data-menu-fermer]');
  const surFermer = () => demanderFermeture();

  ouvreurs.forEach((b) => b.addEventListener('click', ouvrir));
  boutonFermer.addEventListener('click', surFermer);
  dialog.addEventListener('cancel', surAnnulation);
  dialog.addEventListener('click', surClicFond);
  dialog.querySelector('nav').addEventListener('click', surClicLien);
  window.addEventListener('popstate', surRetour);

  return () => {
    ouvreurs.forEach((b) => b.removeEventListener('click', ouvrir));
    boutonFermer.removeEventListener('click', surFermer);
    dialog.removeEventListener('cancel', surAnnulation);
    dialog.removeEventListener('click', surClicFond);
    dialog.querySelector('nav').removeEventListener('click', surClicLien);
    window.removeEventListener('popstate', surRetour);
  };
}
