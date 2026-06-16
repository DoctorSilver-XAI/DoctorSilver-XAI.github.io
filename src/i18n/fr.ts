/**
 * Dictionnaire FRANÇAIS : source de vérité du typage i18n.
 * Le type `Dict` est dérivé de cet objet ; le dictionnaire anglais (en.ts) doit
 * le satisfaire intégralement, sinon `astro check` échoue. C'est la garantie
 * « aucun texte en dur » et « aucune clé manquante en anglais ».
 *
 * Convention : les chaînes dynamiques utilisent des marqueurs {n}, {name}…
 * interpolés via `interpolate()` (cf. i18n/index.ts).
 */
export const fr = {
  a11y: {
    skip: 'Aller au contenu',
    canvasLabel: 'Visualisation décorative d’une carte d’attention d’IA explicable',
    toTop: 'Revenir en haut',
  },

  nav: {
    brand: 'Soutenance · ISPB',
    availability: 'Disponibilités',
    rsvp: 'Je viendrai',
    language: 'Langue',
    fr: 'FR',
    en: 'EN',
  },

  hero: {
    kicker: 'Soutenance de thèse · Juillet 2026 · ISPB Lyon',
    title: 'Ouvrir la boîte noire.',
    subtitle:
      'IA explicable et de confiance dans le diagnostic, le suivi personnalisé et l’optimisation thérapeutique du TDAH et du trouble bipolaire : un cadre translationnel pour l’exercice pharmaceutique.',
    intrigue:
      'En juillet 2026, à l’ISPB : ce qu’une revue PRISMA de 46 études récentes dit de l’IA en neuropsychiatrie, et la place du pharmacien dans cette transition.',
    cta: 'Indiquer mes disponibilités',
    ctaHint: 'Quelques secondes, par e-mail ou en un clic',
    scrollCue: 'Découvrir',
  },

  story: {
    eyebrow: 'Le sujet',
    heading: 'De la donnée à la décision, sans renoncer à la confiance.',
    lead: 'Trois paliers pour saisir ce qui se joue. Chaque étape se lit à deux niveaux : l’essentiel, puis le détail méthodologique.',
    deepDive: 'Pour aller plus loin',
    close: 'Le reste se dévoile le jour de la soutenance.',
  },

  why: {
    eyebrow: 'Pourquoi venir',
    heading: 'Ce qui se joue ce jour-là.',
    lead: 'Une heure pour comprendre comment l’intelligence artificielle peut devenir lisible, fiable et utile au soin. Exigeant pour les spécialistes, accessible à tous.',
    c1: {
      title: 'Sortir l’IA de la boîte noire',
      body: 'Comprendre <em>pourquoi</em> un modèle propose un diagnostic ou ajuste un traitement, pas seulement ce qu’il prédit. L’explicabilité (XAI) comme condition de la confiance clinique.',
      tag: 'Explicabilité · XAI',
    },
    c2: {
      title: 'Le pharmacien, évaluateur critique de l’IA',
      body: 'Repérer, interpréter, sécuriser : de l’officine à la biologie médicale, une littératie critique des outils prédictifs compte plus qu’une expertise de data scientist.',
      tag: 'Littératie des données · pharmacie clinique',
    },
    c3: {
      title: 'TDAH, trouble bipolaire : mieux décider, ensemble',
      body: 'Des troubles fréquents, un suivi au long cours, des décisions lourdes. Quand l’IA est fiable et lisible, le soin gagne en précision, et le patient en voix.',
      tag: 'Pharmacie de précision · santé mentale',
    },
    trans: {
      label: 'Un fil translationnel',
      a: 'Médicament',
      b: 'Biomarqueurs',
      c: 'Modèle explicable',
      d: 'Dispositif numérique',
    },
  },

  vote: {
    eyebrow: 'Vos disponibilités',
    heading: 'Aidez-moi à fixer la date.',
    lead: 'Cochez tous les créneaux qui vous conviennent dans la semaine du 6 au 10 juillet 2026. Plus vous en cochez, plus il sera simple de réunir tout le monde.',
    step1: 'Vous',
    step2: 'Vos créneaux',
    step3: 'Récapitulatif & envoi',
    nameLabel: 'Votre nom',
    namePlaceholder: 'Prénom Nom',
    jurySelectPlaceholder: 'Sélectionnez votre nom',
    roleLabel: 'Vous êtes…',
    roleJury: 'Membre du jury',
    roleGuest: 'Invité·e',
    legendFree: 'Disponible',
    legendSelected: 'Sélectionné',
    legendRecommended: 'Recommandé',
    legendAvoid: 'À éviter',
    recoBadge: '⭐ Créneau privilégié',
    recoReason: 'Recommandé car déjà confirmé par un membre du jury.',
    avoidFlag: 'à éviter',
    stateFree: 'Disponible',
    stateSelected: 'Sélectionné',
    confirmedPeople: 'déjà disponibles',
    summaryTitle: 'Votre sélection',
    summaryEmpty:
      'Aucun créneau coché pour le moment. Sélectionnez un ou plusieurs créneaux ci-dessus.',
    summaryRole: 'Rôle',
    summaryNameMissing: '(nom non renseigné)',
    countOne: '{n} créneau sélectionné',
    countMany: '{n} créneaux sélectionnés',
    send: 'Envoyer mes disponibilités',
    sending: 'Envoi…',
    sentDb: 'Disponibilités enregistrées ✓',
    copy: 'Copier le résumé',
    copied: 'Résumé copié ✓',
    needName: 'Ajoutez votre nom pour activer l’envoi.',
    needSlot: 'Cochez au moins un créneau.',
    checking: 'Vérification…',
    alreadyVotedTitle: 'Vous avez déjà répondu',
    alreadyVotedBody:
      'Vos disponibilités sont déjà enregistrées, merci ! Pour les modifier, contactez-moi directement par e-mail.',
    successTitle: 'Merci, c’est noté !',
    successBody: 'Vos disponibilités ont bien été enregistrées. Vous pouvez fermer cette page.',
    errorTitle: 'L’enregistrement a échoué',
    errorBody:
      'Pas d’inquiétude : utilisez le bouton ci-dessous pour m’envoyer vos disponibilités par e-mail.',
    sendByEmail: 'Envoyer par e-mail',
    privacy:
      'Vos réponses servent uniquement à fixer la date et ne sont jamais affichées publiquement : la page ne montre que des compteurs. La seule confirmation nominative visible l’est avec l’accord de la personne concernée.',
    realtimeHint: 'Compteurs mis à jour en direct',
  },

  dashboard: {
    eyebrow: 'Convergence',
    heading: 'Où les disponibilités se rejoignent.',
    lead: 'Nombre de personnes disponibles par créneau (sans aucun nom). De quoi repérer d’un coup d’œil la date qui réunit le plus de monde.',
    votes: 'disponibles',
    best: 'Créneau le plus suivi',
    empty: 'Pas encore de réponse.',
  },

  rsvp: {
    eyebrow: 'Présence',
    heading: 'Vous comptez venir ?',
    lead: 'Proches, famille, collègues : faites-moi signe. Cela m’aide à dimensionner la salle et le moment convivial qui suit.',
    nameLabel: 'Votre nom',
    namePlaceholder: 'Prénom Nom',
    companionsLabel: 'Accompagnant·e·s',
    presenceLabel: 'Vous serez là ?',
    presenceYes: 'Je viendrai',
    presenceMaybe: 'Peut-être',
    prefSlotLabel: 'Créneau préféré (optionnel)',
    prefSlotNone: 'Sans préférence',
    emailLabel: 'E-mail (optionnel)',
    emailPlaceholder: 'pour recevoir l’invitation',
    emailHint: 'Uniquement pour vous tenir informé·e. Jamais affiché publiquement.',
    submit: 'Confirmer ma présence',
    submitting: 'Envoi…',
    successTitle: 'À très bientôt !',
    successBody: 'Merci, votre réponse est enregistrée.',
    errorTitle: 'L’envoi a échoué',
    errorBody: 'Réessayez dans un instant, ou écrivez-moi directement par e-mail.',
    counterLabel: 'présents attendus',
    maybeLabel: 'peut-être',
    capacityLabel: 'Capacité de la salle',
    placesLeft: '{n} places restantes',
  },

  jourj: {
    eyebrow: 'Le jour J',
    heading: 'Rendez-vous le jour de la soutenance.',
    leadTba:
      'La date exacte sera fixée dès que les disponibilités du jury seront connues. Indiquez les vôtres pour la verrouiller au plus vite.',
    lead: 'Tout ce qu’il faut savoir pour nous rejoindre.',
    addToCalendar: 'Ajouter à mon agenda',
    programTitle: 'Déroulé',
    accessTitle: 'Accès',
    addressLabel: 'Adresse',
  },

  footer: {
    ispb: 'Institut des Sciences Pharmaceutiques et Biologiques (ISPB), Faculté de Pharmacie de Lyon, Université Claude Bernard Lyon 1.',
    address: '8 avenue Rockefeller, 69373 Lyon Cedex 08',
    fullTitleLabel: 'Titre complet',
    fullTitle:
      '« Intelligence artificielle explicable et de confiance dans le diagnostic, le suivi personnalisé et l’optimisation thérapeutique du TDAH et du trouble bipolaire : évaluation critique des preuves et cadre translationnel pour l’exercice pharmaceutique. »',
    note: 'Créneaux d’environ 2 h, 9 h–18 h, du lundi au vendredi.',
    degree: 'Thèse d’exercice en vue du Diplôme d’État de docteur en pharmacie.',
    credit: 'Conçu avec soin pour le jury, les proches et les curieux.',
  },

  meta: {
    homeTitle: 'Ouvrir la boîte noire · Soutenance de thèse · ISPB Lyon · Juillet 2026',
    homeDescription:
      'Soutenance de thèse d’exercice à l’ISPB (Lyon) : IA explicable et de confiance dans le TDAH et le trouble bipolaire. Indiquez vos disponibilités pour fixer la date.',
    juryTitle: 'Disponibilités · Soutenance · ISPB Lyon',
    juryDescription: 'Page de recueil des disponibilités pour la soutenance de thèse de Pierre.',
  },

  // Corps de l'e-mail de secours (mailto). {name} est interpolé.
  mail: {
    subject: '[Soutenance Pierre] Disponibilités de {name}',
    greeting: 'Bonjour Pierre,',
    intro: 'Voici mes disponibilités pour ta soutenance de thèse.',
    name: 'Nom',
    role: 'Rôle',
    slotsHeader: 'Créneaux qui me conviennent :',
    none: '(aucun créneau coché)',
    footer: '(Message généré depuis la page de disponibilités.)',
  },

  // Formatage des dates (utilisé par lib/datetime). 1 = lundi.
  weekdays: ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
  months: [
    '',
    'janvier',
    'février',
    'mars',
    'avril',
    'mai',
    'juin',
    'juillet',
    'août',
    'septembre',
    'octobre',
    'novembre',
    'décembre',
  ],
};

export type Dict = typeof fr;
