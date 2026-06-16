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
    availability: 'Availability',
    rsvp: 'I’ll attend',
    language: 'Language',
    fr: 'FR',
    en: 'EN',
  },

  hero: {
    kicker: 'Thesis defense · July 2026 · ISPB Lyon',
    title: 'Opening the black box.',
    subtitle:
      'Explainable, trustworthy AI for the diagnosis, personalised monitoring and therapeutic optimisation of ADHD and bipolar disorder: a translational framework for pharmacy practice.',
    intrigue:
      'July 2026, at the ISPB: what a PRISMA review of 46 recent studies tells us about AI in neuropsychiatry, and the pharmacist’s place in this shift.',
    cta: 'Share my availability',
    ctaHint: 'Takes seconds, by email or in one click',
    scrollCue: 'Discover',
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
    lead: 'Tick every time slot that works for you during the week of 6–10 July 2026. The more you tick, the easier it is to bring everyone together.',
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
    recoReason: 'Recommended because already confirmed by a jury member.',
    avoidFlag: 'avoid',
    stateFree: 'Available',
    stateSelected: 'Selected',
    confirmedPeople: 'already available',
    summaryTitle: 'Your selection',
    summaryEmpty: 'No slot ticked yet. Select one or more time slots above.',
    summaryRole: 'Role',
    summaryNameMissing: '(name not provided)',
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
    successTitle: 'Thank you, noted!',
    successBody: 'Your availability has been saved. You can close this page.',
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
      'The exact date will be set as soon as the jury’s availability is known. Share yours to lock it in quickly.',
    lead: 'Everything you need to join us.',
    addToCalendar: 'Add to my calendar',
    programTitle: 'Schedule',
    accessTitle: 'Getting there',
    addressLabel: 'Address',
  },

  footer: {
    ispb: 'Institute of Pharmaceutical and Biological Sciences (ISPB), Faculty of Pharmacy of Lyon, Université Claude Bernard Lyon 1.',
    address: '8 avenue Rockefeller, 69373 Lyon Cedex 08, France',
    fullTitleLabel: 'Full title',
    fullTitle:
      '“Explainable and trustworthy artificial intelligence in the diagnosis, personalised monitoring and therapeutic optimisation of ADHD and bipolar disorder: a critical appraisal of the evidence and a translational framework for pharmacy practice.”',
    note: 'Slots of about 2 h, 9 a.m.–6 p.m., Monday to Friday.',
    degree: 'Doctoral thesis towards the State Diploma of Doctor of Pharmacy.',
    credit: 'Crafted with care for the jury, loved ones and the curious.',
  },

  meta: {
    homeTitle: 'Opening the black box · Thesis defense · ISPB Lyon · July 2026',
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
