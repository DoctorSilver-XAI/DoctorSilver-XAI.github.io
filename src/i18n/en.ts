import type { Dict } from './fr';

/**
 * ENGLISH dictionary: must satisfy `Dict` (the FR-derived contract).
 * Any missing or extra key breaks `astro check`. Academic, restrained English.
 */
export const en: Dict = {
  a11y: {
    skip: 'Skip to content',
    canvasLabel: 'Decorative visualisation of an explainable-AI attention map',
    toTop: 'Back to top',
  },

  nav: {
    brand: 'Defense · ISPB',
    defense: 'The defense',
    rsvp: 'I’ll attend',
    language: 'Language',
    fr: 'FR',
    en: 'EN',
  },

  hero: {
    kicker: 'Thesis defense · Summer 2026 · ISPB Lyon',
    by: 'A thesis presented by',
    title: 'Opening the black box.',
    subtitle:
      'Explainable, trustworthy AI for the diagnosis, personalised monitoring and therapeutic optimisation of ADHD and bipolar disorder: a translational framework for pharmacy practice.',
    intrigue:
      'July 2026, at the ISPB: what a PRISMA review of 46 recent studies tells us about AI in neuropsychiatry, and the pharmacist’s place in this shift.',
    cta: 'See date & venue',
    ctaHint: 'Everything to join us on defense day',
    scrollCue: 'Discover',
    dateConfirmed: 'Date confirmed',
    dateValue: 'Wednesday 22 July 2026 · 2 PM',
    dateRoom: 'Salle des thèses · ISPB Lyon',
  },

  story: {
    eyebrow: 'The topic',
    heading: 'From data to decision, without giving up trust.',
    lead: 'Three steps to grasp what is at stake. Each step reads on two levels: the essentials, then the method.',
    deepDive: 'Go deeper',
    close: 'The rest is revealed on defense day.',
  },

  why: {
    eyebrow: 'Why attend',
    heading: 'What’s at stake that day.',
    lead: 'One hour to understand how artificial intelligence can become legible, trustworthy and useful to care. Rigorous for specialists, accessible to all.',
    c1: {
      title: 'Bringing AI out of the black box',
      body: 'Understanding <em>why</em> a model suggests a diagnosis or adjusts a treatment, not just what it predicts. Explainability (XAI) as the condition for clinical trust.',
      tag: 'Explainability · XAI',
    },
    c2: {
      title: 'The pharmacist, a critical evaluator of AI',
      body: 'Detect, interpret, secure: from the community pharmacy to medical biology, critical literacy of predictive tools matters more than data-science expertise.',
      tag: 'Data literacy · clinical pharmacy',
    },
    c3: {
      title: 'ADHD, bipolar disorder: deciding better, together',
      body: 'Common conditions, long-term follow-up, weighty decisions. When AI is reliable and legible, care gains precision, and the patient a voice.',
      tag: 'Precision pharmacy · mental health',
    },
    trans: {
      label: 'A translational thread',
      a: 'Medicine',
      b: 'Biomarkers',
      c: 'Explainable model',
      d: 'Digital device',
    },
  },

  vote: {
    eyebrow: 'Your availability',
    heading: 'Help me set the date.',
    lead: 'Tick every time slot that works for you. The week of 20–24 July 2026 is preferred; the week of 17–21 August is only a fallback if no common date emerges in July. The more you tick, the easier it is to bring everyone together.',
    step1: 'You',
    step2: 'Your time slots',
    step3: 'Summary & send',
    nameLabel: 'Your name',
    namePlaceholder: 'First name Last name',
    jurySelectPlaceholder: 'Select your name',
    roleLabel: 'You are…',
    roleJury: 'Jury member',
    roleGuest: 'Guest',
    legendFree: 'Available',
    legendSelected: 'Selected',
    legendRecommended: 'Recommended',
    legendAvoid: 'Avoid',
    recoBadge: '⭐ Preferred slot',
    recoReason: 'Slot to prioritise so everyone can be gathered sooner.',
    avoidFlag: 'avoid',
    stateFree: 'Available',
    stateSelected: 'Selected',
    confirmedPeople: 'already available',
    summaryTitle: 'Your selection',
    summaryEmpty: 'No slot ticked yet. Select one or more time slots above.',
    summaryRole: 'Role',
    summaryNameMissing: '(name not provided)',
    readyTitle: 'Ready to send',
    readyBody:
      'Check your name and selected slots, then confirm. A clear confirmation message will appear as soon as saving is complete.',
    countOne: '{n} slot selected',
    countMany: '{n} slots selected',
    send: 'Send my availability',
    sending: 'Sending…',
    sentDb: 'Availability saved ✓',
    copy: 'Copy summary',
    copied: 'Summary copied ✓',
    needName: 'Add your name to enable sending.',
    needSlot: 'Tick at least one slot.',
    checking: 'Checking…',
    alreadyVotedTitle: 'You have already replied',
    alreadyVotedBody:
      'Your availability is already saved, thank you! To change it, contact me directly by email.',
    successTitle: 'Availability saved',
    successBody: 'Confirmed: your time slots have been sent and added to the convergence table.',
    successSelection: 'Saved slots',
    successNext: 'You can close this page. To correct a reply, contact me by email.',
    errorTitle: 'Saving failed',
    errorBody: 'No worries: use the button below to send me your availability by email.',
    sendByEmail: 'Send by email',
    privacy:
      'Your answers are only used to set the date and are never shown publicly: the page only displays counters. The one named confirmation shown is displayed with that person’s consent.',
    realtimeHint: 'Counters updated live',
  },

  dashboard: {
    eyebrow: 'Convergence',
    heading: 'Where availability lines up.',
    lead: 'Number of people available per slot (no names at all). Enough to spot at a glance the date that gathers the most people.',
    votes: 'available',
    best: 'Most-followed slot',
    empty: 'No response yet.',
  },

  admin: {
    open: 'Admin access',
    title: 'Detailed results',
    lead: 'Light private access to view named replies and counters.',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Password',
    unlock: 'Open',
    wrongPassword: 'Incorrect password.',
    close: 'Close',
    refresh: 'Refresh',
    loading: 'Loading…',
    unavailable: 'Supabase is not configured in this environment.',
    error: 'Unable to load results right now.',
    availabilityTitle: 'Availability replies',
    rsvpTitle: 'RSVP replies',
    empty: 'No reply yet.',
    role: 'Role',
    slots: 'Slots',
    comment: 'Comment',
    companions: 'Companions',
    presence: 'Attendance',
    preferredSlot: 'Preferred slot',
    email: 'Email',
    submittedAt: 'Sent on',
    insightsTitle: 'Jury insights',
    byMember: 'By member',
    byModule: 'By module',
    openAnswers: 'Open-ended answers',
    noInsights: 'No insights yet.',
    noValue: '—',
  },

  rsvp: {
    eyebrow: 'Attendance',
    heading: 'Planning to come?',
    lead: 'Loved ones, family, colleagues: let me know. It helps me size the room and the celebration that follows.',
    nameLabel: 'Your name',
    namePlaceholder: 'First name Last name',
    companionsLabel: 'Companions',
    presenceLabel: 'Will you be there?',
    presenceYes: 'I’ll come',
    presenceMaybe: 'Maybe',
    prefSlotLabel: 'Preferred slot (optional)',
    prefSlotNone: 'No preference',
    emailLabel: 'Email (optional)',
    emailPlaceholder: 'to receive the invitation',
    emailHint: 'Only to keep you posted. Never shown publicly.',
    submit: 'Confirm my attendance',
    submitting: 'Sending…',
    successTitle: 'See you soon!',
    successBody: 'Thank you, your reply has been recorded.',
    errorTitle: 'Sending failed',
    errorBody: 'Please try again in a moment, or email me directly.',
    counterLabel: 'expected attendees',
    maybeLabel: 'maybe',
    capacityLabel: 'Room capacity',
    placesLeft: '{n} seats left',
  },

  jourj: {
    eyebrow: 'The day',
    heading: 'See you on defense day.',
    leadTba:
      'The exact date will be set as soon as the jury’s availability is known.',
    lead: 'Everything you need to join us.',
    dateLabel: 'Date',
    timeLabel: 'Time',
    roomLabel: 'Room',
    addToCalendar: 'Add to my calendar',
    icsTitle: 'Thesis defense — Pierre Gil (ISPB Lyon)',
    programTitle: 'Schedule',
    accessTitle: 'Getting there',
    addressLabel: 'Address',
    confirmedBy: 'Date officially confirmed by the ISPB thesis office.',
  },

  insights: {
    // Section header
    eyebrowPublic: 'Test your intuition',
    eyebrowJury: 'Ahead of the defense',
    headingPublic: 'AI in mental health: what you (already) know.',
    headingJury: 'Your perspective matters to me.',
    introPublic:
      'A few short questions, with no right or wrong answer, to explore together a pivotal moment: the one where AI is reshaping diagnosis and care in mental health.',
    introJury:
      'We are living through a pivotal moment: AI is redrawing diagnosis, monitoring and therapeutic optimisation in neuropsychiatry. These few modules — no grading, no traps — help me calibrate my talk on defense day and prepare the right demonstrations. The pharmacist, as you will see, turns out to be at the heart of tomorrow’s healthcare.',
    // Journey / navigation
    actLabel: 'Act',
    act1: 'Your bearings',
    act2: 'What AI can already do',
    act3: 'Explainability, the condition for trust',
    act4: 'Which medicine, which society — and what role for the pharmacist?',
    progress: 'Module {n} of {total}',
    identityLabel: 'You are',
    identityPlaceholder: 'Select your name',
    next: 'Next',
    finish: 'Finish',
    submit: 'Submit my answer',
    skip: 'Skip',
    answered: 'Already answered ✓',
    thanksTitle: 'Thank you!',
    thanksBody: 'Your answers will help me prepare a defense worthy of you. See you very soon.',
    revealLabel: 'Takeaway',
    youAnswered: 'Your answer',
    distributionLabel: 'How others answered',
    noData: 'Be the first to answer.',
    demoNotice: 'Demo mode: your answers are not saved here.',
    sliderLeft: 'Substitution',
    sliderRight: 'Augmentation',
    familiarityLow: 'Not at all',
    familiarityHigh: 'Very comfortable',
    privacyJury:
      'Your answers are named but private: they are used only to prepare the defense and are never shown publicly.',
    // Modules — one object per module, keys aligned with src/config/modules.ts
    modules: {
      'interet-global': {
        q: 'What interests you most in this work?',
        opt: {
          'methodes-xai': 'AI methods and their explainability',
          clinique: 'Concrete clinical applications',
          paradigme: 'The paradigm shift (early screening, prevention, personalisation)',
          'ethique-societe': 'Ethical and societal stakes',
          pharmacien: 'The role of the pharmacist',
          'medico-eco': 'The medico-economic impact',
        },
        reveal: 'This cue helps me prioritise my speaking time on defense day.',
      },
      'familiarite-ia': {
        q: 'How familiar are these concepts to you?',
        item: {
          ml: 'Machine Learning',
          reseaux: 'Neural networks',
          shap: 'SHAP / LIME (explainability)',
          nlp: 'NLP (language analysis)',
          pgx: 'Pharmacogenomics',
        },
        reveal: 'Thank you: I will calibrate my level of explanation accordingly.',
      },
      'pepite-arn': {
        q: 'A simple blood panel (RNA editing) distinguishes bipolar disorder from unipolar depression. With what performance (AUC), in your view?',
        opt: { a: '≈ 0.55 (barely better than chance)', b: '≈ 0.70', c: '> 0.90', d: '= 1.0 (perfect)' },
        reveal:
          'AUC > 0.90 (Salvetat) — we “read the brain in the blood” via circulating cells. Close to a companion test, where imaging plateaus.',
      },
      'promesse-bipolaire': {
        q: 'Today, how many years pass on average between the first episode and the diagnosis of bipolar disorder?',
        opt: { a: '≈ 2 years', b: '≈ 5 years', c: '≈ 9 years', d: '≈ 15 years' },
        reveal:
          '≈ 9 years (Keramatian). It is precisely this wandering that AI-assisted early screening could shorten.',
      },
      'pepite-polypharmacie': {
        q: 'True or false: adding an antipsychotic to a mood stabiliser always reduces mortality in bipolar disorder.',
        opt: { vrai: 'True', faux: 'False' },
        reveal:
          'False: in patients at low vital risk, this combination increases mortality (HR 1.50, Lieslehto). Polypharmacy is only beneficial when targeted.',
      },
      'xai-verrou': {
        q: 'In your view, what most holds back the clinical adoption of AI?',
        opt: { performance: 'Insufficient performance', explicabilite: 'The lack of explainability and trust', cout: 'Cost', reglementation: 'Regulation' },
        reveal:
          'The thesis argues that explainability is the main bottleneck (hypothesis H3): more than raw performance, it is what conditions trust and use.',
      },
      'pepite-auc': {
        q: 'True or false: a model can show an excellent AUC while being almost unable to detect actual patients.',
        opt: { vrai: 'True', faux: 'False' },
        reveal:
          'True: sensitivity ≈ 1.7% despite a decent AUC (Huynh). “Never read an AUC alone” — hence the demand for rigour and explainability.',
      },
      'opinion-aug-sub': {
        q: 'For you, AI in neuropsychiatry is mainly about…',
        reveal:
          'The thesis firmly defends the augmentation of the clinician (and the patient), never substitution.',
      },
      'enjeux-humain': {
        q: 'The greatest societal risk of poorly governed AI in mental health?',
        opt: { attention: 'The commodification of attention', autonomie: 'The loss of autonomy and free will', inegalites: 'The widening of inequalities in access', deshumanisation: 'The dehumanisation of care', surveillance: 'Data surveillance' },
        reveal:
          'There is no wrong answer: these risks are linked. The challenge is to place mental well-being — and not the mere capture of attention — at the centre of innovation.',
      },
      'pharmacien-pivot': {
        q: 'In which link will the pharmacist be most decisive for an AI in mental health that serves people?',
        opt: { officine: 'In the community pharmacy (first recourse, detection and support)', biologie: 'In medical biology (co-interpretation of biomarkers)', 'rd-industrie': 'In R&D and industry (augmented drugs and devices)', 'reglementation-qualite': 'In regulation and quality assurance (AI Act, CE/FDA)' },
        reveal:
          'The thesis shows it: the pharmacist is present at all these links. That is what makes them the essential actor and guarantor of tomorrow’s augmented health.',
      },
      'attente-vision': {
        q: 'In one sentence: under what condition will AI keep its promises in mental health without betraying the human?',
        placeholder: 'Your intuition, in a few words…',
        reveal: 'Thank you — your wording will feed directly into my conclusion.',
      },
    },
  },

  footer: {
    ispb: 'Institute of Pharmaceutical and Biological Sciences (ISPB), Faculty of Pharmacy of Lyon, Université Claude Bernard Lyon 1.',
    address: '8 avenue Rockefeller, 69373 Lyon Cedex 08, France',
    candidateLabel: 'Candidate',
    fullTitleLabel: 'Full title',
    fullTitle:
      '“Explainable and trustworthy artificial intelligence in the diagnosis, personalised monitoring and therapeutic optimisation of ADHD and bipolar disorder: a critical appraisal of the evidence and a translational framework for pharmacy practice.”',
    note: 'Slots of about 2 h, 9 a.m.–6 p.m., Monday to Friday.',
    degree: 'Doctoral thesis towards the State Diploma of Doctor of Pharmacy.',
    credit: 'Crafted with care for the jury, loved ones and the curious.',
  },

  meta: {
    homeTitle: 'Opening the black box · Thesis defense · ISPB Lyon · Summer 2026',
    homeDescription:
      'Thesis defense at the ISPB (Lyon): explainable, trustworthy AI in ADHD and bipolar disorder. Share your availability to help set the date.',
    juryTitle: 'Availability · Thesis defense · ISPB Lyon',
    juryDescription: 'Availability collection page for Pierre’s thesis defense.',
  },

  mail: {
    subject: '[Pierre defense] Availability of {name}',
    greeting: 'Hello Pierre,',
    intro: 'Here is my availability for your thesis defense.',
    name: 'Name',
    role: 'Role',
    slotsHeader: 'Slots that work for me:',
    none: '(no slot ticked)',
    footer: '(Message generated from the availability page.)',
  },

  weekdays: ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  months: [
    '',
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
};
