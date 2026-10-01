import { esc, txt, ph, phComment, idx, html, image, estMarqueur } from './helpers.mjs';
import { icone, fleur } from './icones.mjs';

/**
 * Page d'accueil. Ordre des sections (voir README, « Structure ») :
 * hero → soins → séance → zone → à propos → (tarifs, masqué) → témoignages → FAQ → contact.
 * La zone d'intervention est remontée : « vient-elle jusque chez moi ? » est la
 * deuxième question que se pose un patient, juste après « peut-elle m'aider ? ».
 */
export function accueil(c, ctx) {
  const S = ctx.stagger.max;
  const visible = (bloc) => bloc && bloc.afficher !== false;
  return [
    hero(c, ctx),
    visible(c.soins) && soins(c.soins, S),
    visible(c.seance) && seance(c.seance, S, c.interface),
    visible(c.zone) && zone(c.zone, S),
    visible(c.aPropos) && aPropos(c.aPropos, S, ctx),
    visible(c.tarifs) && tarifs(c.tarifs, S),
    visible(c.temoignages) && temoignages(c.temoignages, S),
    visible(c.faq) && faq(c.faq, S),
    contact(c, S),
  ]
    .filter(Boolean)
    .join('\n');
}

/** En-tête de section commun : surtitre, titre, introduction (enchaînement « bloc »). */
function entete(b, id, { intro = b.intro, classe = '' } = {}) {
  return html`<header class="section__entete ${classe}">
      <p class="surtitre" data-reveal${idx(0, 5)}><span>${txt(b.surtitre)}</span></p>
      <h2 id="${id}-titre" data-reveal${idx(1, 5)}>${txt(b.titre)}</h2>
      ${intro ? `<p class="section__intro" data-reveal${idx(2, 5)}>${txt(intro)}</p>` : ''}
    </header>`;
}

/**
 * Petit bouquet décoratif (3 fleurs), posé dans les marges des sections.
 * data-reveal : il éclot quand il arrive à l'écran. Toujours aria-hidden.
 */
function bouquet(classe, couleurs = ['c1', 'c3', 'c2']) {
  return `<span class="bouquet ${classe}" aria-hidden="true" data-reveal>${fleur('marguerite', `fleur--${couleurs[0]} bouquet__f1`)}${fleur('ronde', `fleur--${couleurs[1]} bouquet__f2`)}${fleur('bouton', `fleur--${couleurs[2]} bouquet__f3`)}</span>`;
}

/**
 * Titre avec une partie soulignée d'un trait « dessiné à la main » (SVG décoratif).
 * Le texte reste un seul titre, lu normalement par les lecteurs d'écran.
 */
function titreSouligne(titre, partie) {
  const i = partie ? titre.indexOf(partie) : -1;
  if (i < 0) return txt(titre);
  const trait = `<svg class="souligne__trait" viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path pathLength="1" d="M0 12H300"/></svg>`;
  return `${txt(titre.slice(0, i))}<span class="souligne">${txt(partie)}${trait}</span>${txt(titre.slice(i + partie.length))}`;
}

