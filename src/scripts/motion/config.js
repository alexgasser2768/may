/**
 * SYSTÈME DE MOUVEMENT — source unique de vérité.
 *
 * Ce fichier est importé tel quel par les scripts du navigateur, ET lu par
 * scripts/build.mjs qui le convertit en variables CSS (--ease-*, --dur-*,
 * --stagger-*, --shift-*, --scale-*) injectées dans :root.
 * Modifier une valeur ici la modifie partout.
 *
 * Principe général : le mouvement évoque le soin et la respiration.
 * Il apaise, il n'agite jamais. Les entrées sont lentes et se posent en
 * douceur, les sorties sont plus courtes (on ne fait pas attendre).
 */

/** Courbes d'accélération nommées. */
export const easing = {
  /** Sinusoïde symétrique : inspiration / expiration. Boucles du hero et de la carte. */
  souffle: 'cubic-bezier(0.37, 0, 0.63, 1)',
  /** Ease-out très doux (quint) : un élément arrive et se pose. Apparitions au scroll. */
  arrivee: 'cubic-bezier(0.22, 1, 0.36, 1)',
  /** Ease-out modéré (cubic) : transitions d'interface (menu, accordéon, survol). */
  geste: 'cubic-bezier(0.33, 1, 0.68, 1)',
  /** Ease-in court : un élément s'efface. Toujours plus bref qu'une entrée. */
  depart: 'cubic-bezier(0.5, 0, 0.75, 0)',
  /**
   * Ressort léger (amortissement ζ = 0,72, dépassement ≈ 3,8 %), calculé par un
   * vrai modèle de ressort amorti et échantillonné en linear().
   * Réservé aux retours tactiles (bouton relâché, case cochée) : c'est le seul
   * « rebond » du site, presque imperceptible.
   */
  ressort:
    'linear(0, 0.0516, 0.1731, 0.3253, 0.4815, 0.6252, 0.7478, 0.8458, 0.9197, 0.972, 1.0063, 1.0264, 1.036, 1.0384, 1.0362, 1.0314, 1.0255, 1.0195, 1.0141, 1.0094, 1.0057, 1.0029, 1.001, 0.9997, 0.999, 1)',
  /** Repli du ressort pour les navigateurs sans linear() (Safari < 17.2). */
  ressortRepli: 'cubic-bezier(0.34, 1.25, 0.64, 1)',
};

/** Échelle de durées, en millisecondes. */
export const duration = {
  /** Retour immédiat : appui sur un bouton, case cochée. */
  instant: 120,
  /** Survol, focus, changement de couleur. */
  rapide: 220,
  /** Interface : ouverture du menu, accordéon, messages du formulaire. */
  interface: 420,
  /** Sortie d'interface (fermeture du menu) : ~70 % de l'entrée. */
  sortie: 300,
  /** Récit : apparition d'un bloc au scroll. */
  recit: 950,
  /** Moment signature : entrée des formes du hero. */
  signature: 1800,
  /**
   * Cycle respiratoire complet (inspiration + expiration) : 11 s,
   * soit ~5,5 respirations par minute — le rythme de la cohérence cardiaque,
   * volontairement plus lent qu'une respiration au repos pour apaiser.
   */
  souffle: 11000,
};

/** Règles d'enchaînement. */
export const stagger = {
  /** Décalage entre deux éléments frères d'une liste (cartes, étapes). */
  liste: 90,
  /** Décalage entre titre → texte → contenu dans un même bloc. */
  bloc: 140,
  /**
   * Nombre maximal d'éléments décalés : au-delà, ils apparaissent ensemble.
   * Évite qu'un 8e élément attende 700 ms (sensation de lenteur).
   */
  max: 5,
};

/** Amplitudes de déplacement (px) et d'échelle. */
export const amplitude = {
  /** Micro-interaction : bouton qui se soulève, flèche qui avance. */
  shiftXs: 2,
  shiftSm: 8,
  /** Apparition standard au scroll. */
  shiftMd: 24,
  /** Apparition narrative (étapes de la séance). */
  shiftLg: 40,
  /** Appui : l'élément s'enfonce légèrement. */
  scalePress: 0.97,
  /** Soulèvement d'une carte au survol (bonus, jamais indispensable). */
  scaleLift: 1.015,
  /** Amplitude de la respiration des formes du hero (± 6 %). */
  scaleSouffle: 1.06,
};

/**
 * Seuils d'observation (IntersectionObserver).
 * Un bloc apparaît quand il est entré de 12 % dans l'écran (marge basse de 8 %).
 */
export const observe = {
  revealMargin: '0px 0px -8% 0px',
  revealThreshold: 0.12,
  /** Les modules lourds se chargent quand leur section est à moins d'un écran. */
  lazyMargin: '100% 0px',
  /** Ligne de lecture du parcours « séance » : 60 % de la hauteur d'écran. */
  ligneLecture: 0.6,
};

/** Vrai si la personne demande moins de mouvement (réglage système). */
export const reducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
