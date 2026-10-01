import { txt, ph, phComment, html } from './helpers.mjs';
import { icone } from './icones.mjs';

/** Pages secondaires : mentions légales, protection des données, remerciement. */
export function pageLegale(p, cle, c) {
  return html`${phComment(p, `pagesLegales.${cle}`)}
<article class="section section--fond page-legale"${ph(p, `pagesLegales.${cle}`)}>
  <div class="conteneur conteneur--etroit">
    <p class="page-legale__retour"><a href="./">${icone('fleche', 'icone icone--retour')}${txt(c.interface.retourAccueil)}</a></p>
    <h1 class="page-legale__titre">${txt(p.titre)}</h1>
    <p class="section__intro">${txt(p.intro)}</p>
    ${p.blocs
      .map(
        (b) => `<section class="page-legale__bloc">
      <h2>${txt(b.titre)}</h2>
      ${b.lignes.map((l) => `<p>${txt(l)}</p>`).join('\n      ')}
    </section>`,
      )
      .join('\n    ')}
    ${cle === 'merci' ? `<p><a class="btn btn--primaire btn--large" href="tel:${c.contact.telephoneLien}">${icone('telephone')}<span>${txt(c.boutons.appelerLong)}</span></a></p>` : ''}
  </div>
</article>`;
}
