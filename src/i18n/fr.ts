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
    // En-tête de section
    eyebrowPublic: 'Testez votre intuition',
    eyebrowJury: 'En amont de la soutenance',
    headingPublic: 'L’IA en santé mentale : ce que vous en savez (déjà).',
    headingJury: 'Votre regard m’intéresse.',
    introPublic:
      'Quelques questions courtes, sans bonne ni mauvaise réponse, pour explorer ensemble une période charnière : celle où l’IA reconfigure le diagnostic et le soin en santé mentale.',
    introJury:
      'Nous vivons un moment charnière : l’IA redessine le diagnostic, le suivi et l’optimisation thérapeutique en neuropsychiatrie. Ces quelques modules — sans note ni piège — m’aident à calibrer mon propos le jour J et à préparer les bonnes démonstrations. Le pharmacien, vous le verrez, s’y révèle au cœur de la santé de demain.',
    // Parcours / navigation
    actLabel: 'Acte',
    act1: 'Vos repères',
    act2: 'Ce que l’IA sait déjà faire',
    act3: 'L’explicabilité, condition de la confiance',
    act4: 'Quelle médecine, quelle société — et quel rôle pour le pharmacien ?',
    progress: 'Module {n} sur {total}',
    identityLabel: 'Vous êtes',
    identityPlaceholder: 'Sélectionnez votre nom',
    next: 'Suivant',
    finish: 'Terminer',
    submit: 'Valider ma réponse',
    skip: 'Passer',
    answered: 'Déjà répondu ✓',
    thanksTitle: 'Merci !',
    thanksBody: 'Vos réponses m’aideront à préparer une soutenance à votre hauteur. À très bientôt.',
    revealLabel: 'À retenir',
    youAnswered: 'Votre réponse',
    distributionLabel: 'Les autres ont répondu',
    noData: 'Soyez le premier à répondre.',
    demoNotice: 'Mode démonstration : vos réponses ne sont pas enregistrées ici.',
    sliderLeft: 'Substitution',
    sliderRight: 'Augmentation',
    familiarityLow: 'Pas du tout',
    familiarityHigh: 'Très à l’aise',
    privacyJury:
      'Vos réponses sont nominatives mais privées : elles ne servent qu’à préparer la soutenance et ne sont jamais affichées publiquement.',
    // Modules — un objet par module, clés alignées sur src/config/modules.ts
    modules: {
      'interet-global': {
        q: 'Ce qui vous intéresse le plus dans ce travail ?',
        opt: {
          'methodes-xai': 'Les méthodes d’IA et leur explicabilité',
          clinique: 'Les applications cliniques concrètes',
          paradigme: 'Le changement de paradigme (dépistage précoce, prévention, personnalisation)',
          'ethique-societe': 'Les enjeux éthiques et de société',
          pharmacien: 'Le rôle du pharmacien',
          'medico-eco': 'L’impact médico-économique',
        },
        reveal: 'Ce repère m’aide à hiérarchiser mon temps de parole le jour J.',
      },
      'familiarite-ia': {
        q: 'À quel point ces notions vous sont-elles familières ?',
        item: {
          ml: 'Machine Learning',
          reseaux: 'Réseaux de neurones',
          shap: 'SHAP / LIME (explicabilité)',
          nlp: 'NLP (analyse du langage)',
          pgx: 'Pharmacogénomique',
        },
        reveal: 'Merci : je calibrerai mon niveau d’explication en conséquence.',
      },
      'pepite-arn': {
        q: 'Un simple panel sanguin (édition de l’ARN) distingue le trouble bipolaire d’une dépression unipolaire. Selon vous, avec quelle performance (AUC) ?',
        opt: { a: '≈ 0,55 (à peine mieux que le hasard)', b: '≈ 0,70', c: '> 0,90', d: '= 1,0 (parfait)' },
        reveal:
          'AUC > 0,90 (Salvetat) — on « lit le cerveau dans le sang » via des cellules circulantes. Proche d’un test compagnon, là où l’imagerie plafonne.',
      },
      'promesse-bipolaire': {
        q: 'Aujourd’hui, combien d’années s’écoulent en moyenne entre le 1er épisode et le diagnostic de trouble bipolaire ?',
        opt: { a: '≈ 2 ans', b: '≈ 5 ans', c: '≈ 9 ans', d: '≈ 15 ans' },
        reveal:
          '≈ 9 ans (Keramatian). C’est précisément cette errance que le dépistage précoce assisté par IA pourrait raccourcir.',
      },
      'pepite-polypharmacie': {
        q: 'Vrai ou faux : ajouter un antipsychotique à un thymorégulateur réduit toujours la mortalité dans le trouble bipolaire.',
        opt: { vrai: 'Vrai', faux: 'Faux' },
        reveal:
          'Faux : chez les patients à faible risque vital, cette association augmente la mortalité (HR 1,50, Lieslehto). La polypharmacie n’est bénéfique que ciblée.',
      },
      'xai-verrou': {
        q: 'Selon vous, qu’est-ce qui freine le plus l’adoption clinique de l’IA ?',
        opt: { performance: 'Une performance insuffisante', explicabilite: 'Le manque d’explicabilité et de confiance', cout: 'Le coût', reglementation: 'La réglementation' },
        reveal:
          'La thèse défend l’explicabilité comme verrou principal (hypothèse H3) : c’est elle, plus que la performance brute, qui conditionne la confiance et l’usage.',
      },
      'pepite-auc': {
        q: 'Vrai ou faux : un modèle peut afficher une excellente AUC tout en étant presque incapable de détecter les vrais malades.',
        opt: { vrai: 'Vrai', faux: 'Faux' },
        reveal:
          'Vrai : sensibilité ≈ 1,7 % malgré une AUC correcte (Huynh). « Ne jamais lire une AUC seule » — d’où l’exigence de rigueur et d’explicabilité.',
      },
      'opinion-aug-sub': {
        q: 'Pour vous, l’IA en neuropsychiatrie relève surtout de…',
        reveal:
          'La thèse défend fermement l’augmentation du clinicien (et du patient), jamais la substitution.',
      },
      'enjeux-humain': {
        q: 'Le plus grand risque sociétal d’une IA mal encadrée en santé mentale ?',
        opt: { attention: 'La marchandisation de l’attention', autonomie: 'La perte d’autonomie et de libre arbitre', inegalites: 'Le creusement des inégalités d’accès', deshumanisation: 'La déshumanisation du soin', surveillance: 'La surveillance des données' },
        reveal:
          'Il n’y a pas de mauvaise réponse : ces risques sont liés. L’enjeu est de placer le bien-être mental — et non la seule captation de l’attention — au centre de l’innovation.',
      },
      'pharmacien-pivot': {
        q: 'Dans quel maillon le pharmacien sera-t-il le plus décisif pour une IA en santé mentale au service de l’humain ?',
        opt: { officine: 'À l’officine (1er recours, repérage et accompagnement)', biologie: 'En biologie médicale (co-interprétation des biomarqueurs)', 'rd-industrie': 'En R&D et industrie (médicaments et dispositifs augmentés)', 'reglementation-qualite': 'Dans la réglementation et l’assurance qualité (AI Act, CE/FDA)' },
        reveal:
          'La thèse le montre : le pharmacien est présent à tous ces maillons. C’est ce qui en fait l’acteur, le garant incontournable de la santé augmentée de demain.',
      },
      'attente-vision': {
        q: 'En une phrase : à quelle condition l’IA tiendra-t-elle ses promesses en santé mentale sans trahir l’humain ?',
        placeholder: 'Votre intuition, en quelques mots…',
        reveal: 'Merci — votre formulation nourrira directement ma conclusion.',
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
