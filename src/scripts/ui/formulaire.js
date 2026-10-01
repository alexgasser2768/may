/**
 * Formulaire de contact — chargé à la demande.
 *
 * Sans JavaScript, la validation native du navigateur et l'envoi classique
 * fonctionnent. Ce module ajoute :
 *  - des messages d'erreur en français clair, sous chaque champ, liés par
 *    aria-describedby, et un résumé en tête de formulaire avec des liens ;
 *  - une validation « bienveillante » : jamais d'erreur pendant qu'on tape
 *    pour la première fois ; vérification à la sortie du champ, puis en direct
 *    uniquement pour faire disparaître une erreur corrigée ;
 *  - l'envoi sans rechargement, avec état d'attente et message de réussite ;
 *  - un mode démonstration tant que l'adresse du service n'est pas configurée.
 */
const courriel = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const chiffres = (v) => (v.match(/\d/g) || []).length;

export function initFormulaire(form) {
  const erreurs = JSON.parse(form.dataset.erreurs);
  const textes = JSON.parse(form.dataset.textes);
  const demo = form.hasAttribute('data-demo');
  const resume = form.querySelector('[data-resume]');
  const etat = form.querySelector('[data-etat]');
  const bouton = form.querySelector('button[type="submit"]');
  const libelleBouton = bouton.querySelector('.formulaire__envoyer-texte');
  const succes = form.parentElement.querySelector('[data-succes]');
  const champ = (nom) => form.elements.namedItem(nom);

  /** Règles : renvoie le message d'erreur, ou '' si le champ est correct. */
  const regles = {
    nom: (el) => (el.value.trim().length < 2 ? erreurs.nom : ''),
    telephone: (el) => {
      const v = el.value.trim();
      if (!v) return erreurs.telephoneVide;
      return chiffres(v) < 9 ? erreurs.telephone : '';
    },
    email: (el) => (el.value.trim() && !courriel.test(el.value.trim()) ? erreurs.email : ''),
    commune: (el) => (el.value.trim().length < 2 ? erreurs.commune : ''),
    message: (el) => (el.value.trim().length < 3 ? erreurs.message : ''),
    consentement: (el) => (el.checked ? '' : erreurs.consentement),
  };

  form.noValidate = true; // on prend le relais de la validation native
  const touches = new Set();

  function afficher(nom, message) {
    const el = champ(nom);
    const zone = form.querySelector(`#${el.id}-erreur`);
    el.setAttribute('aria-invalid', message ? 'true' : 'false');
    zone.textContent = message;
    zone.hidden = !message;
  }
  const verifier = (nom) => {
    const message = regles[nom](champ(nom));
    afficher(nom, message);
    return message;
  };

  const surSortie = (e) => {
    const nom = e.target.name;
    if (!regles[nom]) return;
    if (e.target.value || touches.has(nom)) {
      touches.add(nom);
      verifier(nom);
    }
  };
  const surSaisie = (e) => {
    const nom = e.target.name;
    // En direct seulement pour effacer une erreur déjà affichée.
    if (regles[nom] && e.target.getAttribute('aria-invalid') === 'true') verifier(nom);
  };

  function montrerResume(fautes) {
    const ul = resume.querySelector('ul');
    ul.replaceChildren(
      ...fautes.map(({ nom, message }) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${champ(nom).id}`;
        a.textContent = message;
        a.addEventListener('click', (ev) => {
          ev.preventDefault();
          champ(nom).focus();
        });
        li.append(a);
        return li;
      }),
    );
    resume.hidden = false;
    resume.focus();
  }

  function attente(active) {
    bouton.setAttribute('aria-disabled', String(active));
    libelleBouton.textContent = active ? textes.envoi : textes.envoyer;
    etat.textContent = active ? textes.envoi : '';
  }

  function reussite() {
    form.hidden = true;
    succes.hidden = false;
    succes.querySelector('[data-demo-texte]').hidden = !demo;
    succes.focus();
  }

  let envoiEnCours = false;
  async function surEnvoi(e) {
    e.preventDefault();
    if (envoiEnCours) return;

    const fautes = Object.keys(regles)
      .map((nom) => ({ nom, message: verifier(nom) }))
      .filter((f) => f.message);
    Object.keys(regles).forEach((n) => touches.add(n));
    if (fautes.length) {
      montrerResume(fautes);
      return;
    }
    resume.hidden = true;

    // Piège à robots rempli : on fait comme si tout allait bien.
    if (champ('site_web').value) return reussite();

    envoiEnCours = true;
    attente(true);
    let ok = false;
    try {
      if (demo) {
        await new Promise((r) => setTimeout(r, 900));
      } else {
        const rep = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
        if (!rep.ok) throw new Error(String(rep.status));
      }
      ok = true;
    } catch {
      /* réseau ou service indisponible : message ci-dessous */
    }
    envoiEnCours = false;
    attente(false);
    if (ok) reussite();
    else etat.textContent = erreurs.envoi; // les données saisies sont conservées
  }

  form.addEventListener('focusout', surSortie);
  form.addEventListener('input', surSaisie);
  form.addEventListener('change', surSaisie);
  form.addEventListener('submit', surEnvoi);

  return () => {
    form.removeEventListener('focusout', surSortie);
    form.removeEventListener('input', surSaisie);
    form.removeEventListener('change', surSaisie);
    form.removeEventListener('submit', surEnvoi);
    form.noValidate = false;
  };
}