/* ------------------------------------------------------------------------ */
/* 1. Hero — moment signature « Le souffle »                                */
/* ------------------------------------------------------------------------ */
function hero(c, ctx) {
  const a = c.accueil;
  const b = c.boutons;
  // Aucun élément de texte ni bouton n'est animé à l'arrivée : ils s'affichent
  // immédiatement (LCP). Seules les formes décoratives respirent.
  return html`${phComment(a, 'accueil')}
<section class="hero" aria-labelledby="hero-titre"${ph(a, 'accueil')}>
  <div class="hero__souffle" aria-hidden="true">
    <span class="forme forme--1"><span></span></span>
    <span class="forme forme--2"><span></span></span>
    <span class="forme forme--3"><span></span></span>
  </div>
  <div class="hero__grille conteneur">
    <div class="hero__texte">
      <p class="surtitre hero__surtitre"><span>${txt(a.surtitre)}</span></p>
      <h1 id="hero-titre" class="hero__titre">${titreSouligne(a.titre, a.titreSouligne)}</h1>
      <p class="hero__intro">${txt(a.texte)}</p>
      <div class="hero__actions">
        <a class="btn btn--primaire btn--large" href="tel:${esc(c.contact.telephoneLien)}">
          ${icone('telephone')}<span>${txt(b.appeler)} <span class="btn__detail">${txt(c.contact.telephoneAffiche)}</span></span>
        </a>
        <a class="btn btn--secondaire btn--large" href="#contact">
          ${icone('calendrier')}<span>${txt(b.rendezVous)}</span>
        </a>
      </div>
      <ul class="hero__reassurance" role="list">
        ${a.reassurances.map((r, i) => `<li class="pastille pastille--${(i % 3) + 1}">${icone('coche')}<span>${txt(r)}</span></li>`).join('')}
      </ul>
    </div>
    <figure class="hero__portrait">
      <span class="hero__tache" aria-hidden="true"><span></span><span></span></span>
      <span class="hero__halo" aria-hidden="true"></span>
      ${image(a.image, { racine: ctx.racine, sizes: '(min-width: 64em) 36vw, 8rem', classe: 'hero__photo', prioritaire: true, dessin: 'portrait' })}
      ${fleur('marguerite', 'fleur--c1 hero__fleur hero__fleur--a')}
      ${fleur('ronde', 'fleur--c3 hero__fleur hero__fleur--b')}
      ${fleur('bouton', 'fleur--c2 hero__fleur hero__fleur--c')}
      ${fleur('ronde', 'fleur--c4 hero__fleur hero__fleur--d')}
      ${fleur('bouton', 'fleur--c3 hero__fleur hero__fleur--e')}
      ${fleur('marguerite', 'fleur--c2 hero__fleur hero__fleur--f')}
    </figure>
  </div>
  <div class="souffle-pause conteneur">
    <input type="checkbox" id="souffle-pause" class="souffle-pause__case">
    <label for="souffle-pause" class="souffle-pause__bouton">
      <span class="souffle-pause__icone souffle-pause__icone--pause">${icone('pause')}</span>
      <span class="souffle-pause__icone souffle-pause__icone--lecture">${icone('lecture')}</span>
      <span class="visuellement-cache">${txt(b.pauseAnimation)}</span>
    </label>
  </div>
</section>`;
}

/* ------------------------------------------------------------------------ */
/* 2. Soins                                                                  */
/* ------------------------------------------------------------------------ */
function soins(s, S) {
  return html`${phComment(s, 'soins')}
<section id="soins" class="section section--fond" aria-labelledby="soins-titre"${ph(s, 'soins')}>
  <div class="conteneur">
    ${bouquet('bouquet--coin')}
    ${entete(s, 'soins')}
    <ul class="cartes-soins" role="list">
      ${s.liste
        .map(
          (x, i) => `<li class="carte carte-soin" data-reveal${idx(i, S)}>
        <span class="carte-soin__icone">${icone(x.icone)}</span>
        <div class="carte-soin__texte">
          <h3>${txt(x.titre)}</h3>
          ${x.texte ? `<p>${txt(x.texte)}</p>` : ''}
        </div>
      </li>`,
        )
        .join('\n      ')}
    </ul>
  </div>
</section>`;
}

/* ------------------------------------------------------------------------ */
/* 3. Séance à domicile — moment signature « Le trajet »                    */
/* ------------------------------------------------------------------------ */
function seance(s, S, ui) {
  const n = s.etapes.length;
  return html`${phComment(s, 'seance')}
<section id="seance" class="section section--bleu-fond parcours" aria-labelledby="seance-titre"${ph(s, 'seance')}>
  <div class="conteneur parcours__grille">
    <div class="parcours__cote">
      ${entete(s, 'seance')}
      <p class="parcours__compteur" aria-hidden="true" data-reveal${idx(3, 5)}>
        <span class="parcours__compteur-num" data-parcours-compteur>1</span><span class="parcours__compteur-sur"> / ${n}</span>
      </p>
    </div>
    <div class="parcours__trajet" data-parcours>
      <div class="parcours__fil" aria-hidden="true"><span class="parcours__fil-trace" data-parcours-trace></span></div>
      <ol class="parcours__etapes" role="list">
        ${s.etapes
          .map(
            (e, i) => `<li class="etape" data-etape data-reveal${idx(0, S)}>
          <span class="etape__marqueur" aria-hidden="true"><span>${i + 1}</span></span>
          <div class="etape__corps">
            <p class="etape__numero">${txt(ui.etape.replace('{n}', i + 1).replace('{total}', n))}</p>
            <h3>${txt(e.titre)}</h3>
            <p>${txt(e.texte)}</p>
          </div>
        </li>`,
          )
          .join('\n        ')}
      </ol>
      <div class="parcours__arrivee" data-parcours-arrivee>
        <span class="parcours__maison" aria-hidden="true">
          ${icone('maison', 'icone parcours__maison-icone')}
          <span class="parcours__fenetre"></span>
        </span>
        <p>${txt(s.arrivee)} ${bouquet('bouquet--jardin', ['c1', 'c4', 'c3'])}</p>
      </div>
    </div>
  </div>
</section>`;
}

