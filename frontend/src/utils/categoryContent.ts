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
  image?: string; // URL d'image pour illustrations (campagnes, etc.)
  // Loisirs & Tourisme (facultatifs)
  phone?: string;
  lat?: number;
  lng?: number;
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
      title: 'SAMU Cote Ivoire',
      summary: 'Urgences medicales, ambulances, regulation medicale',
      tag: 'Medical',
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
      location: 'National',
      phones: [
        { label: 'Numero court', tel: '100' }
      ],
    },
    {
      title: 'Gendarmerie nationale',
      summary: 'Securite publique hors centres urbains, renforts, interventions',
      tag: 'Gendarmerie',
      location: 'National',
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
        { label: 'Standard', tel: '21259254' }
      ],
    },
    {
      title: 'Croix-Rouge de Cote d\'Ivoire',
      summary: 'Premiers secours, catastrophes, soutien communautes',
      tag: 'Aide humanitaire',
      location: 'Siege Abidjan, antennes nationales',
      phones: [
        { label: 'Standard', tel: '2523002661' }
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
        { label: 'Standard', tel: '22447270' },
        { label: 'Standard', tel: '22447271' }
      ],
    },
  ],
  sante: [
    {
      title: 'CHU de Treichville -- Urgences 24/7',
      summary: 'Accueil des urgences medico-chirurgicales. Boulevard de Marseille, Abidjan.',
      tag: 'Hopital',
      location: 'Treichville (Abidjan)',
      date: 'Horaires: 24h/24',
      source: 'https://sante.gouv.ci/'
    },
    {
      title: 'CHU de Cocody -- Urgences',
      summary: 'Prise en charge des urgences et specialites. Acces via Boulevard Francois Mitterrand.',
      tag: 'Hopital',
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
      tag: 'Officiel',
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
      summary: 'Concours acces cycles formation (annuel).',
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
        { label: 'Standard', tel: '2720252525' }
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
    {
      title: 'Moov Fibre - Plateau',
      summary: 'Internet Fibre optique haut debit -- Installation et support technique',
      commune: 'Plateau',
      source: 'https://www.moov-africa.ci',
      phones: [
        { label: 'Service client', tel: '1010' },
      ]
    },
    {
      title: 'Moov Fibre - Yopougon',
      summary: 'Internet Fibre optique haut debit -- Installation et support technique',
      commune: 'Yopougon',
      source: 'https://www.moov-africa.ci',
      phones: [
        { label: 'Service client', tel: '1010' },
      ]
    },
    {
      title: 'Moov Fibre - Abobo',
      summary: 'Internet Fibre optique haut debit -- Installation et support technique',
      commune: 'Abobo',
      source: 'https://www.moov-africa.ci',
      phones: [
        { label: 'Service client', tel: '1010' },
      ]
    },
    {
      title: 'Canalbox - Plateau',
      summary: 'Internet Fibre + TV -- Box tout-en-un (Internet + Chaines TV)',
      commune: 'Plateau',
      source: 'https://www.canalplus-afrique.com/ci',
      phones: [
        { label: 'Service client', tel: '2722400000' },
      ]
    },
    {
      title: 'Canalbox - Marcory',
      summary: 'Internet Fibre + TV -- Box tout-en-un (Internet + Chaines TV)',
      commune: 'Marcory',
      source: 'https://www.canalplus-afrique.com/ci',
      phones: [
        { label: 'Service client', tel: '2722400000' },
      ]
    },
    {
      title: 'Canalbox - Koumassi',
      summary: 'Internet Fibre + TV -- Box tout-en-un (Internet + Chaines TV)',
      commune: 'Koumassi',
      source: 'https://www.canalplus-afrique.com/ci',
      phones: [
        { label: 'Service client', tel: '2722400000' },
      ]
    },

    // Mobile Money & Banques Digitales
    {
      title: 'Wave - Plateau',
      summary: 'Mobile Money -- Transferts, paiements, retraits sans frais',
      commune: 'Plateau',
      source: 'https://www.wave.com/ci',
      phones: [
        { label: 'Service client', tel: '2722500500' },
      ]
    },
    {
      title: 'Wave - Adjame',
      summary: 'Mobile Money -- Transferts, paiements, retraits sans frais',
      commune: 'Adjame',
      source: 'https://www.wave.com/ci',
      phones: [
        { label: 'Service client', tel: '2722500500' },
      ]
    },
    {
      title: 'Wave - Yopougon',
      summary: 'Mobile Money -- Transferts, paiements, retraits sans frais',
      commune: 'Yopougon',
      source: 'https://www.wave.com/ci',
      phones: [
        { label: 'Service client', tel: '2722500500' },
      ]
    },
    {
      title: 'Wave - Abobo',
      summary: 'Mobile Money -- Transferts, paiements, retraits sans frais',
      commune: 'Abobo',
      source: 'https://www.wave.com/ci',
      phones: [
        { label: 'Service client', tel: '2722500500' },
      ]
    },
    {
      title: 'Orange Bank CI - Plateau',
      summary: 'Banque digitale -- Comptes, cartes, credits 100% mobile',
      commune: 'Plateau',
      source: 'https://www.orangebank.ci',
      phones: [
        { label: 'Service client', tel: '070707' },
      ]
    },
    {
      title: 'Orange Bank CI - Cocody',
      summary: 'Banque digitale -- Comptes, cartes, credits 100% mobile',
      commune: 'Cocody',
      source: 'https://www.orangebank.ci',
      phones: [
        { label: 'Service client', tel: '070707' },
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
    {
      title: 'SGBCI - Abobo',
      summary: 'Services bancaires -- Comptes, cartes, credits',
      commune: 'Abobo',
      source: 'https://societegenerale.ci',
      phones: [
        { label: 'Service client', tel: '2720272727' },
      ]
    },
    {
      title: 'Ecobank - Koumassi',
      summary: 'Services bancaires et mobile banking',
      commune: 'Koumassi',
      source: 'https://www.ecobank.com/ci',
      phones: [
        { label: 'Service client', tel: '2720252525' },
      ]
    },
    {
      title: 'Banque Atlantique - Port-Bouet',
      summary: 'Services bancaires -- Epargne, virements, prets',
      commune: 'Port-Bouet',
      source: 'https://www.atlantiquefinance.com',
      phones: [
        { label: 'Service client', tel: '2720303030' },
      ]
    },
    {
      title: 'NSIA Banque - Abobo',
      summary: 'Banque et assurance -- Comptes, cartes, assurances',
      commune: 'Abobo',
      source: 'https://www.nsia.com',
      phones: [
        { label: 'Service client', tel: '2720444444' },
      ]
    },
    {
      title: 'UBA - Koumassi',
      summary: 'Services bancaires internationaux',
      commune: 'Koumassi',
      source: 'https://www.ubagroup.com',
      phones: [
        { label: 'Service client', tel: '2720282828' },
      ]
    },
    {
      title: 'Coris Bank - Yopougon',
      summary: 'Services bancaires -- Transferts et epargne',
      commune: 'Yopougon',
      phones: [
        { label: 'Service client', tel: '2722505050' },
      ]
    },

    // Services en regions
    {
      title: 'Orange - Yamoussoukro',
      summary: 'Agence Orange -- Mobile, Internet, Orange Money',
      commune: 'Yamoussoukro',
      source: 'https://www.orange.ci',
      phones: [
        { label: 'Service client', tel: '070707' },
      ]
    },
    {
      title: 'MTN - Yamoussoukro',
      summary: 'Agence MTN -- Mobile, Internet, MoMo',
      commune: 'Yamoussoukro',
      source: 'https://www.mtn.ci',
      phones: [
        { label: 'Service client', tel: '555' },
      ]
    },
    {
      title: 'SGBCI - Yamoussoukro',
      summary: 'Services bancaires -- Comptes, cartes, credits',
      commune: 'Yamoussoukro',
      source: 'https://societegenerale.ci',
      phones: [
        { label: 'Service client', tel: '2720272727' },
      ]
    },
    {
      title: 'Orange - Bouake',
      summary: 'Agence Orange -- Mobile, Internet, Orange Money',
      commune: 'Bouake',
      source: 'https://www.orange.ci',
      phones: [
        { label: 'Service client', tel: '070707' },
      ]
    },
    {
      title: 'MTN - Bouake',
      summary: 'Agence MTN -- Mobile, Internet, MoMo',
      commune: 'Bouake',
      source: 'https://www.mtn.ci',
      phones: [
        { label: 'Service client', tel: '555' },
      ]
    },
    {
      title: 'Ecobank - Bouake',
      summary: 'Services bancaires et mobile banking',
      commune: 'Bouake',
      source: 'https://www.ecobank.com/ci',
      phones: [
        { label: 'Service client', tel: '2720252525' },
      ]
    },
    {
      title: 'Orange - San-Pedro',
      summary: 'Agence Orange -- Mobile, Internet, Orange Money',
      commune: 'San-Pedro',
      source: 'https://www.orange.ci',
      phones: [
        { label: 'Service client', tel: '070707' },
      ]
    },
    {
      title: 'MTN - San-Pedro',
      summary: 'Agence MTN -- Mobile, Internet, MoMo',
      commune: 'San-Pedro',
      source: 'https://www.mtn.ci',
      phones: [
        { label: 'Service client', tel: '555' },
      ]
    },
    {
      title: 'Banque Atlantique - San-Pedro',
      summary: 'Services bancaires -- Epargne, virements, prets',
      commune: 'San-Pedro',
      source: 'https://www.atlantiquefinance.com',
      phones: [
        { label: 'Service client', tel: '2720303030' },
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
    {
      title: 'La Poste CI - Yopougon',
      summary: 'Services postaux, colis et mandats',
      commune: 'Yopougon',
      date: 'Horaires: Lun-Ven 08:00-16:00'
    },
    {
      title: 'La Poste CI - Abobo',
      summary: 'Services postaux, colis et mandats',
      commune: 'Abobo',
      date: 'Horaires: Lun-Ven 08:00-16:00'
    },
    {
      title: 'La Poste CI - Adjame',
      summary: 'Services postaux, colis et mandats',
      commune: 'Adjame',
      date: 'Horaires: Lun-Ven 08:00-16:00'
    },
    {
      title: 'La Poste CI - Koumassi',
      summary: 'Services postaux, colis et mandats',
      commune: 'Koumassi',
      date: 'Horaires: Lun-Ven 08:00-16:00'
    },
    {
      title: 'La Poste CI - Yamoussoukro',
      summary: 'Services postaux, colis et mandats',
      commune: 'Yamoussoukro',
      date: 'Horaires: Lun-Ven 08:00-16:00'
    },
    {
      title: 'La Poste CI - Bouake',
      summary: 'Services postaux, colis et mandats',
      commune: 'Bouake',
      date: 'Horaires: Lun-Ven 08:00-16:00'
    },
  ],
  agriculture: [
    {
      title: "🌾 AGRICULTURE EN CÔTE D'IVOIRE",
      summary: "L'agriculture reste le moteur de l'économie ivoirienne : elle emploie près de la moitié de la population active et fournit plus de 20 % du PIB. Du cacao au riz, en passant par la noix de cajou et le palmier à huile, elle fait vivre des millions de familles et nourrit le pays.\n\n🍫 Filières en mouvement\n\nLe cacao, pilier de nos exportations, se modernise : traçabilité, prix relevé à 2 800 FCFA/kg et usine de transformation locale à Abidjan.\nLes filières riz, hévéa, palmier à huile et noix de cajou bénéficient de nouveaux programmes d'appui et d'infrastructures pour renforcer la production nationale.\n\n🌍 Agriculture durable & innovation\n\nFace au climat et à la déforestation, la Côte d'Ivoire mise sur une agriculture durable et intelligente.\nDrones, capteurs, applications mobiles et formations attirent une nouvelle génération de jeunes agripreneurs.\nDes projets comme PROFIT ou PROMIRE encouragent de meilleures pratiques et la valorisation locale.\n\n📈 Nouveaux marchés & perspectives\n\nLa création de la Bourse des Matières Premières Agricoles (BMPA CI) en 2025 apporte plus de transparence et de stabilité des prix pour les producteurs.\nLe SARA 2025 a confirmé la dynamique d'un secteur qui innove et attire les investissements.\n\n🌱 Avec Allô Services CI\n\nRetrouvez dans cette rubrique :\n\nles prix officiels et actualités agricoles,\n\nles contacts utiles (coopératives, ANADER, CNACI, etc.),\n\net bientôt, des outils de mise en relation entre producteurs, acheteurs et formateurs.\n\nAllô Services CI — votre passerelle vers une agriculture moderne et connectée 🌍💡",
      tag: "Information générale"
    },
    {
      title: "CAYAT - Coopérative Agricole de Yakassé Attobrou",
      summary: "Coopérative cacao engagée dans la durabilité et la certification. Services aux producteurs : formation, équipements, commercialisation groupée, traçabilité.",
      tag: "Coopérative cacao",
      location: "Yakassé-Attobrou (La Mé)",
      phones: [
        { label: "Contact", tel: "0708763390" }
      ],
      source: "https://cayat-ci.com"
    },
    {
      title: "UPAS COOP-CA",
      summary: "Union des Producteurs Agricoles de San-Pedro. Coopérative cacao spécialisée dans la collecte, le tri et la commercialisation. Accompagnement technique des producteurs.",
      tag: "Coopérative cacao",
      location: "San-Pedro",
      phones: [
        { label: "Contact", tel: "2734704080" }
      ],
      source: "https://www.upas-ci.com"
    },
    {
      title: "COOPARES - Coopérative Agricole Multi-zones",
      summary: "Réseau de coopératives présent dans plusieurs régions. Collecte, transformation et commercialisation de produits agricoles. Services d'appui technique et financier.",
      tag: "Coopérative multi-filières",
      location: "Korhogo, Abidjan, San-Pedro, Bouaké, Daloa",
      phones: [
        { label: "Korhogo", tel: "0709237500" },
        { label: "Abidjan", tel: "0707255330" }
      ],
      source: "https://coopares.com"
    },
    {
      title: "YEBO-EKON - Société Coopérative Agricole",
      summary: "Coopérative spécialisée dans la production céréalière et les produits locaux. Transformation et valorisation des cultures vivrières.",
      tag: "Coopérative céréales",
      location: "Daloa",
      phones: [
        { label: "Contact", tel: "0749995953" },
        { label: "Contact 2", tel: "0707587791" }
      ],
      source: "http://coop-yeboekon.net"
    },
    {
      title: "CABN COOP-CA",
      summary: "Coopérative d'appui et d'organisation agricole. Services de structuration, formation et accompagnement des producteurs et coopératives.",
      tag: "Organisation agricole",
      location: "Abidjan, Immeuble TANASSA, 1er étage porte D11",
      phones: [
        { label: "Contact", tel: "2721333615" }
      ],
      source: "https://cabn-ci.com"
    },
    {
      title: "ANADER - Agence Nationale d'Appui au Développement Rural",
      summary: "Institution publique de référence pour l'appui technique, la formation et le conseil agricole. Réseau de 126 antennes à travers le pays. Services : vulgarisation, accompagnement des producteurs, diffusion des innovations.",
      tag: "Institution publique",
      location: "Plateau, Abidjan (siège national + antennes régionales)",
      phones: [
        { label: "Siège", tel: "2720216700" }
      ],
      source: "https://www.anader.ci"
    },
    {
      title: "📚 Écoles, centres de formation agricole & rurale",
      summary: "Structures de formation reconnues pour préparer les jeunes aux métiers agricoles et ruraux. Formations qualifiantes, diplômantes, techniques agricoles et élevage.",
      tag: "Formation agricole"
    },
    {
      title: "CFAR - Centre de Formation Agricole et Rurale des Savanes",
      summary: "Formations qualifiantes de 2 ans pour jeunes de 16-25 ans. Techniques agricoles selon variétés et saisons adaptées aux zones de savanes.",
      tag: "École agricole",
      location: "Niofoin",
      source: "https://fert.fr"
    },
    {
      title: "INFPA - Institut National de Formation Professionnelle Agricole",
      summary: "Réseau d'écoles de formation agricole (EFA) et de spécialisation (ESEMV). Formations diplômantes en production agricole, élevage, gestion d'exploitation.",
      tag: "École agricole",
      location: "Réseau national (Touba, Bingerville)",
      source: "https://infpa.org"
    },
    {
      title: "EFA Ferentella - École de Formation Agricole",
      summary: "Formation agricole pratique et théorique. Dépend de l'INFPA. Cycles de formation en production végétale et animale.",
      tag: "École agricole",
      location: "Touba",
      source: "https://infpa.org"
    },
    {
      title: "ESEMV - École de Spécialisation en Élevage et Métiers de la Viande",
      summary: "Formation spécialisée en élevage, abattage, transformation et commercialisation de la viande. Dépend de l'INFPA.",
      tag: "École agricole",
      location: "Bingerville",
      source: "https://infpa.org"
    },
    {
      title: "INTA - Institut des Nouvelles Techniques Agricoles",
      summary: "Formations diplômantes et qualifiantes en production agricole, élevage, agriculture biologique, agroécologie, transformation alimentaire.",
      tag: "École agricole",
      source: "https://legrandfrere.org"
    },
    {
      title: "Centres de formation rurale ANADER",
      summary: "Réseau de centres de formation pratique dans plusieurs régions : Bingerville-La Mé, Gagnoa-Lakota, Grand-Lahou, Kotobi. Formations courtes et longues pour agriculteurs.",
      tag: "Formation ANADER",
      location: "Bingerville, Gagnoa, Grand-Lahou, Kotobi",
      source: "https://www.anader.ci"
    },
    {
      title: "🌱 Techniques agricoles selon variétés et saisons",
      summary: "Bonnes pratiques techniques adaptées aux cultures, saisons et zones agroécologiques.\n\n🍫 Cacao : Sélection porte-greffe résistant, taille régulière, fertilisation NPK, lutte intégrée parasites, ombrage contrôlé, drainage. Plantation saison pluvieuse. Traçabilité cruciale pour export.\n\n🌾 Riz (inondé/pluvial) : Labour, nivellement, semis direct ou transplantation, fertilisation, gestion eau, désherbage, rotations. Saison pluies (mars-octobre). Variétés cycle court.\n\n🌽 Maïs/Mil/Sorgho : Semis bonne densité, apport phosphore, irrigation si possible, contrôle adventices, rotations avec légumineuses. Début saison pluies. Cultures intermédiaires pour couvrir sol.\n\n🥜 Noix de cajou : Taille formation, fertilisation minérale, paillage, lutte nuisibles (cochenilles, chenilles), nettoyage. Plantation début saison pluies. Bonne tolérance sécheresse.\n\n🌴 Palmier à huile : Sols profonds, apport organique + minéral, fertilisation équilibrée, traitement sanitaire, gestion irrigation/drainage. Suivre phases végétatives. Zones climat favorable.\n\n🥬 Cultures maraîchères : Semis pépinière, transplantation, fertilisation organique, irrigation régulière, lutte maladies fongiques, paillage, rotation. Toute l'année si irrigué. Rentable si marché local.",
      tag: "Techniques culturales"
    },
    {
      title: "📈 Cultures & systèmes agricoles rentables à privilégier",
  // Loisirs & Tourisme
  loisirs_tourisme: [
    // Abidjan
    { title: 'Sofitel Abidjan Hôtel Ivoire', summary: 'Hôtel 5★ avec piscine, restaurants et vue sur la lagune.', commune: 'Cocody', phone: '+225 27 22 44 10 10', source: 'https://all.accor.com', tag: 'Hôtel', },
    { title: 'Zoo d\'Abidjan', summary: 'Parc zoologique historique, idéal en famille.', commune: 'Cocody', phone: '+225 27 22 44 36 88', tag: 'Aire de jeux' },
    { title: 'Parc National du Banco', summary: 'Forêt primaire à 30 min du Plateau pour randonnées.', commune: 'Yopougon', phone: '+225 27 20 33 10 61', tag: 'Site touristique' },
    { title: 'Musée des Civilisations de Côte d\'Ivoire', summary: 'Collections ethnographiques et arts africains.', commune: 'Plateau', phone: '+225 27 20 21 80 51', tag: 'Musée' },
    { title: 'Jardin Botanique de Bingerville', summary: 'Grand jardin historique, balade et pique-nique.', commune: 'Bingerville', phone: '+225 27 22 40 00 00', tag: 'Site touristique' },
    { title: 'Cap Sud Restaurants (Zone 4)', summary: 'Ensemble de restaurants et lounges à Marcory.', commune: 'Marcory', tag: 'Restaurant' },
    { title: 'Galerie Cécile Fakhoury', summary: 'Galerie d\'art contemporain.', commune: 'Marcory', phone: '+225 27 21 35 03 05', tag: 'Art' },

    // Grand-Bassam
    { title: 'Plage de Grand-Bassam', summary: 'Plage historique, maisons coloniales à proximité.', commune: 'Grand-Bassam', tag: 'Plage' },
    { title: 'Musée National du Costume', summary: 'Costumes traditionnels, patrimoine UNESCO.', commune: 'Grand-Bassam', phone: '+225 27 21 30 18 44', tag: 'Musée' },

    // Assinie
    { title: 'Assinie – Étoile du Sud', summary: 'Hôtel plage, sports nautiques, escapade détente.', commune: 'Assinie', phone: '+225 27 21 30 70 71', tag: 'Hôtel' },
    { title: 'Assinie Mafia – Plage', summary: 'Lagune, plage, restaurants sur pilotis.', commune: 'Assinie', tag: 'Plage' },

    // San-Pedro
    { title: 'Plage de Monogaga', summary: 'Superbe plage au nord de San-Pedro.', commune: 'San-Pedro', tag: 'Plage' },

    // Man
    { title: 'Cascades de Man', summary: 'Chutes d\'eau pittoresques au pied des montagnes.', commune: 'Man', tag: 'Site touristique' },
    { title: 'Dent de Man', summary: 'Sommet emblématique pour randonnée.', commune: 'Man', tag: 'Site touristique' },

    // Korhogo
    { title: 'Sculptures Sénoufo – Quartier des Artisans', summary: 'Ateliers de sculpture et tissage Poro.', commune: 'Korhogo', tag: 'Artisanat' },

    // Bouaké
    { title: 'La Paillote – Restaurant', summary: 'Cuisine locale populaire.', commune: 'Bouaké', tag: 'Restaurant' },

    // Yamoussoukro
    { title: 'Basilique Notre‑Dame de la Paix', summary: 'Basilique monumentale ouverte aux visites.', commune: 'Yamoussoukro', phone: '+225 27 30 64 11 11', tag: 'Site touristique' },
    { title: 'Fondation F. Houphouët‑Boigny', summary: 'Centre de culture et de paix.', commune: 'Yamoussoukro', phone: '+225 27 30 64 50 20', tag: 'Site touristique' },
  ],

      summary: "Options porteuses avec bon retour d'investissement :\n\n🍫 Cacao de qualité/durable : Valorisé à l'export, demande croissante pour cacao certifié et traçable.\n\n🥜 Noix de cajou : Forte demande internationale, transformation locale possible, bonne rentabilité.\n\n🌴 Palmier à huile/cultures oléagineuses : Selon sols et conditions climatiques, production stable.\n\n🥬 Cultures maraîchères : Demande locale forte, cycles courts, rotation rapide du capital.\n\n🌳 Systèmes agroforestiers/cultures intercalaires : Combiner arbres + cultures pour diversifier revenus et améliorer résilience climatique.\n\n🌾 Variétés améliorées/hybrides (maïs, riz, sorgho) : Rendement plus élevé si intrants (semences, fertilisants) bien gérés. Accès aux semences certifiées essentiel.",
      tag: "Conseils économiques"
    }
  ],
  transport: [
    // === CAMPAGNES DE SENSIBILISATION OSER ===
    {
      title: 'OSER - Office de Sécurité Routière',
      summary: 'Réduction de 31% des accidents (juin-sept 2024). L\'OSER sensibilise sur la sécurité routière et lutte contre l\'alcool au volant. Partenariat avec Brassivoire pour fournir alcootests et matériel de prévention.',
      tag: '🚦 Sécurité Routière',
      location: 'National',
      image: 'https://oser.ci/sites/default/files/carousel/carousel3_0.jpg',
      source: 'https://oser.ci/',
      phones: [{ label: 'Contact OSER', tel: '+225 27 20 22 35 00' }]
    },
    {
      title: '24ème Semaine Nationale de Sécurité Routière',
      summary: 'Campagne nationale de sensibilisation menée par l\'OSER dans toutes les régions de Côte d\'Ivoire. Actions de terrain, distributions de matériel de sensibilisation et contrôles routiers renforcés pour réduire les accidents.',
      tag: '🚦 Sensibilisation',
      location: 'National - Bouaké',
      image: 'https://oser.ci/sites/default/files/carousel/carousel8.jpg',
      date: 'Campagne annuelle',
      source: 'https://oser.ci/'
    },
    {
      title: 'Semaine Nationale de Sécurité Routière - Ahoué',
      summary: 'Lancement de la 26ème édition de la Semaine Nationale de Sécurité Routière à Ahoué. Sensibilisation des usagers de la route sur les comportements responsables et le respect du code de la route.',
      tag: '🚦 Prévention',
      location: 'Ahoué',
      image: 'https://oser.ci/sites/default/files/carousel/carousel4.jpg',
      date: '14-07-2023',
      source: 'https://oser.ci/'
    },
    
    // === TRANSPORT URBAIN ABIDJAN ===
    {
      title: 'SOTRA - Bus et Bateaux-bus',
      summary: 'Réseau principal de transport public à Abidjan. Lignes de bus desservant toutes les communes et bateaux-bus pour traverser les lagunes. Tarifs abordables.',
      tag: '🚌 Transport Public',
      location: 'Abidjan',
      image: require('../../../assets/sotra.jpg'),
      date: 'Horaires: 05:30-22:00',
      source: 'https://www.sotra.ci/',
      phones: [{ label: 'Informations', tel: '+225 27 21 35 78 00' }]
    },
    {
      title: 'Wôrô-wôrô (Taxi Communal)',
      summary: 'Taxis communaux oranges desservant des lignes spécifiques à travers Abidjan (sauf Plateau). Tarif de base: 200 FCFA pour trajets courts. Alternative populaire et économique.',
      tag: '🚕 Taxi Communal',
      location: 'Abidjan',
      image: 'https://images.unsplash.com/photo-1708347456876-0e94101fcf8b?w=800&q=85',
      commune: 'Toutes communes',
      date: 'Tarif: à partir de 200 FCFA'
    },
    {
      title: 'Gbaka (Minibus)',
      summary: 'Minibus privés assurant le transport commun sur des lignes fixes. Bien organisés et fiables. Prix forfaitaires selon la distance parcourue.',
      tag: '🚐 Minibus',
      location: 'Abidjan',
      commune: 'Toutes communes',
      date: 'Tarif: 200-500 FCFA'
    },
    {
      title: 'Taxi Compteur',
      summary: 'Taxis conventionnels avec compteur. Courses intercommunales: 2.000-4.000 FCFA. Disponibles dans toute la ville. Négociez le prix ou exigez le compteur.',
      tag: '🚕 Taxi',
      location: 'Abidjan',
      date: 'Tarif: 2.000-4.000 FCFA (intercommunal)'
    },
    {
      title: 'VTC - Yango & Autres',
      summary: 'Services de VTC avec réservation par application mobile. Tarifs basés sur la distance et le temps. Paiement sécurisé et traçabilité des courses.',
      tag: '🚗 VTC',
      location: 'Abidjan',
      commune: 'Service disponible partout'
    },
    
    // === TRANSPORT INTERURBAIN ===
    {
      title: 'UTB - Union des Transports de Bouaké',
      summary: 'Compagnie de transport interurbain desservant Bouaké et plusieurs villes de Côte d\'Ivoire depuis Abidjan. Bus confortables et climatisés.',
      tag: '🚍 Interurbain',
      location: 'Gare Routière d\'Adjamé',
      phones: [{ label: 'Réservations', tel: '+225 27 22 37 74 00' }]
    },
    {
      title: 'Ocean CI Transport',
      summary: 'Transport de personnes et marchandises vers l\'est de la Côte d\'Ivoire. Bus VIP climatisés. Desserte régulière des principales villes.',
      tag: '🚍 Interurbain',
      location: 'Gare Routière d\'Adjamé',
      source: 'https://oceancotedivoire.com/',
      phones: [{ label: 'Contact', tel: '+225 07 08 82 00 00' }]
    },
    {
      title: 'Gare Routière d\'Adjamé',
      summary: 'Principale gare routière d\'Abidjan pour départs vers l\'intérieur du pays. Compagnies: UTB, STB, SHT, TSR, JET Express, SBTA. Vérifiez horaires et tarifs sur place.',
      tag: '🚏 Gare Routière',
      location: 'Adjamé',
      commune: 'Adjamé',
      date: 'Départs quotidiens dès 05:00'
    },
    
    // === TRANSPORT AÉRIEN ===
    {
      title: 'Aéroport International FHB',
      summary: 'Aéroport Félix Houphouët-Boigny. 22 compagnies étrangères + Air Côte d\'Ivoire. Vols domestiques et internationaux. Renseignements vols, bagages et accès.',
      tag: '✈️ Aérien',
      location: 'Port-Bouët',
      image: 'https://images.pexels.com/photos/34197095/pexels-photo-34197095.jpeg?auto=compress&cs=tinysrgb&w=800',
      date: 'Ouvert 24h/24',
      source: 'https://www.abidjan-airport.com/',
      phones: [{ label: 'Informations', tel: '+225 27 21 27 52 00' }]
    },
    {
      title: 'Air Côte d\'Ivoire',
      summary: 'Compagnie aérienne nationale. Vols domestiques (Abidjan-Yamoussoukro, Abidjan-Bouaké, Abidjan-Korhogo) et internationaux (Paris, Dakar, Accra, Lagos, etc.).',
      tag: '✈️ Aérien',
      location: 'Aéroport FHB',
      image: 'https://images.unsplash.com/photo-1728715213522-1919ad32060a?w=800&q=85',
      source: 'https://www.aircotedivoire.com/',
      phones: [{ label: 'Réservations', tel: '+225 27 20 25 88 00' }]
    },
    
    // === INFORMATIONS PRATIQUES ===
    {
      title: 'Sécurité Routière - Règles Essentielles',
      summary: 'Respectez le code de la route. Port de la ceinture obligatoire. Vitesse limitée: 50 km/h en ville, 90 km/h hors agglomération, 110 km/h sur autoroute. Interdiction téléphone au volant.',
      tag: '🚦 Prévention',
      location: 'National'
    },
    {
      title: 'Contrôles Techniques Obligatoires',
      summary: 'Tous les véhicules doivent passer le contrôle technique annuel. Centres agréés disponibles dans toutes les grandes villes. Amende en cas de non-conformité.',
      tag: '🔧 Contrôle Technique',
      location: 'National'
    },
    {
      title: 'Numéros d\'Urgence Transport',
      summary: 'En cas d\'accident: Police Secours (111/170), Pompiers (180), SAMU (185). Signalez tout accident même mineur. Gardez vos documents à jour (permis, carte grise, assurance).',
      tag: '🚨 Urgences',
      location: 'National',
      phones: [
        { label: 'Police Secours', tel: '111' },
        { label: 'Police Secours', tel: '170' },
        { label: 'Pompiers', tel: '180' },
        { label: 'SAMU', tel: '185' }
      ]
    }
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
