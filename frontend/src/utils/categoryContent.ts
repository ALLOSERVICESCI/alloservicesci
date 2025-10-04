export type CatSlug = 'urgence' | 'sante' | 'education' | 'examens_concours' | 'services_publics' | 'services_utiles' | 'agriculture' | 'loisirs_tourisme' | 'transport' | 'alertes' | 'pharmacies';

export interface CatItem {
  title: string;
  summary: string;
  tag?: string;
  location?: string;
  commune?: string; // commune/quartier pour les services localises
  date?: string; // ISO or human readable (peut contenir "Horaires: ...")
  source?: string; // url si disponible
  phones?: { label: string; tel: string }[]; // numeros cliquables (tel:)
  ussd?: { label: string; code: string }[]; // codes USSD
}

export const CONTENT_BY_CATEGORY: Record<string, CatItem[]> = {
  urgence: [
    {
      title: 'Pompiers - GSPM',
      summary: 'Secours a victimes, incendies, accidents, inondations, desincarcerations',
      tag: 'Incendie',
      location: 'National, unites basees Abidjan + appuis regionaux',
      phones: [
        { label: 'Numero court', tel: '180' },
        { label: 'Ligne d\'appui', tel: '0101801328' },
        { label: 'Ligne d\'appui', tel: '0103019094' },
        { label: 'Ligne d\'appui', tel: '0501180180' },
        { label: 'Ligne d\'appui', tel: '0789180180' },
      ],
    },
    {
      title: 'SAMU Cote d\'Ivoire',
      summary: 'Urgences medicales, ambulances, regulation medicale',
      tag: 'Medical,
      location: 'National, dispatch prioritaire depuis Abidjan',
      phones: [
        { label: 'Numero court', tel: '185' },
        { label: 'Alternative', tel: '2722445353' },
        { label: 'Alternative', tel: '0749960324' },
      ],
    },
    {
      title: 'Police Secours',
      summary: 'Agressions, troubles, detresse citoyenne',
      tag: 'Police',
      location: 'National,
      phones: [
        { label: 'Numero court', tel: '100' }
      ],
    },
    {
      title: 'Gendarmerie nationale',
      summary: 'Securite publique hors centres urbains, renforts, interventions',
      tag: 'Gendarmerie',
      location: 'National,
      phones: [
        { label: 'Numero court', tel: '145' }
      ],
    },
    {
      title: 'ONPC - Office National de la Protection Civile',
      summary: 'Coordination de la protection civile, gestion catastrophes, CPC (Centres Protection Civile)',
      tag: 'Protection civile',
      location: 'Siege Abidjan (Cocody), CPC dans toutes les regions',
      phones: [
        { label: 'Siege', tel: '2722478730' },
        { label: 'Siege', tel: '2722478731' },
        { label: 'Mobile', tel: '0789323232' },
        { label: 'Mobile', tel: '0574323232' },
        { label: 'Mobile', tel: '0150503332' },
      ],
    },
    {
      title: 'INHP - Institut National d\'Hygiene Publique',
      summary: 'Vaccination, prevention, hygiene, suivi epidemies',
      tag: 'Sante publique',
      location: 'Siege Treichville, antennes regionales',
      source: 'mailto:info@inhp.ci',
      phones: [
        { label: 'Standard, tel: '21259254' }
      ],
    },
    {
      title: 'Croix-Rouge de Cote d\'Ivoire',
      summary: 'Premiers secours, catastrophes, soutien communautes',
      tag: 'Aide humanitaire',
      location: 'Siege Abidjan, antennes nationales',
      phones: [
        { label: 'Standard, tel: '2523002661' }
      ],
    },
    {
      title: 'Allo 101 (numero vert gouvernemental)',
      summary: 'Centre d\'appels citoyen : plaintes, infos administratives, alertes',
      tag: 'Numero vert',
      location: 'National (Primature / Min. Communication & Economie Numerique)',
      phones: [
        { label: 'Numero gratuit', tel: '101' }
      ],
    },
    {
      title: 'PLCC - Plateforme de Lutte Contre la Cybercriminalite',
      summary: 'Cyber-escroqueries, fraudes bancaires, assistance victimes',
      tag: 'Cybercriminalite',
      location: 'Abidjan (Plateau - DITT), couverture nationale',
      source: 'https://www.plcc.ci',
      phones: [
        { label: 'Standard, tel: '22447270' },
        { label: 'Standard, tel: '22447271' }
      ],
    },
  ],
  sante: [
    {
      title: 'CHU de Treichville -- Urgences 24/7',
      summary: 'Accueil des urgences medico-chirurgicales. Boulevard de Marseille, Abidjan.',
      tag: 'Hopital,
      location: 'Treichville (Abidjan)',
      date: 'Horaires: 24h/24',
      source: 'https://sante.gouv.ci/'
    },
    {
      title: 'CHU de Cocody -- Urgences',
      summary: 'Prise en charge des urgences et specialites. Acces via Boulevard Francois Mitterrand.',
      tag: 'Hopital,
      location: 'Cocody (Abidjan)',
      date: 'Horaires: 24h/24'
    },
    {
      title: 'Programme de vaccination (PNVSI)',
      summary: 'Vaccinations de routine pour enfants et adultes selon le calendrier national.',
      tag: 'Prevention',
      date: 'Horaires: Lun-Ven 08:00-16:00 (selon centre)',
      source: 'https://sante.gouv.ci/'
    },
  ],
  education: [
    {
      title: 'Calendrier scolaire 2024-2025',
      summary: 'Rentree, conges et periodes d\'examens (BEPC, BAC).',
      tag: 'Officiel,
      date: 'Publication: selon MEN',
      source: 'https://www.education.gouv.ci/'
    },
    {
      title: 'Orientation et bourses',
      summary: 'Procedures d\'orientation et demandes de bourses pour eleves et etudiants.',
      tag: 'Etudes',
      date: 'Horaires: Lun-Ven 08:00-16:00',
      source: 'https://www.education.gouv.ci/'
    },
    {
      title: 'Universite F. H. Boigny -- Scolarite',
      summary: 'Inscriptions, reinscriptions et demandes administratives.',
      tag: 'Universite',
      location: 'Cocody (Abidjan)',
      date: 'Horaires: Lun-Ven 08:00-15:30'
    },
  ],
  examens_concours: [
    {
      title: 'Inscriptions en ligne - Examens (DECO)',
      summary: 'BEPC, BAC: verifiez les dates inscription et modalites chaque session.',
      tag: 'Examens',
      date: 'Periode: selon calendrier DECO',
      source: 'https://www.men-deco.org/'
    },
    {
      title: 'Concours de la Fonction Publique',
      summary: "Consultez les avis douverture, conditions deligibilite et centres dexamen.",
      tag: 'Concours',
      date: 'Periode: selon arretes officiels',
      source: 'https://www.fonctionpublique.gouv.ci/'
    },
    {
      title: 'ENA - Ecole Nationale Administration',
      summary: 'Concours acces aux cycles de formation (annuel).',
      tag: 'Carriere',
      date: 'Periode: session annuelle',
      source: 'https://www.ena.ci/'
    },
  ],
  examens_concours_more: [
    {
      title: 'DECO -- Resultats BEPC / BAC',
      summary: 'Consultez en ligne les resultats officiels des examens scolaires (BEPC, BAC).',
      tag: 'Resultats',
      source: 'https://www.men-deco.org/'
    },
    {
      title: 'BTS Cote dIvoire -- Inscriptions et resultats',
      summary: 'Examens du Brevet de Technicien Superieur (BTS): calendriers, inscriptions, resultats.',
      tag: 'Enseignement superieur',
      source: 'https://bts.mesrs.ci/'
    },
    {
      title: 'CAFOP -- Concours instituteurs',
      summary: 'Concours dentree aux CAFOP (formation des instituteurs).',
      tag: 'Concours',
      source: 'https://www.men-deco.org/'
    },
    {
      title: 'ENS Abidjan -- Concours',
      summary: 'Concours dacces a lEcole Normale Superieure (enseignants).',
      tag: 'Concours',
      source: 'https://www.ensabidjan.ci/'
    },
    {
      title: 'INFAS -- Concours paramedicaux',
      summary: 'Concours dacces a lINFAS (sante): filieres et modalites.',
      tag: 'Concours',
      source: 'https://www.infas.ci/'
    },
    {
      title: 'Fonction publique -- Recrutements & concours',
      summary: 'Annonces officielles des concours et recrutements (tous ministeres).',
      tag: 'Fonction publique',
      source: 'https://www.fonctionpublique.gouv.ci/'
    }
  ],

  services_publics: [
    {
      title: 'CNPS (Caisse Nationale de Prevoyance Sociale)',
      summary: 'Protection sociale des travailleurs et prestations (allocations, pensions).',
      tag: 'CNPS',
      source: 'https://www.cnps.ci',
      phones: [
        { label: 'Service client', tel: '2720251000' }
      ]
    },
    {
      title: 'CNAM (Couverture Maladie Universelle)',
      summary: 'Information et prise en charge sante via la CMU (assurance maladie).',
      tag: 'CNAM',
      source: 'https://www.cnam.ci',
      phones: [
        { label: 'Numero vert', tel: '143' }
      ]
    },
    {
      title: 'Impots Cote dIvoire (DGI)',
      summary: 'Declarations et paiements en ligne, informations fiscales (particuliers et entreprises).',
      tag: 'Fiscalite',
      source: 'https://www.dgi.gouv.ci',
      phones: [
        { label: 'Standard, tel: '2720252525' }
      ]
    },
    {
      title: 'Douanes ivoiriennes',
      summary: 'Renseignements et formalites douanieres (import/export).',
      tag: 'Douanes',
      source: 'https://www.douanes.ci',
      phones: [
        { label: 'Ligne info', tel: '2720210800' }
      ]
    },
  ],
  services_utiles: [
    // Eau & Electricite
    {
      title: 'SODECI (Societe de Distribution dEau de Cote dIvoire)',
      summary: 'Eau & Electricite -- Assistance eau potable et signalements de fuites',
      source: 'https://www.sodeci.ci/',
      phones: [
        { label: 'Service client', tel: '175' },
        { label: 'Fixe', tel: '2721230000' },
      ]
    },
    {
      title: 'CIE (Compagnie Ivoirienne dElectricite)',
      summary: 'Eau & Electricite -- Service client electricite et signalements de pannes',
      source: 'https://www.cie.ci/',
      phones: [
        { label: 'Service client', tel: '179' },
        { label: 'Fixe', tel: '2721233333' },
      ]
    },

    // Operateurs Telecoms & Mobile
    {
      title: 'Orange Cote dIvoire - Plateau',
      summary: 'Agence Orange -- Mobile, Internet, Orange Money',
      commune: 'Plateau',
      source: 'https://www.orange.ci',
      phones: [
        { label: 'Service client', tel: '070707' },
      ],
      ussd: [
        { label: 'Forfait', code: '*144#' },
        { label: 'Orange Money', code: '*111#' }
      ]
    },
    {
      title: 'Orange Cote dIvoire - Cocody',
      summary: 'Agence Orange -- Mobile, Internet, Orange Money',
      commune: 'Cocody',
      source: 'https://www.orange.ci',
      phones: [
        { label: 'Service client', tel: '070707' },
      ],
      ussd: [
        { label: 'Forfait', code: '*144#' },
        { label: 'Orange Money', code: '*111#' }
      ]
    },
    {
      title: 'Orange Cote dIvoire - Yopougon',
      summary: 'Agence Orange -- Mobile, Internet, Orange Money',
      commune: 'Yopougon',
      source: 'https://www.orange.ci',
      phones: [
        { label: 'Service client', tel: '070707' },
      ],
      ussd: [
        { label: 'Forfait', code: '*144#' },
        { label: 'Orange Money', code: '*111#' }
      ]
    },
    {
      title: 'MTN Cote dIvoire - Plateau',
      summary: 'Agence MTN -- Mobile, Internet, MoMo',
      commune: 'Plateau',
      source: 'https://www.mtn.ci',
      phones: [
        { label: 'Service client', tel: '555' },
      ],
      ussd: [
        { label: 'Forfait', code: '*133#' },
        { label: 'MoMo', code: '13310#' }
      ]
    },
    {
      title: 'MTN Cote dIvoire - Marcory',
      summary: 'Agence MTN -- Mobile, Internet, MoMo',
      commune: 'Marcory',
      source: 'https://www.mtn.ci',
      phones: [
        { label: 'Service client', tel: '555' },
      ],
      ussd: [
        { label: 'Forfait', code: '*133#' },
        { label: 'MoMo', code: '13310#' }
      ]
    },
    {
      title: 'Moov Africa - Adjame',
      summary: 'Agence Moov -- Mobile, Internet, Moov Money',
      commune: 'Adjame',
      source: 'https://www.moov-africa.ci',
      phones: [
        { label: 'Service client', tel: '1010' },
      ],
      ussd: [
        { label: 'Forfait', code: '*155#' },
        { label: 'Moov Money', code: '1554#' }
      ]
    },
    {
      title: 'Moov Africa - Treichville',
      summary: 'Agence Moov -- Mobile, Internet, Moov Money',
      commune: 'Treichville',
      source: 'https://www.moov-africa.ci',
      phones: [
        { label: 'Service client', tel: '1010' },
      ],
      ussd: [
        { label: 'Forfait', code: '*155#' },
        { label: 'Moov Money', code: '1554#' }
      ]
    },

    // Internet Fixe & TV
    {
      title: 'Canal+ Cote dIvoire - Plateau',
      summary: 'TV par satellite -- Abonnements et decodeurs',
      commune: 'Plateau',
      source: 'https://www.canalplus-afrique.com/ci',
      phones: [
        { label: 'Service client', tel: '2722400000' },
      ]
    },
    {
      title: 'Canal+ Cote dIvoire - Cocody',
      summary: 'TV par satellite -- Abonnements et decodeurs',
      commune: 'Cocody',
      source: 'https://www.canalplus-afrique.com/ci',
      phones: [
        { label: 'Service client', tel: '2722400000' },
      ]
    },
    {
      title: 'Startime CI - Adjame',
      summary: 'TV par satellite -- Decodeurs et recharges',
      commune: 'Adjame',
      phones: [
        { label: 'Service client', tel: '2722424242' },
      ]
    },
    {
      title: 'Orange Internet Fixe - Plateau',
      summary: 'Internet Fibre & ADSL -- Installation et assistance technique',
      commune: 'Plateau',
      source: 'https://www.orange.ci',
      phones: [
        { label: 'Service client', tel: '070707' },
      ]
    },
    {
      title: 'MTN Fiber - Cocody',
      summary: 'Internet Fibre optique -- Installation et SAV',
      commune: 'Cocody',
      source: 'https://www.mtn.ci',
      phones: [
        { label: 'Service client', tel: '555' },
      ]
    },

    // Banques
    {
      title: 'Societe Generale Cote dIvoire - Plateau',
      summary: 'Services bancaires -- Comptes, cartes, credits',
      commune: 'Plateau',
      source: 'https://societegenerale.ci',
      phones: [
        { label: 'Service client', tel: '2720272727' },
      ]
    },
    {
      title: 'Societe Generale CI - Cocody Angre',
      summary: 'Services bancaires -- Comptes, cartes, credits',
      commune: 'Cocody',
      source: 'https://societegenerale.ci',
      phones: [
        { label: 'Service client', tel: '2720272727' },
      ]
    },
    {
      title: 'SGBCI - Marcory Zone 4',
      summary: 'Services bancaires -- Comptes, cartes, credits',
      commune: 'Marcory',
      source: 'https://societegenerale.ci',
      phones: [
        { label: 'Service client', tel: '2720272727' },
      ]
    },
    {
      title: 'Banque Atlantique CI - Plateau',
      summary: 'Services bancaires -- Epargne, virements, prets',
      commune: 'Plateau',
      source: 'https://www.atlantiquefinance.com',
      phones: [
        { label: 'Service client', tel: '2720303030' },
      ]
    },
    {
      title: 'Banque Atlantique - Adjame',
      summary: 'Services bancaires -- Epargne, virements, prets',
      commune: 'Adjame',
      source: 'https://www.atlantiquefinance.com',
      phones: [
        { label: 'Service client', tel: '2720303030' },
      ]
    },
    {
      title: 'Ecobank Cote dIvoire - Plateau',
      summary: 'Services bancaires et mobile banking',
      commune: 'Plateau',
      source: 'https://www.ecobank.com/ci',
      phones: [
        { label: 'Service client', tel: '2720252525' },
      ]
    },
    {
      title: 'Ecobank - Treichville',
      summary: 'Services bancaires et mobile banking',
      commune: 'Treichville',
      source: 'https://www.ecobank.com/ci',
      phones: [
        { label: 'Service client', tel: '2720252525' },
      ]
    },
    {
      title: 'NSIA Banque - Plateau',
      summary: 'Banque et assurance -- Comptes, cartes, assurances',
      commune: 'Plateau',
      source: 'https://www.nsia.com',
      phones: [
        { label: 'Service client', tel: '2720444444' },
      ]
    },
    {
      title: 'NSIA Banque - Yopougon',
      summary: 'Banque et assurance -- Comptes, cartes, assurances',
      commune: 'Yopougon',
      source: 'https://www.nsia.com',
      phones: [
        { label: 'Service client', tel: '2720444444' },
      ]
    },
    {
      title: 'UBA Cote dIvoire - Plateau',
      summary: 'Services bancaires internationaux',
      commune: 'Plateau',
      source: 'https://www.ubagroup.com',
      phones: [
        { label: 'Service client', tel: '2720282828' },
      ]
    },
    {
      title: 'Coris Bank - Adjame',
      summary: 'Services bancaires -- Transferts et epargne',
      commune: 'Adjame',
      phones: [
        { label: 'Service client', tel: '2722505050' },
      ]
    },

    // Services Postaux
    {
      title: 'La Poste CI - Plateau',
      summary: 'Services postaux, colis et mandats',
      commune: 'Plateau',
      date: 'Horaires: Lun-Ven 08:00-16:00'
    },
    {
      title: 'La Poste CI - Treichville',
      summary: 'Services postaux, colis et mandats',
      commune: 'Treichville',
      date: 'Horaires: Lun-Ven 08:00-16:00'
    },
    {
      title: 'La Poste CI - Cocody',
      summary: 'Services postaux, colis et mandats',
      commune: 'Cocody',
      date: 'Horaires: Lun-Ven 08:00-16:00'
    },
  ],
  agriculture: [
    {
      title: 'Conseil du Cafe-Cacao -- Informations officielles',
      summary: 'Actualites de la filiere et campagnes en cours.',
      tag: 'Cacao',
      date: 'Horaires: Lun-Ven 08:00-16:00',
      source: 'https://www.conseilcafecacao.ci/'
    },
    {
      title: 'Prix indicatifs -- Filieres',
      summary: 'Suivez les prix indicatifs des principales cultures.',
      tag: 'Marches',
      date: 'Mises a jour: selon campagne'
    },
    {
      title: 'ANADER -- Conseil agricole',
      summary: 'Appui technique aux producteurs et cooperatives.',
      tag: 'Appui',
      date: 'Horaires: Lun-Ven 08:00-16:00'
    },
  ],
  loisirs_tourisme: [
    {
      title: 'Parc National du Banco -- Abidjan',
      summary: 'Randonnees et decouverte de la foret primaire.',
      tag: 'Nature',
      location: 'Yopougon (Abidjan)',
      date: 'Horaires: 08:00-17:00'
    },
    {
      title: 'Grand-Bassam -- Patrimoine UNESCO',
      summary: 'Visites culturelles, plages et patrimoine historique.',
      tag: 'Patrimoine',
      location: 'Grand-Bassam',
      date: 'Acces: libre (zones publiques)'
    },
    {
      title: 'Musee des Civilisations de Cote dIvoire',
      summary: 'Collections et expositions permanentes.',
      tag: 'Musee',
      location: 'Plateau (Abidjan)',
      date: 'Horaires: Mar-Dim 09:00-18:00 (indicatif)'
    },
  ],
  transport: [
    {
      title: 'SOTRA -- Reseau dAbidjan',
      summary: 'Lignes de bus et bateaux-bus (horaires et plans).',
      tag: 'Urbain',
      location: 'Abidjan',
      date: 'Horaires: 05:30-22:00 (indicatif)',
      source: 'https://www.sotra.ci/'
    },
    {
      title: 'Aeroport FHB -- Vols & informations',
      summary: 'Renseignements vols, bagages et acces.',
      tag: 'Aerien',
      location: 'Port-Bouet (Abidjan)',
      date: 'Horaires: 24h/24',
      source: 'https://www.abidjan-airport.com/'
    },
    {
      title: 'STL -- Bateaux-bus lagunaires',
      summary: 'Liaisons lagunaires Abidjan (selon lignes).',
      tag: 'Lagunaires',
      location: 'Abidjan',
      date: 'Horaires: 06:00-20:00 (indicatif)'
    },
  ],
  alertes: [
    {
      title: 'Publiez une alerte utile',
      summary: 'Signalez un danger, une disparition, un accident ou un embouteillage avec photo et localisation.',
      tag: 'Communaute',
      date: 'Horaires: 24h/24'
    },
    {
      title: 'Astuces de securite',
      summary: "Gardez les numeros durgence a portee de main et partagez des infos verifiees.",
      tag: 'Conseils'
    },
  ],
  pharmacies: [
    {
      title: 'Pharmacies de garde -- Abidjan',
      summary: 'Retrouvez rapidement les pharmacies de garde autour de vous ou par ville.',
      tag: 'De garde',
      date: 'Horaires: 24h/24'
    },
    {
      title: 'Ordre des Pharmaciens -- Infos patients',
      summary: 'Conseils sur le bon usage des medicaments et vigilance.',
      tag: 'Conseils',
      date: 'Horaires: Lun-Ven 08:00-16:00'
    },
  ],
};