export type CatSlug = 'urgence' | 'sante' | 'education' | 'examens_concours' | 'services_publics' | 'services_utiles' | 'agriculture' | 'loisirs_tourisme' | 'transport' | 'alertes' | 'pharmacies';

export interface CatItem {
  title: string;
  summary: string;
  tag?: string;
  location?: string;
  date?: string; // ISO or human readable (peut contenir "Horaires: …")
  source?: string; // url si disponible
  phones?: { label: string; tel: string }[]; // numéros cliquables (tel:)
  ussd?: { label: string; code: string }[]; // codes USSD
}

export const CONTENT_BY_CATEGORY: Record<string, CatItem[]> = {
  urgence: [
    {
      title: 'Pompiers – GSPM',
      summary: 'Secours à victimes, incendies, accidents, inondations, désincarcérations',
      tag: 'Incendie',
      location: 'National, unités basées Abidjan + appuis régionaux',
      phones: [
        { label: 'Numéro court', tel: '180' },
        { label: 'Ligne d\'appui', tel: '0101801328' },
        { label: 'Ligne d\'appui', tel: '0103019094' },
        { label: 'Ligne d\'appui', tel: '0501180180' },
        { label: 'Ligne d\'appui', tel: '0789180180' },
      ],
    },
    {
      title: 'SAMU Côte d\'Ivoire',
      summary: 'Urgences médicales, ambulances, régulation médicale',
      tag: 'Médical',
      location: 'National, dispatch prioritaire depuis Abidjan',
      phones: [
        { label: 'Numéro court', tel: '185' },
        { label: 'Alternative', tel: '2722445353' },
        { label: 'Alternative', tel: '0749960324' },
      ],
    },
    {
      title: 'Police Secours',
      summary: 'Agressions, troubles, détresse citoyenne',
      tag: 'Police',
      location: 'National',
      phones: [
        { label: 'Numéro court', tel: '100' }
      ],
    },
    {
      title: 'Gendarmerie nationale',
      summary: 'Sécurité publique hors centres urbains, renforts, interventions',
      tag: 'Gendarmerie',
      location: 'National',
      phones: [
        { label: 'Numéro court', tel: '145' }
      ],
    },
    {
      title: 'ONPC – Office National de la Protection Civile',
      summary: 'Coordination de la protection civile, gestion catastrophes, CPC (Centres Protection Civile)',
      tag: 'Protection civile',
      location: 'Siège Abidjan (Cocody), CPC dans toutes les régions',
      phones: [
        { label: 'Siège', tel: '2722478730' },
        { label: 'Siège', tel: '2722478731' },
        { label: 'Mobile', tel: '0789323232' },
        { label: 'Mobile', tel: '0574323232' },
        { label: 'Mobile', tel: '0150503332' },
      ],
    },
    {
      title: 'INHP – Institut National d\'Hygiène Publique',
      summary: 'Vaccination, prévention, hygiène, suivi épidémies',
      tag: 'Santé publique',
      location: 'Siège Treichville, antennes régionales',
      source: 'mailto:info@inhp.ci',
      phones: [
        { label: 'Standard', tel: '21259254' }
      ],
    },
    {
      title: 'Croix-Rouge de Côte d\'Ivoire',
      summary: 'Premiers secours, catastrophes, soutien communautés',
      tag: 'Aide humanitaire',
      location: 'Siège Abidjan, antennes nationales',
      phones: [
        { label: 'Standard', tel: '2523002661' }
      ],
    },
    {
      title: 'Allô 101 (numéro vert gouvernemental)',
      summary: 'Centre d\'appels citoyen : plaintes, infos administratives, alertes',
      tag: 'Numéro vert',
      location: 'National (Primature / Min. Communication & Économie Numérique)',
      phones: [
        { label: 'Numéro gratuit', tel: '101' }
      ],
    },
    {
      title: 'PLCC – Plateforme de Lutte Contre la Cybercriminalité',
      summary: 'Cyber-escroqueries, fraudes bancaires, assistance victimes',
      tag: 'Cybercriminalité',
      location: 'Abidjan (Plateau – DITT), couverture nationale',
      source: 'https://www.plcc.ci',
      phones: [
        { label: 'Standard', tel: '22447270' },
        { label: 'Standard', tel: '22447271' }
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
    ,
    {
      title: 'DECO — Résultats BEPC / BAC',
      summary: 'Consultez en ligne les résultats officiels des examens scolaires (BEPC, BAC).',
      tag: 'Résultats',
      source: 'https://www.men-deco.org/'
    },
    {
      title: 'BTS Côte d’Ivoire — Inscriptions et résultats',
      summary: 'Examens du Brevet de Technicien Supérieur (BTS): calendriers, inscriptions, résultats.',
      tag: 'Enseignement supérieur',
      source: 'https://bts.mesrs.ci/'
    },
    {
      title: 'CAFOP — Concours instituteurs',
      summary: 'Concours d’entrée aux CAFOP (formation des instituteurs).',
      tag: 'Concours',
      source: 'https://www.men-deco.org/'
    },
    {
      title: 'ENS Abidjan — Concours',
      summary: 'Concours d’accès à l’École Normale Supérieure (enseignants).',
      tag: 'Concours',
      source: 'https://www.ensabidjan.ci/'
    },
    {
      title: 'INFAS — Concours paramédicaux',
      summary: 'Concours d’accès à l’INFAS (santé): filières et modalités.',
      tag: 'Concours',
      source: 'https://www.infas.ci/'
    },
    {
      title: 'Fonction publique — Recrutements & concours',
      summary: 'Annonces officielles des concours et recrutements (tous ministères).',
      tag: 'Fonction publique',
      source: 'https://www.fonctionpublique.gouv.ci/'
    }
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
      source: 'https://www.sodeci.ci/',
      phones: [
        { label: 'Service client', tel: '175' },
        { label: 'Fixe', tel: '2721230000' },
      ]
    },
    {
      title: 'CIE (Compagnie Ivoirienne d’Électricité)',
      summary: 'Eau & Électricité — Service client électricité et signalements de pannes',
      source: 'https://www.cie.ci/',
      phones: [
        { label: 'Service client', tel: '179' },
        { label: 'Fixe', tel: '2721233333' },
      ]
    },
    {
      title: 'Orange Côte d’Ivoire',
      summary: 'Opérateurs télécoms & internet — Services USSD : *144# (forfait), *111# (argent mobile)',
      source: 'https://www.orange.ci',
      phones: [
        { label: 'Service client (mobile Orange)', tel: '070707' },
        { label: 'Fixe', tel: '2720221212' }
      ],
      ussd: [
        { label: 'Forfait', code: '*144#' },
        { label: 'Orange Money', code: '*111#' }
      ]
    },
    {
      title: 'MTN Côte d’Ivoire',
      summary: 'Services USSD : *133# (forfait), 13310# (MoMo)',
      tag: 'Opérateurs télécoms & internet',
      source: 'https://www.mtn.ci',
      phones: [
        { label: 'Service client', tel: '555' },
        { label: 'Fixe', tel: '2720255555' }
      ],
      ussd: [
        { label: 'Forfait', code: '*133#' },
        { label: 'MoMo', code: '13310#' }
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
      ],
      ussd: [
        { label: 'Forfait', code: '*155#' },
        { label: 'Moov Money', code: '1554#' }
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