/* ------------------------------------------------------------------------ */
/* 4. Zone d'intervention — carte stylisée + liste (la liste fait foi)      */
/* ------------------------------------------------------------------------ */
function zone(z, S) {
  const n = z.communes.length;
  const nom = (x) => (typeof x === 'string' ? x : x.nom);
  // Projection simple (équirectangulaire) des coordonnées autour de la commune de base.
  // Suffisant à l'échelle d'une ville ; la carte reste « simplifiée ».
  const base = z.base;
  const avecCoords = z.communes.filter((x) => x.lat != null && x.lon != null);
  const cosLat = Math.cos(((base?.lat ?? 0) * Math.PI) / 180);
  const ecart = (x) => Math.max(Math.abs((x.lon - base.lon) * cosLat), Math.abs(x.lat - base.lat));
  const echelle = base && avecCoords.length ? 150 / Math.max(...avecCoords.map(ecart)) : 0;
  const rayons = [96, 132, 84, 140, 112, 92, 136, 118, 104, 126];
  const pts = z.communes.map((x, i) => {
    if (echelle && x.lat != null && x.lon != null) {
      return { x: +(200 + (x.lon - base.lon) * cosLat * echelle).toFixed(1), y: +(200 - (x.lat - base.lat) * echelle).toFixed(1) };
    }
    // Sans coordonnées : placement régulier autour du centre.
    const angle = ((i / n) * 360 - 90) * (Math.PI / 180);
    const r = rayons[i % rayons.length];
    return { x: +(200 + Math.cos(angle) * r).toFixed(1), y: +(200 + Math.sin(angle) * r * 0.86).toFixed(1) };
  });
  return html`${phComment(z, 'zone')}
<section id="zone" class="section section--menthe-fond" aria-labelledby="zone-titre"${ph(z, 'zone')}>
  <div class="conteneur zone__grille">
    ${entete(z, 'zone', { classe: 'zone__entete' })}
    <figure class="zone__carte" data-zone data-reveal${idx(1, 5)}>
      <div class="zone__plan">
      ${bouquet('bouquet--carte', ['c3', 'c1', 'c2'])}
      <svg viewBox="0 0 400 400" width="400" height="400" aria-hidden="true" focusable="false">
        <circle class="zone__territoire" cx="200" cy="200" r="186"/>
        ${pts
          .map(
            (p, i) => `<g class="zone__point" data-point="${i}" transform="translate(${p.x} ${p.y})">
          <circle r="12"/><text y="4.5" text-anchor="middle">${i + 1}</text>
        </g>`,
          )
          .join('\n        ')}
        <g class="zone__base" transform="translate(200 200)">
          <circle r="15"/>
          <path d="M-7 1 0 -5.5l7 6.5M-5.3 -0.5v7h10.6v-7" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
      </svg>
      <span class="zone__onde" aria-hidden="true"></span><span class="zone__onde" aria-hidden="true"></span><span class="zone__onde" aria-hidden="true"></span>
      </div>
      <figcaption>${txt(z.legendeCarte)}</figcaption>
    </figure>
    <div class="zone__liste">
      <ol class="communes" role="list">
        ${base ? `<li class="communes__base" data-reveal${idx(0, S)}><span class="communes__num" aria-hidden="true">${icone('maison')}</span><strong>${txt(base.nom)}</strong></li>` : ''}
        ${z.communes.map((x, i) => `<li data-commune="${i}" data-reveal${idx(i + 1, S)}><span class="communes__num" aria-hidden="true">${i + 1}</span>${txt(nom(x))}</li>`).join('\n        ')}
      </ol>
    </div>
  </div>
</section>`;
}

