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
    defense: 'La soutenance',
    rsvp: 'Je viendrai',
    language: 'Langue',
    fr: 'FR',
    en: 'EN',
  },

  hero: {
    kicker: 'Soutenance de thèse · Été 2026 · ISPB Lyon',
    by: 'Une thèse présentée par',
    title: 'Ouvrir la boîte noire.',
    subtitle:
      'IA explicable et de confiance dans le diagnostic, le suivi personnalisé et l’optimisation thérapeutique du TDAH et du trouble bipolaire : un cadre translationnel pour l’exercice pharmaceutique.',
    intrigue:
      'En juillet 2026, à l’ISPB : ce qu’une revue PRISMA de 46 études récentes dit de l’IA en neuropsychiatrie, et la place du pharmacien dans cette transition.',
    cta: 'Voir la date & l’accès',
    ctaHint: 'Tout pour nous rejoindre le jour J',
    scrollCue: 'Découvrir',
    dateConfirmed: 'Date confirmée',
    dateValue: 'Mercredi 22 juillet 2026 · 14 h',
    dateRoom: 'Salle des thèses · ISPB Lyon',
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
    lead: 'Cochez tous les créneaux qui vous conviennent. La semaine du 20 au 24 juillet 2026 est privilégiée ; la semaine du 17 au 21 août n’est qu’un repli si aucune date commune n’émerge en juillet. Plus vous cochez de créneaux, plus il sera simple de réunir tout le monde.',
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
    recoReason: 'Créneau à privilégier pour réunir tout le monde plus vite.',
    avoidFlag: 'à éviter',
    stateFree: 'Disponible',
    stateSelected: 'Sélectionné',
    confirmedPeople: 'déjà disponibles',
    summaryTitle: 'Votre sélection',
    summaryEmpty:
      'Aucun créneau coché pour le moment. Sélectionnez un ou plusieurs créneaux ci-dessus.',
    summaryRole: 'Rôle',
    summaryNameMissing: '(nom non renseigné)',
    readyTitle: 'Prêt à envoyer',
    readyBody:
      'Vérifiez votre nom et les créneaux cochés, puis validez. Un message de confirmation s’affichera dès que l’enregistrement sera terminé.',
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
    successTitle: 'Disponibilités enregistrées',
    successBody:
      'C’est bien validé : vos créneaux sont transmis et ajoutés au tableau de convergence.',
    successSelection: 'Créneaux enregistrés',
    successNext: 'Vous pouvez fermer cette page. Pour corriger une réponse, contactez-moi par e-mail.',
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

  admin: {
    open: 'Accès admin',
    title: 'Résultats détaillés',
    lead: 'Accès privé léger pour visualiser les réponses nominatives et les compteurs.',
    passwordLabel: 'Mot de passe',
    passwordPlaceholder: 'Mot de passe',
    unlock: 'Ouvrir',
    wrongPassword: 'Mot de passe incorrect.',
    close: 'Fermer',
    refresh: 'Rafraîchir',
    loading: 'Chargement…',
    unavailable: 'Supabase n’est pas configuré dans cet environnement.',
    error: 'Impossible de charger les résultats pour le moment.',
    availabilityTitle: 'Disponibilités reçues',
    rsvpTitle: 'RSVP reçus',
    empty: 'Aucune réponse pour le moment.',
    role: 'Rôle',
    slots: 'Créneaux',
    comment: 'Commentaire',
    companions: 'Accompagnant·e·s',
    presence: 'Présence',
    preferredSlot: 'Créneau préféré',
    email: 'E-mail',
    submittedAt: 'Envoyé le',
    insightsTitle: 'Insights jury',
    byMember: 'Par membre',
    byModule: 'Par module',
    openAnswers: 'Réponses ouvertes',
    noInsights: 'Aucun insight pour le moment.',
    noValue: '—',
    cartographie: 'Cartographie de la sensibilisation',
    cartographieLead:
      'Vue par axe des réponses recueillies, plus le détail nominatif des membres du jury.',
    byRole: 'Par type de répondant',
    byAxis: 'Par axe',
    juryDetail: 'Détail du jury (nominatif)',
    conceptAccuracy: 'Bonnes associations',
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
      'La date exacte sera fixée dès que les disponibilités du jury seront connues.',
    lead: 'Tout ce qu’il faut savoir pour nous rejoindre.',
    dateLabel: 'Date',
    timeLabel: 'Horaire',
    roomLabel: 'Salle',
    addToCalendar: 'Ajouter à mon agenda',
    icsTitle: 'Soutenance de thèse — Pierre Gil (ISPB Lyon)',
    programTitle: 'Déroulé',
    accessTitle: 'Accès',
    addressLabel: 'Adresse',
    confirmedBy: 'Date officiellement validée par le service des thèses de l’ISPB.',
  },

  insights: {
    eyebrow: 'Avant la soutenance',
    heading: 'Votre regard sur l’IA en santé mentale',
    intro:
      'Quelques questions courtes, sans bonne ni mauvaise réponse, pour explorer ensemble les notions que j’aborderai. Vous découvrirez aussi comment se positionnent les autres participants.',
    identityTitle: 'Avant de commencer',
    identityLead: 'Vous pouvez rester anonyme, ou vous présenter (facultatif).',
    roleAnon: 'Anonyme',
    roleJury: 'Membre du jury',
    roleProche: 'Proche ou collègue',
    roleCurieux: 'Curieux',
    jurySelect: 'Choisissez votre nom',
    start: 'Commencer',
    progress: 'Étape {n} sur {total}',
    axisLangage: 'Le langage de l’IA',
    axisDiagnostic: 'Le diagnostic',
    axisSuivi: 'Le suivi personnalisé',
    axisExplicabilite: 'L’explicabilité et la confiance',
    validate: 'Valider',
    next: 'Continuer',
    skip: 'Passer',
    finish: 'Voir ma synthèse',
    noWrong: 'Sans bonne ni mauvaise réponse',
    youAnswered: 'Votre réponse',
    collective: 'L’ensemble des répondants',
    evidence: 'Études analysées',
    firstContributor: 'Vous êtes parmi les premiers à contribuer.',
    sharedCount: '{n} regards déjà partagés',
    joinMajority: 'Votre réponse rejoint celle de la majorité.',
    standOut: 'Votre réponse se distingue de l’ensemble.',
    revealMore: 'à approfondir lors de la soutenance',
    familiarityLow: 'Pas du tout',
    familiarityHigh: 'Très à l’aise',
    synthesisTitle: 'Votre parcours en un coup d’œil',
    synthesisFamiliarity: 'Votre aisance déclarée avec les notions d’IA',
    synthesisInvite: 'Au plaisir d’en discuter le jour de la soutenance.',
    privacy:
      'Vos réponses servent uniquement à préparer la soutenance. Seuls des comptes agrégés sont affichés, jamais un nom.',
    demoNotice: 'Mode démonstration, vos réponses ne sont pas enregistrées ici.',
    modules: {
      'situer-ia': {
        q: 'Voici cinq exemples. Selon vous, lesquels relèvent de l’intelligence artificielle, et de quelle famille ?',
        items: {
          logigramme: 'Un arbre de décision écrit à la main (si tel symptôme, alors tel test)',
          assistant: 'Un assistant conversationnel comme ceux du grand public',
          foret: 'Une forêt aléatoire qui combine des centaines d’arbres',
          'cnn-irm': 'Un réseau de neurones qui analyse une image cérébrale',
          calculatrice: 'Une calculatrice de poche',
        },
        categories: {
          regles: 'Règles écrites par l’humain',
          apprentissage: 'Apprentissage à partir d’exemples',
          profond: 'Apprentissage profond (réseaux de neurones)',
          'hors-ia': 'Hors intelligence artificielle',
        },
        reveal:
          'On peut se représenter l’IA comme des poupées russes, des règles écrites jusqu’aux réseaux de neurones. Beaucoup d’approches coexistent, et toutes ne se valent pas selon la donnée.',
      },
      familiarite: {
        q: 'À quel point ces notions vous sont-elles familières ?',
        items: {
          ml: 'Apprentissage automatique',
          reseaux: 'Réseaux de neurones',
          explicabilite: 'Explicabilité des modèles',
          langage: 'Analyse automatique du langage',
        },
        reveal: 'Merci, cela m’aide à calibrer mon niveau d’explication.',
      },
      'delai-diagnostic': {
        q: 'Le trouble bipolaire débute le plus souvent par un épisode dépressif, ce qui peut retarder son identification. Selon vous, combien d’années s’écoulent en moyenne avant le bon diagnostic ?',
        unit: 'ans',
        reveal:
          'Les études analysées situent ce délai autour de neuf ans. Ce décalage tient surtout à ce que le trouble se révèle d’abord par la dépression.',
      },
      'diagnostic-differentiel': {
        q: 'Parmi les personnes finalement diagnostiquées bipolaires, quelle part avait d’abord été prise pour une dépression simple ?',
        unit: '%',
        reveal:
          'Une part importante, de l’ordre de la moitié, selon les travaux analysés. L’enjeu est réel, un antidépresseur seul peut aggraver un trouble bipolaire méconnu.',
      },
      intensification: {
        q: 'Ajouter des médicaments à un traitement améliore toujours le suivi d’un trouble bipolaire.',
        poleLeft: 'Pas du tout d’accord',
        poleRight: 'Tout à fait d’accord',
        reveal:
          'Le bénéfice dépend du niveau de risque. Chez certains patients, intensifier peut nuire plutôt qu’aider. Le bon dosage prime sur la quantité.',
      },
      'role-pharmacien': {
        q: 'Où le pharmacien sera-t-il, selon vous, le plus décisif pour une IA en santé mentale au service de l’humain ?',
        options: {
          officine: 'À l’officine, au plus près du patient',
          biologie: 'En biologie médicale, pour interpréter les analyses',
          recherche: 'En recherche et dans l’industrie du médicament',
          qualite: 'Dans l’encadrement et l’assurance qualité',
        },
        reveal:
          'Il est présent à tous ces maillons. C’est ce qui en fait un acteur clé de la santé de demain.',
      },
      'performance-fiabilite': {
        q: 'Une intelligence artificielle peut sembler très performante sur un score global. Selon vous, quelle part des vrais malades un tel outil peut-il malgré tout manquer ?',
        unit: '%',
        reveal:
          'Bien plus qu’on ne l’imagine, parfois la quasi-totalité, malgré un score flatteur. Un bon score global ne garantit pas la fiabilité.',
      },
      'boite-noire': {
        q: 'Une intelligence artificielle doit pouvoir expliquer ses décisions pour être utilisée au lit du patient.',
        poleLeft: 'Pas du tout d’accord',
        poleRight: 'Tout à fait d’accord',
        reveal:
          'C’est une condition souvent jugée essentielle, l’explicabilité nourrit la confiance et la sécurité de la décision.',
      },
    },
  },

  footer: {
    ispb: 'Institut des Sciences Pharmaceutiques et Biologiques (ISPB), Faculté de Pharmacie de Lyon, Université Claude Bernard Lyon 1.',
    address: '8 avenue Rockefeller, 69373 Lyon Cedex 08',
    candidateLabel: 'Candidat',
    fullTitleLabel: 'Titre complet',
    fullTitle:
      '« Intelligence artificielle explicable et de confiance dans le diagnostic, le suivi personnalisé et l’optimisation thérapeutique du TDAH et du trouble bipolaire : évaluation critique des preuves et cadre translationnel pour l’exercice pharmaceutique. »',
    note: 'Créneaux d’environ 2 h, 9 h–18 h, du lundi au vendredi.',
    degree: 'Thèse d’exercice en vue du Diplôme d’État de docteur en pharmacie.',
    credit: 'Conçu avec soin pour le jury, les proches et les curieux.',
  },

  meta: {
    homeTitle: 'Ouvrir la boîte noire · Soutenance de thèse · ISPB Lyon · Été 2026',
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
