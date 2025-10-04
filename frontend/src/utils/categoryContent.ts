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
    // === Filieres strategiques & Innovations ===
    {
      title: 'Cacao - 1er producteur mondial',
      summary: 'Production: 2,2 millions de tonnes (2023-2024). Prix bord champ: 1500 FCFA/kg. Transformation locale en hausse avec 35% du cacao transforme sur place.',
      tag: 'Filiere strategique',
      source: 'https://www.conseilcafecacao.ci/'
    },
    {
      title: 'Cafe - Relance de la filiere',
      summary: 'Production: 120 000 tonnes (robusta + arabusta). Prix: 750 FCFA/kg. Objectif 2025: doublement de la production avec nouvelles plantations.',
      tag: 'Filiere strategique',
      source: 'https://www.conseilcafecacao.ci/'
    },
    {
      title: 'Huile de palme - Autosuffisance visee',
      summary: '3e producteur africain. 450 000 tonnes/an. Projet de 50 000 ha de nouvelles plantations pour reduire les importations.',
      tag: 'Filiere strategique'
    },
    {
      title: 'Anacarde - 1er exportateur mondial',
      summary: '1 million de tonnes. Prix minimum: 400 FCFA/kg. Transformation locale passee de 10% a 22% grace aux unites de transformation.',
      tag: 'Filiere strategique'
    },
    {
      title: 'Cultures vivrieres - Securite alimentaire',
      summary: 'Riz (1,5M tonnes), manioc (7M tonnes), plantain (4M tonnes), igname (6,5M tonnes). Objectif: autosuffisance en riz d\'ici 2030.',
      tag: 'Filiere strategique'
    },
    {
      title: 'Innovations technologiques - Drones & IA',
      summary: 'Utilisation de drones pour cartographie et epandage. Plateforme e-agriculture pour conseil technique. Application mobile pour suivi des prix.',
      tag: 'Innovation'
    },
    {
      title: 'Transformation locale - Valeur ajoutee',
      summary: 'Objectif 50% de transformation locale du cacao d\'ici 2025. Construction de 15 nouvelles usines de transformation (cacao, anacarde, cafe).',
      tag: 'Innovation'
    },

    // === Projets & Politiques en cours ===
    {
      title: 'PAGFIC - Projet Agriculture Gouvernance Filiere Cacao',
      summary: 'Budget: 200 milliards FCFA. 280 000 producteurs beneficiaires. Rehabilitation de 180 000 ha. Formation et equipements modernes.',
      tag: 'Projet majeur',
      date: '2021-2026'
    },
    {
      title: 'PAI-Nord - Projet Agriculture Intensive Nord',
      summary: 'Developpement agricole dans 5 regions du nord. Cultures de rente et vivrieres. Amenagement hydro-agricole. Accompagnement de 50 000 exploitants.',
      tag: 'Projet majeur',
      date: '2020-2025'
    },
    {
      title: 'PROFIT - Projet Filiere Oleagineux Transformation',
      summary: 'Modernisation filieres palmier huile, cocotier, soja. 30 000 ha amenages. Soutien a 100 cooperatives. Financement BM: 150 millions USD.',
      tag: 'Projet majeur',
      date: '2022-2027'
    },
    {
      title: 'PROMIRE - Projet Modernisation Irrigation Riz',
      summary: 'Extension surfaces rizicoles de 15 000 ha. Modernisation infrastructures irrigation. Formation 25 000 riziculteurs. Objectif: production +200 000 tonnes.',
      tag: 'Projet majeur',
      date: '2023-2028'
    },
    {
      title: 'Partenariat FIRCA - Innovation & Recherche',
      summary: 'Fonds Interprofessionnel Recherche Conseil Agricole. Budget annuel: 25 milliards FCFA. Financement recherche, conseil, formation, equipements.',
      tag: 'Partenariat',
      source: 'https://www.firca.ci/'
    },

    // === Marches & Mecanismes de regulation ===
    {
      title: 'BMPA CI - Bourse Matieres Premieres Agricoles',
      summary: 'Plateforme officielle negociation cacao, cafe, anacarde. Prix transparents et securises. Transactions tracees. Volume: 500 000 tonnes/an.',
      tag: 'Marche',
      source: 'https://www.bcc.ci/'
    },
    {
      title: 'Tracabilite cacao - Systeme obligatoire',
      summary: 'Depuis 2020: tracabilite integrale du cacao (GPS, QR codes). Lutte contre deforestation. Certification UTZ, Rainforest Alliance, Bio.',
      tag: 'Regulation'
    },
    {
      title: 'SARA - Salon Agriculture Ressources Animales',
      summary: 'Plus grand salon agricole Afrique de l\'Ouest. Biennale a Abidjan. 500+ exposants, 100 000 visiteurs. Prochaine edition: novembre 2025.',
      tag: 'Evenement',
      date: 'Novembre 2025',
      location: 'Abidjan'
    },
    {
      title: 'Prix planchers garantis - Protection producteurs',
      summary: 'Cacao: 1000 FCFA/kg, Cafe: 750 FCFA/kg, Anacarde: 400 FCFA/kg. Revision annuelle selon cours mondiaux. Stabilisation revenus agricoles.',
      tag: 'Regulation'
    },

    // === Defis & Enjeux ===
    {
      title: 'Defi environnemental - Lutte deforestation',
      summary: 'Objectif zero deforestation 2025. Reforestation 20 millions arbres. Agroforesterie: integration arbres forestiers dans plantations.',
      tag: 'Defi climat'
    },
    {
      title: 'Changement climatique - Adaptation necessaire',
      summary: 'Secheresses recurrentes. Varietes resistantes. Irrigation goutte-a-goutte. Systemes alerte precoce meteorologique.',
      tag: 'Defi climat'
    },
    {
      title: 'Financement agricole - Acces au credit',
      summary: 'Taux interet eleve (8-12%). Garanties difficiles. Solutions: credit warrantage, financement islamique, mobile money agricole.',
      tag: 'Defi financement'
    },
    {
      title: 'Attractivite jeunes - Modernisation image',
      summary: 'Programme Agripreneur: 10 000 jeunes formes. Mecanisation agricole. Numerisation. Agriculture intelligente pour attirer nouvelle generation.',
      tag: 'Defi attractivite'
    },

    // === Actualites & Evenements 2024-2025 ===
    {
      title: 'Record production cacao 2023-2024',
      summary: 'Cote d\'Ivoire depasse 2,2 millions tonnes. Meilleure campagne histoire. Hausse revenus producteurs de 30%.',
      tag: 'Actualite 2024',
      date: 'Octobre 2024'
    },
    {
      title: 'Lancement plateforme e-commerce agricole',
      summary: 'CI-Agri Market: vente directe producteurs-acheteurs. Suppression intermediaires. Paiement mobile. 5000 producteurs inscrits en 3 mois.',
      tag: 'Actualite 2024',
      date: 'Septembre 2024'
    },
    {
      title: 'Partenariat Chine - Equipements agricoles',
      summary: 'Don de 500 tracteurs et equipements. Formation 1000 mecaniciens agricoles. Montant: 50 millions USD.',
      tag: 'Actualite 2024',
      date: 'Novembre 2024'
    },
    {
      title: 'Prix Nobel agriculture durable',
      summary: 'Cooperative ECOOKIM primee pour pratiques durables cacao. 1er prix africain. Modele replication nationale.',
      tag: 'Actualite 2024',
      date: 'Decembre 2024'
    },
    {
      title: 'Sommet agriculture intelligente Abidjan 2025',
      summary: 'Forum international AgTech Africa. 40 pays, 200 exposants. Thematique: digitalisation agriculture africaine.',
      tag: 'Evenement 2025',
      date: 'Mars 2025',
      location: 'Abidjan'
    },

    // === Services & Appels a action ===
    {
      title: 'ANADER - Conseil technique gratuit',
      summary: 'Accompagnement personnalise exploitants agricoles. Formation pratique. Distribution intrants subventionnes. 126 antennes nationales.',
      tag: 'Service public',
      phones: [
        { label: 'Siege Abidjan', tel: '2720252030' }
      ],
      source: 'https://www.anader.ci/'
    },
    {
      title: 'Coopecaci - Cooperative cacao modele',
      summary: 'Adhesion ouverte. Formation gratuite. Acces credit collectif. Prix premium qualite. Equipements mutualises.',
      tag: 'Cooperative',
      location: 'Daloa',
      phones: [
        { label: 'Contact', tel: '2733220145' }
      ]
    },
    {
      title: 'Fonds garantie credit agricole',
      summary: 'Garantie 75% prets agricoles. Taux preferentiel 5-7%. Montant max: 50 millions FCFA. Delai remboursement: 5 ans.',
      tag: 'Financement',
      phones: [
        { label: 'Info credit', tel: '2720333444' }
      ]
    },
    {
      title: 'Plateforme fourniture intrants',
      summary: 'Engrais subventionnes -30%. Semences certifiees. Phytosanitaires homologues. Commande en ligne. Livraison cooperative.',
      tag: 'Intrants',
      source: 'https://intrants.agriculture.gouv.ci/'
    },
    {
      title: 'Formation certifiante agriculture biologique',
      summary: 'Programme 6 mois. Pratiques agroecologiques. Certification organique. Acces marches export. Cout: 150 000 FCFA (aide possible).',
      tag: 'Formation',
      location: 'Yamoussoukro, Korhogo, San-Pedro',
      phones: [
        { label: 'Inscriptions', tel: '2730445566' }
      ]
    },
    {
      title: 'Meteo agricole - Alertes SMS',
      summary: 'Previsions 7 jours par zone. Alertes pluies, secheresse. Conseils semis/recolte selon meteo. Service gratuit par SMS.',
      tag: 'Service digital',
      phones: [
        { label: 'Inscription', tel: '*144*2#' }
      ]
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