/* ------------------------------------------------------------------------ */
/* 5. À propos                                                               */
/* ------------------------------------------------------------------------ */
function aPropos(a, S, ctx) {
  // Formes et couleurs des fleurs, en alternance (voir .fleur--c1…c4 dans 05-sections.css).
  const formes = ['ronde', 'marguerite', 'bouton', 'ronde'];
  return html`${phComment(a, 'aPropos')}
<section id="a-propos" class="section section--fond apropos" aria-labelledby="a-propos-titre"${ph(a, 'aPropos')}>
  <div class="conteneur apropos__grille">
    <div class="apropos__media" data-reveal${idx(0, 5)}>
      ${image(a.image, { racine: ctx.racine, sizes: '(min-width: 64em) 45vw, 100vw', classe: 'apropos__photo', dessin: 'seance' })}
      ${fleur('marguerite', 'fleur--c1 apropos__fleur apropos__fleur--a')}
      ${fleur('ronde', 'fleur--c3 apropos__fleur apropos__fleur--b')}
      ${fleur('bouton', 'fleur--c2 apropos__fleur apropos__fleur--c')}
    </div>
    <div class="apropos__texte">
      ${entete(a, 'a-propos', { intro: null })}
      ${a.paragraphes.map((p, i) => `<p class="apropos__intro" data-reveal${idx(i + 2, 5)}>${txt(p)}</p>`).join('\n      ')}
    </div>
    <div class="apropos__qualites">
      <h3 data-reveal>${txt(a.qualitesTitre)}</h3>
      <ul class="qualites" role="list">
        ${a.qualites
          .map(
            (q, i) => `<li class="qualite qualite--${(i % 4) + 1}" data-reveal${idx(i, S)}>
          ${fleur(formes[i % 4], `fleur--c${(i % 4) + 1} qualite__fleur`)}
          <div><h4>${txt(q.titre)}</h4>${q.texte ? `<p>${txt(q.texte)}</p>` : ''}</div>
        </li>`,
          )
          .join('\n        ')}
      </ul>
    </div>
    <div class="apropos__formation" data-reveal>
      <div class="formation__diplomes">
        <h3>${txt(a.formationTitre)}</h3>
        <ul class="diplomes" role="list">
          ${a.diplomes.map((d) => `<li>${icone('diplome')}<span>${txt(d)}</span></li>`).join('\n          ')}
        </ul>
        <p class="formation__universite">${icone('lieu')}<span>${txt(a.universite)}</span></p>
      </div>
      <div class="formation__stages">
        <h3>${txt(a.stagesTitre)}</h3>
        ${a.stagesLieux ? `<p class="formation__lieux">${txt(a.stagesLieux)}</p>` : ''}
        <ul class="domaines" role="list">
          ${a.stages.map((s, i) => `<li>${fleur(['bouton', 'ronde', 'marguerite', 'bouton'][i % 4], `fleur--c${(i % 4) + 1}`)}${txt(s)}</li>`).join('\n          ')}
        </ul>
      </div>
    </div>
  </div>
</section>`;
}

/* ------------------------------------------------------------------------ */
/* 6. Tarifs et remboursement                                                */
/* ------------------------------------------------------------------------ */
function tarifs(t, S) {
  return html`${phComment(t, 'tarifs')}
<section id="tarifs" class="section section--bleu-fond" aria-labelledby="tarifs-titre"${ph(t, 'tarifs')}>
  <div class="conteneur">
    ${entete(t, 'tarifs')}
    <ul class="tarifs" role="list">
      ${t.cartes
        .map(
          (x, i) => `<li class="carte tarif" data-reveal${idx(i, S)}>
        <h3>${txt(x.titre)}</h3>
        <p class="tarif__montant">${txt(x.montant)}</p>
        <p>${txt(x.detail)}</p>
      </li>`,
        )
        .join('\n      ')}
    </ul>
    <dl class="points">
      ${t.points.map((p, i) => `<div class="point" data-reveal${idx(i, S)}><dt>${icone('info')}${txt(p.titre)}</dt><dd>${txt(p.texte)}</dd></div>`).join('\n      ')}
    </dl>
  </div>
</section>`;
}

