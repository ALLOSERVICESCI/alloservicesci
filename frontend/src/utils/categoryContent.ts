export type CatSlug = 'urgence' | 'sante' | 'education' | 'examens_concours' | 'services_publics' | 'services_utiles' | 'agriculture' | 'loisirs_tourisme' | 'transport' | 'alertes' | 'pharmacies';

export interface CatItem {
  title: string;
  summary: string;
  tag?: string;
  location?: string;
  date?: string; // ISO or human readable (peut contenir "Horaires: …")
  source?: string; // url si disponible
  phones?: { label: string; tel: string }[]; // numéros cliquables (tel:)
}

export const CONTENT_BY_CATEGORY: Record<string, CatItem[]> = {
  urgence: [
    {
      title: 'En cas d\'incendie',
      summary: 'Pompier et unités locales en cas d\'incendie.',
      tag: 'Incendie',
      phones: [
        { label: 'Pompiers (GSPM)', tel: '180' },
        { label: 'Pompiers (GSPM) mobile', tel: '0707811818' },
        { label: 'Pompiers d\'Indénié', tel: '2720211289' },
        { label: 'Pompiers de Yopougon', tel: '2723451690' },
      ],
    },
    {
      title: 'Urgences médicales',
      summary: 'SAMU et urgences hospitalières (CHU)',
      tag: 'Médical',
      phones: [
        { label: 'SAMU (Cocody)', tel: '272722445353' },
        { label: 'SAMU (numéro abrégé)', tel: '185' },
        { label: 'CHU de Cocody', tel: '2722481000' },
        { label: 'CHU de Cocody (ligne 2)', tel: '2722449038' },
        { label: 'CHU de Treichville', tel: '2721249122' },
        { label: 'CHU de Yopougon', tel: '2723466454' },
        { label: 'CHU de Yopougon (ligne 2)', tel: '2723466170' },
        { label: 'CHU de Grand-Bassam', tel: '2721301036' },
      ],
    },
    {
      title: 'Police',
      summary: 'Numéros de secours et directions de la police',
      tag: 'Police',
      phones: [
        { label: 'Police secours', tel: '110' },
        { label: 'Police secours (ligne 2)', tel: '111' },
        { label: 'Police secours (numéro abrégé)', tel: '170' },
        { label: 'Direction générale de la police', tel: '2720222030' },
        { label: 'Préfecture de police', tel: '2720210022' },
        { label: 'Police juridique', tel: '2720212300' },
        { label: 'Police économique', tel: '2720325144' },
      ],
    },
    {
      title: 'Gendarmerie',
      summary: 'Contacts de la gendarmerie',
      tag: 'Gendarmerie',
      phones: [
        { label: 'Standard', tel: '2720219758' },
        { label: 'Standard', tel: '2720210170' },
        { label: 'Standard', tel: '05825705' },
      ],
    },
    {
      title: 'État-major de l\'armée',
      summary: 'Contacts de l\'État-major',
      tag: 'Armée',
      phones: [
        { label: 'État-major', tel: '2720214224' },
        { label: 'État-major', tel: '2720211283' },
        { label: 'État-major', tel: '0707835233' },
        { label: 'État-major', tel: '0505312198' },
      ],
    },

  ],
  sante: [
    {
      title: 'CHU de Treichville — Urgences 24/7',
      summary: 'Accueil des urgences médico-chirurgicales. Boulevard de Marseille, Abidjan.',
      tag: 'Hôpital',
      location: 'Treichville (Abidjan)',
      date: 'Horaires: 24h/24',
      source: 'https://sante.gouv.ci/'
    },
    {
      title: 'CHU de Cocody — Urgences',
      summary: 'Prise en charge des urgences et spécialités. Accès via Boulevard François Mitterrand.',
      tag: 'Hôpital',
      location: 'Cocody (Abidjan)',
      date: 'Horaires: 24h/24'
    },
    {
      title: 'Programme de vaccination (PNVSI)',
      summary: 'Vaccinations de routine pour enfants et adultes selon le calendrier national.',
      tag: 'Prévention',
      date: 'Horaires: Lun–Ven 08:00–16:00 (selon centre)',
      source: 'https://sante.gouv.ci/'
    },
  ],
  education: [
    {
      title: 'Calendrier scolaire 2024–2025',
      summary: 'Rentrée, congés et périodes d’examens (BEPC, BAC).',
      tag: 'Officiel',
      date: 'Publication: selon MEN',
      source: 'https://www.education.gouv.ci/'
    },
    {
      title: 'Orientation et bourses',
      summary: "Procédures d’orientation et demandes de bourses pour élèves et étudiants.",
      tag: 'Études',
      date: 'Horaires: Lun–Ven 08:00–16:00',
      source: 'https://www.education.gouv.ci/'
    },
    {
      title: 'Université F. H. Boigny — Scolarité',
      summary: 'Inscriptions, réinscriptions et demandes administratives.',
      tag: 'Université',
      location: 'Cocody (Abidjan)',
      date: 'Horaires: Lun–Ven 08:00–15:30'
    },
  ],
  examens_concours: [
    {
      title: 'Inscriptions en ligne — Examens (DECO)',
      summary: 'BEPC, BAC: vérifiez les dates d’inscription et modalités chaque session.',
      tag: 'Examens',
      date: 'Période: selon calendrier DECO',
      source: 'https://www.men-deco.org/'
    },
    {
      title: 'Concours de la Fonction Publique',
      summary: "Consultez les avis d’ouverture, conditions d’éligibilité et centres d’examen.",
      tag: 'Concours',
      date: 'Période: selon arrêtés officiels',
      source: 'https://www.fonctionpublique.gouv.ci/'
    },
    {
      title: 'ENA — École Nationale d’Administration',
      summary: 'Concours d’accès aux cycles de formation (annuel).',
      tag: 'Carrière',
      date: 'Période: session annuelle',
      source: 'https://www.ena.ci/'
    },
  ],
  services_publics: [
    {
      title: 'CNPS (Caisse Nationale de Prévoyance Sociale)',
      summary: 'Protection sociale des travailleurs et prestations (allocations, pensions).',
      tag: 'CNPS',
      source: 'https://www.cnps.ci',
      phones: [
        { label: 'Service client', tel: '2720251000' }
      ]
    },
    {
      title: 'CNAM (Couverture Maladie Universelle)',
      summary: 'Information et prise en charge santé via la CMU (assurance maladie).',
      tag: 'CNAM',
      source: 'https://www.cnam.ci',
      phones: [
        { label: 'Numéro vert', tel: '143' }
      ]
    },
    {
      title: 'Impôts Côte d’Ivoire (DGI)',
      summary: 'Déclarations et paiements en ligne, informations fiscales (particuliers et entreprises).',
      tag: 'Fiscalité',
      source: 'https://www.dgi.gouv.ci',
      phones: [
        { label: 'Standard', tel: '2720252525' }
      ]
    },
    {
      title: 'Douanes ivoiriennes',
      summary: 'Renseignements et formalités douanières (import/export).',
      tag: 'Douanes',
      source: 'https://www.douanes.ci',
      phones: [
        { label: 'Ligne info', tel: '2720210800' }
      ]
    },
  ],
  services_utiles: [
    {
      title: 'SODECI (Société de Distribution d’Eau de Côte d’Ivoire)',
      summary: 'Eau & Électricité — Assistance eau potable et signalements de fuites',
      tag: 'Eau & Électricité',
      source: 'https://www.sodeci.ci/',
      phones: [
        { label: 'Service client', tel: '175' },
        { label: 'Fixe', tel: '2721230000' },
      ]
    },
    {
      title: 'CIE (Compagnie Ivoirienne d’Électricité)',
      summary: 'Eau & Électricité — Service client électricité et signalements de pannes',
      tag: 'Eau & Électricité',
      source: 'https://www.cie.ci/',
      phones: [
        { label: 'Service client', tel: '179' },
        { label: 'Fixe', tel: '2721233333' },
      ]
    },
    {
      title: 'Orange Côte d’Ivoire',
      summary: 'Opérateurs télécoms & internet — Services USSD : *144# (forfait), *111# (argent mobile)',
      tag: 'Opérateurs télécoms & internet',
      source: 'https://www.orange.ci',
      phones: [
        { label: 'Service client (mobile Orange)', tel: '070707' },
        { label: 'Fixe', tel: '2720221212' }
      ]
    },
    {
      title: 'MTN Côte d’Ivoire',
      summary: 'Opérateurs télécoms & internet — Services USSD : *133# (forfait), 13310# (MoMo)',
      tag: 'Opérateurs télécoms & internet',
      source: 'https://www.mtn.ci',
      phones: [
        { label: 'Service client', tel: '555' },
        { label: 'Fixe', tel: '2720255555' }
      ]
    },
    {
      title: 'Moov Africa Côte d’Ivoire',
      summary: 'Opérateurs télécoms & internet — Services USSD : *155# (forfait), 1554# (Moov Money)',
      tag: 'Opérateurs télécoms & internet',
      source: 'https://www.moov-africa.ci',
      phones: [
        { label: 'Service client', tel: '1010' },
        { label: 'Fixe', tel: '2720311010' }
      ]
    },
    {
      title: 'La Poste de Côte d’Ivoire',
      summary: 'Services postaux, colis et mandats.',
      tag: 'Services',
      location: 'Agences (Plateau, Treichville, etc.)',
      date: 'Horaires: Lun–Ven 08:00–16:00'
    },
  ],
  agriculture: [
    {
      title: 'Conseil du Café-Cacao — Informations officielles',
      summary: 'Actualités de la filière et campagnes en cours.',
      tag: 'Cacao',
      date: 'Horaires: Lun–Ven 08:00–16:00',
      source: 'https://www.conseilcafecacao.ci/'
    },
    {
      title: 'Prix indicatifs — Filières',
      summary: 'Suivez les prix indicatifs des principales cultures.',
      tag: 'Marchés',
      date: 'Mises à jour: selon campagne'
    },
    {
      title: 'ANADER — Conseil agricole',
      summary: 'Appui technique aux producteurs et coopératives.',
      tag: 'Appui',
      date: 'Horaires: Lun–Ven 08:00–16:00'
    },
  ],
  loisirs_tourisme: [
    {
      title: 'Parc National du Banco — Abidjan',
      summary: 'Randonnées et découverte de la forêt primaire.',
      tag: 'Nature',
      location: 'Yopougon (Abidjan)',
      date: 'Horaires: 08:00–17:00'
    },
    {
      title: 'Grand-Bassam — Patrimoine UNESCO',
      summary: 'Visites culturelles, plages et patrimoine historique.',
      tag: 'Patrimoine',
      location: 'Grand-Bassam',
      date: 'Accès: libre (zones publiques)'
    },
    {
      title: 'Musée des Civilisations de Côte d’Ivoire',
      summary: 'Collections et expositions permanentes.',
      tag: 'Musée',
      location: 'Plateau (Abidjan)',
      date: 'Horaires: Mar–Dim 09:00–18:00 (indicatif)'
    },
  ],
  transport: [
    {
      title: 'SOTRA — Réseau d’Abidjan',
      summary: 'Lignes de bus et bateaux-bus (horaires et plans).',
      tag: 'Urbain',
      location: 'Abidjan',
      date: 'Horaires: 05:30–22:00 (indicatif)',
      source: 'https://www.sotra.ci/'
    },
    {
      title: 'Aéroport FHB — Vols & informations',
      summary: 'Renseignements vols, bagages et accès.',
      tag: 'Aérien',
      location: 'Port-Bouët (Abidjan)',
      date: 'Horaires: 24h/24',
      source: 'https://www.abidjan-airport.com/'
    },
    {
      title: 'STL — Bateaux-bus lagunaires',
      summary: 'Liaisons lagunaires Abidjan (selon lignes).',
      tag: 'Lagunaires',
      location: 'Abidjan',
      date: 'Horaires: 06:00–20:00 (indicatif)'
    },
  ],
  alertes: [
    {
      title: 'Publiez une alerte utile',
      summary: 'Signalez un danger, une disparition, un accident ou un embouteillage avec photo et localisation.',
      tag: 'Communauté',
      date: 'Horaires: 24h/24'
    },
    {
      title: 'Astuces de sécurité',
      summary: "Gardez les numéros d'urgence à portée de main et partagez des infos vérifiées.",
      tag: 'Conseils'
    },
  ],
  pharmacies: [
    {
      title: 'Pharmacies de garde — Abidjan',
      summary: 'Retrouvez rapidement les pharmacies de garde autour de vous ou par ville.',
      tag: 'De garde',
      date: 'Horaires: 24h/24'
    },
    {
      title: 'Ordre des Pharmaciens — Infos patients',
      summary: 'Conseils sur le bon usage des médicaments et vigilance.',
      tag: 'Conseils',
      date: 'Horaires: Lun–Ven 08:00–16:00'
    },
  ],
};