/**
 * Icônes au trait, dessinées sur une grille de 24 px, trait 1,75 px, bouts arrondis.
 * Toutes décoratives (aria-hidden) : le texte voisin porte toujours le sens.
 */
const TRACES = {
  telephone:
    '<path d="M6.6 3.5h2.6l1.4 4-1.9 1.3a11.5 11.5 0 0 0 6.5 6.5l1.3-1.9 4 1.4v2.6a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z"/>',
  message:
    '<path d="M4.5 5.5h15a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H10l-4.5 3.5v-3.5h-1a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Z"/><path d="M8 10h8M8 13h5"/>',
  calendrier:
    '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4M8 14h2M14 14h2M8 17h2"/>',
  email: '<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="m4 7 8 6 8-6"/>',
  diplome: '<path d="M2.5 9 12 4.5 21.5 9 12 13.5Z"/><path d="M6.5 11v4.5c0 1.4 2.5 3 5.5 3s5.5-1.6 5.5-3V11M21.5 9v5"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h10"/>',
  fermer: '<path d="M6 6l12 12M18 6 6 18"/>',
  pause: '<path d="M9 6v12M15 6v12"/>',
  lecture: '<path d="M8 5.5v13l10.5-6.5Z"/>',
  fleche: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  coche: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  maison:
    '<path d="M3.5 11 12 4l8.5 7"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-5.5h4V20"/>',
  horloge: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  lieu: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.3"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.8v.2"/>',
  guillemet:
    '<path d="M10 7C6.5 8 5 10.5 5 14v3h5v-5H7.3c.2-1.8 1.2-3 2.7-3.6ZM19 7c-3.5 1-5 3.5-5 7v3h5v-5h-2.7c.2-1.8 1.2-3 2.7-3.6Z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  // Icônes des soins
  genou:
    '<path d="M9 3v6.5a3 3 0 0 0 1 2.2l.8.8a3 3 0 0 1 .9 2.1V21"/><path d="M15 3v6"/><path d="M13.5 12.5c1.3.3 2.5 1.4 2.5 3.2V21"/><circle cx="12.5" cy="11" r="1.2"/>',
  canne:
    '<path d="M15 21V8.5a3 3 0 0 0-6 0"/><path d="M9 8.5v.8"/><circle cx="7" cy="5" r="1.8"/><path d="M5.5 21l1-6.5L5 11l2-3 2.4 3.4"/>',
  souffle:
    '<path d="M12 4v7"/><path d="M12 11c-1-2.2-3-3.5-5-3.5-1.8 0-2.5 3-2.5 6.5S5 20 7 20c2.5 0 5-1.5 5-4.5"/><path d="M12 11c1-2.2 3-3.5 5-3.5 1.8 0 2.5 3 2.5 6.5S19 20 17 20c-2.5 0-5-1.5-5-4.5"/>',
  dos: '<circle cx="12" cy="4.5" r="1.8"/><path d="M12 8c-1.2 2-1.2 4 0 6s1.2 4 0 6"/><path d="M9 10.5h6M9.5 14h5M9 17.5h6"/>',
  equilibre:
    '<circle cx="12" cy="4.5" r="1.8"/><path d="M4.5 10h15"/><path d="M12 8v6.5L9 21M12 14.5 15 21"/>',
  cerveau:
    '<path d="M12 5.5a3 3 0 0 0-5.7-1.3A3 3 0 0 0 4.2 9a3.2 3.2 0 0 0 .3 5.3A3.2 3.2 0 0 0 8 19a2.5 2.5 0 0 0 4 1"/><path d="M12 5.5a3 3 0 0 1 5.7-1.3A3 3 0 0 1 19.8 9a3.2 3.2 0 0 1-.3 5.3A3.2 3.2 0 0 1 16 19a2.5 2.5 0 0 1-4 1"/><path d="M12 5.5V20M8.5 9.5c1 0 1.8.6 2.2 1.5M15.5 9.5c-1 0-1.8.6-2.2 1.5M8 14.5c1 .3 1.8 1 2.2 2M16 14.5c-1 .3-1.8 1-2.2 2"/>',
  main: '<path d="M8 12V6.5a1.5 1.5 0 0 1 3 0V11M11 10V5a1.5 1.5 0 0 1 3 0v5M14 10V6.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-.5A5.5 5.5 0 0 1 5 17.5l-1.5-4a1.4 1.4 0 0 1 2.4-1.4L8 14.5"/>',
};

export function icone(nom, classe = 'icone') {
  const trace = TRACES[nom];
  if (!trace) throw new Error(`Icône inconnue : « ${nom} ». Icônes disponibles : ${Object.keys(TRACES).join(', ')}`);
  return `<svg class="${classe}" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${trace}</svg>`;
}

/**
 * Petites fleurs décoratives (section « À propos »), dans les tons de la carte de visite.
 * Couleurs pilotées en CSS par --petale et --coeur. Toujours aria-hidden.
 *   ronde      : 5 pétales ronds
 *   marguerite : 8 pétales fins
 *   bouton     : 4 pétales, petite fleur
 */
export function fleur(forme = 'ronde', classe = '') {
  const petales = {
    ronde: [5, '<ellipse cx="0" cy="-9.5" rx="6.5" ry="8.5"/>'],
    marguerite: [8, '<ellipse cx="0" cy="-10" rx="3.6" ry="8.5"/>'],
    bouton: [4, '<ellipse cx="0" cy="-8" rx="6" ry="7.5"/>'],
  }[forme];
  const [n, forme1] = petales;
  const tour = Array.from({ length: n }, (_, i) => `<g transform="rotate(${(360 / n) * i})">${forme1}</g>`).join('');
  return `<svg class="fleur fleur--${forme} ${classe}" viewBox="-20 -20 40 40" width="40" height="40" aria-hidden="true" focusable="false"><g class="fleur__petales">${tour}</g><circle class="fleur__coeur" r="${forme === 'marguerite' ? 5 : 4.5}"/></svg>`;
}