/* ------------------------------------------------------------------------ */
/* 7. Témoignages                                                            */
/* ------------------------------------------------------------------------ */
function temoignages(t, S) {
  return html`${phComment(t, 'temoignages')}
<section id="temoignages" class="section section--bleu-fond" aria-labelledby="temoignages-titre"${ph(t, 'temoignages')}>
  <div class="conteneur">
    ${entete(t, 'temoignages')}
    <ul class="temoignages" role="list">
      ${t.liste
        .map(
          (x, i) => `<li class="carte temoignage" data-reveal${idx(i, S)}>
        <figure>
          ${icone('guillemet', 'icone temoignage__guillemet')}
          <blockquote><p>${txt(x.texte)}</p></blockquote>
          <figcaption><strong>${txt(x.auteur)}</strong><span>${txt(x.contexte)}</span></figcaption>
        </figure>
      </li>`,
        )
        .join('\n      ')}
    </ul>
  </div>
</section>`;
}

/* ------------------------------------------------------------------------ */
/* 8. Questions fréquentes — <details> natif : fonctionne sans JavaScript    */
/* ------------------------------------------------------------------------ */
function faq(f, S) {
  return html`${phComment(f, 'faq')}
<section id="faq" class="section section--menthe-fond" aria-labelledby="faq-titre"${ph(f, 'faq')}>
  <div class="conteneur conteneur--etroit">
    ${bouquet('bouquet--coin', ['c3', 'c1', 'c4'])}
    ${entete(f, 'faq', { intro: null })}
    <div class="faq">
      ${f.questions
        .map(
          (q, i) => `<details class="faq__item" data-reveal${idx(i, S)}>
        <summary><span>${txt(q.question)}</span><span class="faq__signe" aria-hidden="true">${icone('plus')}</span></summary>
        <div class="faq__reponse"><p>${txt(q.reponse)}</p></div>
      </details>`,
        )
        .join('\n      ')}
    </div>
  </div>
</section>`;
}

/* ------------------------------------------------------------------------ */
/* 9. Contact et rendez-vous                                                 */
/* ------------------------------------------------------------------------ */
function contact(c, S) {
  const r = c.rendezVous;
  const f = r.formulaire;
  const ch = f.champs;
  const avecFormulaire = f.afficher !== false;
  const demo = estMarqueur(f.action);
  // Mode démonstration : sans service configuré, le formulaire (sans JS) poste
  // vers merci.html — le serveur de développement répond, rien n'est stocké.
  const action = demo ? 'merci.html' : f.action;
  const aide = (id, t) => (t ? `<p class="champ__aide" id="${id}-aide">${txt(t)}</p>` : '');
  const decrit = (id, t) => ` aria-describedby="${t ? `${id}-aide ` : ''}${id}-erreur"`;
  const erreur = (id) => `<p class="champ__erreur" id="${id}-erreur" hidden></p>`;

  return html`${phComment(r, 'rendezVous')}
<section id="contact" class="section section--petrole" aria-labelledby="contact-titre"${ph(r, 'rendezVous')}>
  <div class="conteneur contact__grille${avecFormulaire ? '' : ' contact__grille--seul'}">
    ${bouquet('bouquet--coin bouquet--sombre', ['c4', 'c2', 'c4'])}
    <div class="contact__direct">
      ${entete(r, 'contact')}
      <div class="carte carte--claire contact__carte" data-reveal${idx(0, S)}>
        <h3>${txt(r.telephoneTitre)}</h3>
        <a class="contact__numero" href="tel:${esc(c.contact.telephoneLien)}">${icone('telephone')}<span>${txt(c.contact.telephoneAffiche)}</span></a>
        <a class="btn btn--secondaire btn--large contact__sms" href="sms:${esc(c.contact.telephoneLien)}">${icone('message')}<span>${txt(c.boutons.sms)}</span></a>
        <a class="lien-fort contact__email" href="mailto:${esc(c.contact.email)}">${icone('email')}<span>${txt(c.contact.email)}</span></a>
        <p class="contact__note">${txt(c.contact.joignabilite)}</p>
        <h3 class="contact__sous-titre">${icone('horloge')}${txt(r.horairesTitre)}</h3>
        <dl class="horaires">
          ${c.contact.horaires.map((h) => `<div><dt>${txt(h.jours)}</dt><dd>${txt(h.heures)}</dd></div>`).join('\n          ')}
        </dl>
        <p class="contact__urgence">${icone('info')}<span>${txt(c.contact.urgence)}</span></p>
      </div>
    </div>

    ${avecFormulaire ? html`<div class="carte carte--claire contact__form" data-reveal${idx(1, S)}>
      <form class="formulaire" action="${esc(action)}" method="post" data-formulaire${demo ? ' data-demo' : ''}
        data-erreurs='${esc(JSON.stringify(f.erreurs))}' data-textes='${esc(JSON.stringify({ envoi: f.envoiEnCours, envoyer: f.envoyer, demo: f.demoTexte }))}'>
        <h3 class="formulaire__titre">${txt(f.titre)}</h3>
        <p class="formulaire__intro">${txt(f.intro)}</p>
        <div class="formulaire__resume" role="alert" tabindex="-1" hidden data-resume>
          <p>${txt(f.erreurs.resume)}</p>
          <ul role="list"></ul>
        </div>

        <div class="champ">
          <label for="f-nom">${txt(ch.nom.libelle)}</label>
          ${aide('f-nom', ch.nom.aide)}
          <input id="f-nom" name="nom" type="text" autocomplete="name" autocapitalize="words" required${decrit('f-nom', ch.nom.aide)}>
          ${erreur('f-nom')}
        </div>
        <div class="champ">
          <label for="f-tel">${txt(ch.telephone.libelle)}</label>
          ${aide('f-tel', ch.telephone.aide)}
          <input id="f-tel" name="telephone" type="tel" inputmode="tel" autocomplete="tel" required pattern="[0-9+()\\/.\\s\\-]{9,}"${decrit('f-tel', ch.telephone.aide)}>
          ${erreur('f-tel')}
        </div>
        <div class="champ">
          <label for="f-email">${txt(ch.email.libelle)}</label>
          ${aide('f-email', ch.email.aide)}
          <input id="f-email" name="email" type="email" inputmode="email" autocomplete="email" spellcheck="false"${decrit('f-email', ch.email.aide)}>
          ${erreur('f-email')}
        </div>
        <div class="champ">
          <label for="f-commune">${txt(ch.commune.libelle)}</label>
          ${aide('f-commune', ch.commune.aide)}
          <input id="f-commune" name="commune" type="text" autocomplete="address-level2" required${decrit('f-commune', ch.commune.aide)}>
          ${erreur('f-commune')}
        </div>
        <div class="champ">
          <label for="f-message">${txt(ch.message.libelle)}</label>
          ${aide('f-message', ch.message.aide)}
          <textarea id="f-message" name="message" rows="4" required${decrit('f-message', ch.message.aide)}></textarea>
          ${erreur('f-message')}
        </div>
        <div class="champ champ--case">
          <input id="f-consentement" name="consentement" type="checkbox" value="oui" required aria-describedby="f-consentement-erreur">
          <label for="f-consentement">${txt(ch.consentement.libelle)} <a href="confidentialite.html">${txt(ch.consentement.lien)}</a></label>
          ${erreur('f-consentement')}
        </div>
        <!-- Piège à robots : champ invisible pour les personnes, rempli par les robots. -->
        <div class="formulaire__piege" aria-hidden="true">
          <label for="f-site">Ne pas remplir</label>
          <input id="f-site" name="site_web" type="text" tabindex="-1" autocomplete="off">
        </div>
        <button class="btn btn--primaire btn--large formulaire__envoyer" type="submit">
          <span class="formulaire__envoyer-texte">${txt(f.envoyer)}</span>${icone('fleche')}
        </button>
        <p class="formulaire__etat" role="status" aria-live="polite" data-etat></p>
      </form>
      <div class="formulaire__succes" tabindex="-1" hidden data-succes>
        <span class="formulaire__succes-icone" aria-hidden="true">${icone('coche')}</span>
        <h3>${txt(f.succesTitre)}</h3>
        <p>${txt(f.succesTexte)}</p>
        <p class="formulaire__demo" hidden data-demo-texte>${txt(f.demoTexte)}</p>
      </div>
    </div>` : ''}
  </div>
</section>`;
}
