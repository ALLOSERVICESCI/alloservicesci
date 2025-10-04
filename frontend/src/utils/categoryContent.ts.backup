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
    {
      title: "Ministère d'État, Ministère de l’Agriculture, du Développement Rural et des Productions Vivrières",
      summary: "Pilotage des politiques agricoles, filières, sécurité alimentaire, projets structurants.",
      tag: "Ministère",
      phones: [{ label: "Contact", tel: "2720212460" }],
      source: "https://web.agriculture.gouv.ci"
    },
    {
      title: "ANADER (Agence Nationale d’Appui au Développement Rural)",
      summary: "Conseil agricole, vulgarisation, formation et appui aux producteurs.",
      tag: "ANADER",
      phones: [{ label: "Contact", tel: "2720216700" }],
      source: "https://www.anader.ci"
    },
    {
      title: "Chambre Nationale d’Agriculture de Côte d’Ivoire (CNACI)",
      summary: "Représentation professionnelle, information marché, plaidoyer.",
      tag: "CNACI",
      source: "https://www.chambragri.ci"
    },
    {
      title: "Bourse des Matières Premières Agricoles (BMPA CI)",
      summary: "Cotation de la noix de cajou, du maïs et de la noix de cola. Transparence prix.",
      tag: "BMPA CI",
      source: "https://bmpa.ci"
    },
    {
      title: "Projet d’Appui à la Gouvernance de la Filière Cacao",
      summary: "Traçabilité, conformité aux normes, amélioration revenus des cacaoculteurs.",
      tag: "PAGFIC"
    },
    {
      title: "Pôle Agro-Industriel Nord",
      summary: "Renforcement de la transformation locale et structuration territoriale des filières.",
      tag: "PAI-Nord"
    },
    {
      title: "PROFIT – Promotion de Filières Agricoles Territorialisées",
      summary: "Structuration de TPE agricoles, accompagnement technique et économique.",
      tag: "PROFIT",
      source: "https://www.agrisud.org"
    },
    {
      title: "PROMIRE – Production de Cacao sans déforestation",
      summary: "Pratiques durables, restauration forestière, conformité réglementaire.",
      tag: "PROMIRE",
      source: "https://www.fao.org"
    },
    {
      title: "Conseil du Café-Cacao",
      summary: "Régulation cacao & café, fixation prix bord champ, traçabilité.",
      tag: "Conseil Café-Cacao",
      source: "https://www.conseilcafecacao.ci"
    },
    {
      title: "Autorité de Régulation du Coton et de l’Anacarde (ARECA)",
      summary: "Suivi et régulation des filières coton/anacarde.",
      tag: "ARECA",
      source: "https://areca.ci"
    },
    {
      title: "Fonds Interprofessionnel pour la Recherche et le Conseil Agricoles (FIRCA)",
      summary: "Financement de la recherche appliquée et du conseil agricole.",
      tag: "FIRCA",
      source: "https://www.firca.ci"
    },
    {
      title: "Office National de Développement de la Riziculture",
      summary: "Politique rizicole, appui technique, variétés améliorées.",
      tag: "ONDR",
      source: "https://ondr.ci"
    },
    {
      title: "Centre National de Recherche Agronomique",
      summary: "Variétés améliorées, recherches et appuis scientifiques.",
      tag: "CNRA",
      source: "https://www.cnra.ci"
    },
    {
      title: "Organisation des Nations Unies pour l’alimentation et l’agriculture",
      summary: "Projets d’appui aux filières et à la durabilité.",
      tag: "FAO",
      source: "https://www.fao.org/cote-d-ivoire"
    },
    {
      title: "Banque Africaine de Développement",
      summary: "Financement des pôles agro-industriels et projets structurants.",
      tag: "BAD",
      source: "https://www.afdb.org"
    },
    {
      title: "Institut National de Formation Professionnelle Agricole",
      summary: "Réseau d’écoles agricoles (EFA, ESEMV).",
      tag: "INFPA",
      source: "https://infpa.org"
    },
    {
      title: "Centres de formation rurale ANADER",
      summary: "Formations pratiques (Bingerville, Gagnoa, Grand-Lahou, Kotobi…).",
      tag: "ANADER - CFR",
      source: "https://www.anader.ci"
    },
    {
      title: "Traçabilité parcellaire cacao",
      summary: "Enregistrement parcelles, géolocalisation, registres de pratiques.",
      tag: "Traçabilité cacao"
    },
    {
      title: "Agriculture de conservation des sols",
      summary: "Rotation, couverture permanente, labour réduit.",
      tag: "Agriculture de conservation"
    },
    {
      title: "Maraîchage sous serre/tunnel",
      summary: "Tomate F1, piment, salade – cycles courts, demande forte.",
      tag: "Maraîchage périurbain"
    },
    {
      title: "CAYAT – Coopérative Agricole de Yakassé Attobrou",
      summary: "Cacao durable, formation, certification et services aux producteurs.",
      tag: "Cacao",
      location: "Yakassé-Attobrou (La Mé)",
      phones: [{ label: "Contact", tel: "0708763390/info@cayat-ci.com" }],
      source: "https://cayat-ci.com"
    },
    {
      title: "Antenne/Point d’information CNACI Abidjan",
      summary: "Accompagnement des coopératives et information marché.",
      tag: "CNACI - Abidjan",
      location: "Abidjan",
      source: "https://www.chambragri.ci"
    },
    {
      title: "ESEMV – Élevage et Métiers de la Viande",
      summary: "École de spécialisation en élevage et transformation.",
      tag: "ESEMV Bingerville",
      location: "Bingerville",
      source: "https://infpa.org"
    },
    {
      title: "Centre de Formation Rurale ANADER – Bingerville",
      summary: "Formations pratiques, conseil et mise à niveau.",
      tag: "CFR ANADER Bingerville",
      location: "Bingerville",
      source: "https://www.anader.ci"
    },
    {
      title: "Itinéraires techniques maraîchers urbains",
      summary: "Goutte-à-goutte, hors-sol, cultures à cycle court (tomate, laitue, concombre).",
      tag: "Maraîchage urbain",
      location: "Abidjan, zones périurbaines"
    },
    {
      title: "Pisciculture tilapia/clarias",
      summary: "Polyculture en bassins, cycles 4–6 mois, marché métropole.",
      tag: "Aquaculture",
      location: "Abidjan et alentours"
    },
    {
      title: "UPAS COOP-CA (San-Pedro)",
      summary: "Coopérative cacao : collecte, services, encadrement.",
      tag: "Cacao",
      location: "San-Pedro",
      phones: [{ label: "Contact", tel: "2734704080/coop-upas@gmail.com" }],
      source: "https://www.upas-ci.com"
    },
    {
      title: "COOPARES",
      summary: "Organisation multi-zones apportant appui et commercialisation.",
      tag: "Agricole",
      location: "Korhogo / Abidjan (multi-zones)",
      phones: [{ label: "Contact", tel: "0709237500" }],
      source: "https://coopares.com"
    },
    {
      title: "Bonnes pratiques palmier à huile",
      summary: "Sols profonds, fertilisation équilibrée, gestion eau/drainage, prophylaxie.",
      tag: "Palmier à huile",
      location: "Bas-Sassandra, Nawa, San-Pedro"
    },
    {
      title: "Valorisation locale cacao",
      summary: "Unité fermentation/séchage amélioré, ventes premium.",
      tag: "Cacao transformé",
      location: "Aboisso, Agboville, Divo, San-Pedro"
    },
    {
      title: "Centres ruraux ANADER (Grand-Lahou, Gagnoa-Lakota)",
      summary: "Techniques végétales & élevage (formations courtes).",
      tag: "CFP ruraux",
      location: "Grand-Lahou / Gagnoa-Lakota",
      source: "https://www.anader.ci"
    },
    {
      title: "Appui filière palmier à huile",
      summary: "Ateliers de validation de stratégie (2025).",
      tag: "Stratégie palmier à huile",
      location: "Yamoussoukro / Sud"
    },
    {
      title: "Station CNRA Bouaké",
      summary: "Recherches variétales maïs, riz, maraîchage ; diffusion itinéraires techniques.",
      tag: "CNRA - Station Gbêkê",
      location: "Bouaké",
      source: "https://www.cnra.ci"
    },
    {
      title: "Écoles de formation agricole (Ferentella, etc.)",
      summary: "Formation initiale/continue, stages pratiques.",
      tag: "INFPA / EFA",
      location: "Yamoussoukro / Bouaké",
      source: "https://infpa.org"
    },
    {
      title: "Itinéraire technique riz pluvial",
      summary: "Préparation sol, densité, désherbage, variétés cycle court.",
      tag: "Riz pluvial",
      location: "Vallées et bas-fonds du Centre"
    },
    {
      title: "Maraîchage à forte valeur",
      summary: "Tomate F1, piment, aubergine — cycle ~3 mois, demande urbaine.",
      tag: "Maraîchage sous serre",
      location: "Yamoussoukro & périphéries"
    },
    {
      title: "Réseau coopératives anacarde (ARECA)",
      summary: "Collecte, premier tri, sensibilisation qualité.",
      tag: "Cajou",
      location: "Bouaké, Katiola, Tiébissou",
      source: "https://areca.ci"
    },
    {
      title: "Petites unités riz/cajou",
      summary: "Décorticage, emballage, standardisation.",
      tag: "Valorisation locale",
      location: "Centre"
    },
    {
      title: "CFAR des Savanes (Niofoin)",
      summary: "Formations jeunes (production végétale, élevage, gestion).",
      tag: "CFAR Niofoin",
      location: "Niofoin (Korhogo)",
      phones: [{ label: "Contact", tel: "0759241188" }],
      source: "https://www.fert.fr/centre-de-formation-agricole-et-rurale-de-niofoin/"
    },
    {
      title: "Itinéraire technique céréales pluviales",
      summary: "Semis début des pluies, phosphore, désherbage maîtrisé, rotations.",
      tag: "Céréales pluviales",
      location: "Savanes, Poro, Tchologo, Bagoué"
    },
    {
      title: "Hors saison avec irrigation",
      summary: "Prix élevés, stockage amélioré.",
      tag: "Oignon/Échalote irrigué",
      location: "Korhogo, Ferkessédougou"
    },
    {
      title: "Unions coopératives coton-cajou",
      summary: "Intrants groupés, collecte, premier tri.",
      tag: "Coton & Cajou",
      location: "Korhogo / Boundiali",
      source: "https://areca.ci"
    },
    {
      title: "Pôle agro-industriel Nord",
      summary: "Structuration céréales, cajou, élevage.",
      tag: "PAI-Nord",
      location: "Nord"
    },
    {
      title: "Antenne ANADER Man",
      summary: "Appui cacao/café, vivriers et élevage.",
      tag: "ANADER Man",
      location: "Man (Tonkpi)",
      source: "https://www.anader.ci"
    },
    {
      title: "Itinéraire cacao en zone montagneuse",
      summary: "Ombrage partiel, clones résistants, lutte intégrée, fertilisation.",
      tag: "Cacao montagne",
      location: "Tonkpi / Guémon"
    },
    {
      title: "Café de spécialité montagne",
      summary: "Process humide, tri densimétrique, prime qualité.",
      tag: "Café spécialité",
      location: "Man, Danané"
    },
    {
      title: "Réseaux coopératifs cacao",
      summary: "Certification, traçabilité.",
      tag: "Cacao",
      location: "Guiglo, Duékoué, Man"
    },
    {
      title: "Banane plantain améliorée",
      summary: "Variétés résistantes (FHIA), marché régional dynamique.",
      tag: "Banane plantain",
      location: "Ouest humide"
    },
    {
      title: "Station CNRA Abengourou",
      summary: "Appui techniques pérennes (cacao) et vivriers.",
      tag: "CNRA Abengourou",
      location: "Abengourou",
      source: "https://www.cnra.ci"
    },
    {
      title: "Coopératives cacao Est",
      summary: "Certifications et traçabilité pour l’export.",
      tag: "Cacao",
      location: "Abengourou, Agnibilékro"
    },
    {
      title: "Itinéraire anacarde (cajou)",
      summary: "Taille de formation, entretien, lutte ravageurs, séchage.",
      tag: "Anacarde",
      location: "Bondoukou, Bouna"
    },
    {
      title: "Système cajou + apiculture",
      summary: "Diversification des revenus, pollinisation améliorée.",
      tag: "Anacarde + miel",
      location: "Gontougo/Bounkani"
    },
    {
      title: "Antenne ANADER Daloa",
      summary: "Conseil technique cacao/café & diversification.",
      tag: "ANADER Daloa",
      location: "Daloa",
      source: "https://www.anader.ci"
    },
    {
      title: "Renouvellement vergers cacao",
      summary: "Replantation, haies vives, lutte érosion, géolocalisation parcelles.",
      tag: "Cacao durable",
      location: "Daloa, Gagnoa"
    },
    {
      title: "Exploitation hévéa productive",
      summary: "Clones haut rendement, saignée optimisée, contrats.",
      tag: "Hévéa",
      location: "Gagnoa, Lakota"
    },
    {
      title: "Coopératives café-cacao Centre-Ouest",
      summary: "Certifications UTZ/RA, primes durabilité.",
      tag: "Café-Cacao",
      location: "Daloa, Issia, Gagnoa"
    },
    {
      title: "Itinéraire technique maïs",
      summary: "Semis en lignes, densité, NPK/urée, désherbage post-levée.",
      tag: "Maïs hybride",
      location: "Katiola, Dabakala"
    },
    {
      title: "Système intercalaire niébé/maïs",
      summary: "Sécurité alimentaire + revenus (grain).",
      tag: "Niébé + Maïs",
      location: "Katiola"
    },
    {
      title: "Groupements céréaliers",
      summary: "Stockage communautaire, warrantage.",
      tag: "Céréales",
      location: "Dabakala, Katiola"
    },
    {
      title: "Antenne ANADER Odienné",
      summary: "Appui élevage, riz, maraîchage irrigué.",
      tag: "ANADER Odienné",
      location: "Odienné",
      source: "https://www.anader.ci"
    },
    {
      title: "Mangue Kent/Keitt export",
      summary: "Traitement post-récolte, chaîne export, prime qualité.",
      tag: "Mangue export",
      location: "Odienné, Séguéla"
    },
    {
      title: "Irrigation maraîchère gravitaire",
      summary: "Petits périmètres, maîtrise de l’eau en saison sèche.",
      tag: "Irrigation gravitaire",
      location: "Worodougou"
    },
    {
      title: "Appui organisations paysannes",
      summary: "Financements locaux et renforcement (2025).",
      tag: "OSC appui",
      location: "Guémon/Cavally"
    },
    {
      title: "Ananas Cayenne lisse / MD2",
      summary: "Export & transformation jus (Aboisso/Adiaké).",
      tag: "Ananas",
      location: "Aboisso, Adiaké"
    },
    {
      title: "Cultures hors-sol cocopeat",
      summary: "Légumes-feuilles, rendements élevés près d’Abidjan.",
      tag: "Hors-sol (cocopeat)",
      location: "Grand-Bassam / Alépé"
    },
    {
      title: "Cacao premium certifié",
      summary: "Fermentation contrôlée, séchage solaire, certification.",
      tag: "Cacao premium",
      location: "Soubré, San-Pedro"
    },
    {
      title: "Agroforesterie cacaoyère",
      summary: "Arbres d’ombrage légumineux + cacao pour résilience.",
      tag: "Agroforesterie cacao",
      location: "Soubré"
    },
    {
      title: "Coopératives palmier",
      summary: "Régimes -> huilerie, logistique.",
      tag: "Palmier à huile",
      location: "Sassandra, Tabou"
    },
    {
      title: "Polyculture tilapia + clarias",
      summary: "Granulés locaux, marchés urbains (Anyama/Alépé).",
      tag: "Pisciculture mixte",
      location: "Alépé, Anyama"
    },
    {
      title: "Irrigation goutte-à-goutte",
      summary: "Fertigation maraîchère saison sèche.",
      tag: "Goutte-à-goutte",
      location: "Songon, Dabou"
    },
    {
      title: "Tech cacao - lutte intégrée",
      summary: "Traitements ciblés contre mirides, taille sanitaire, pièges, correction carences.",
      tag: "Bonnes pratiques"
    },
    {
      title: "Tech riz irrigué",
      summary: "Nivellement, maîtrise eau, repiquage, fertilisation azotée fractionnée.",
      tag: "Bonnes pratiques"
    },
    {
      title: "Tech maïs hybride",
      summary: "Densité 55–70k plants/ha, NPK + urée, désherbage 2 passages.",
      tag: "Bonnes pratiques"
    },
    {
      title: "Tech manioc amélioré",
      summary: "Boutures saines, écartement 1x1 m, variétés TMS résistantes, paillage.",
      tag: "Bonnes pratiques"
    },
    {
      title: "Tech igname buttage",
      summary: "Billons hauts, semence saine, rotations pour limiter nématodes.",
      tag: "Bonnes pratiques"
    },
    {
      title: "Tech tomate sous abri",
      summary: "Variétés F1 tolérantes, prophylaxie, biocontrôle, pollinisation assistée.",
      tag: "Bonnes pratiques"
    },
    {
      title: "Tech banane plantain",
      summary: "Pieds sains, désherbage manuel, tuteurs, apport organique régulier.",
      tag: "Bonnes pratiques"
    },
    {
      title: "Tech oignon hors-saison",
      summary: "Pépinière, repiquage, irrigation régulière, séchage post-récolte.",
      tag: "Bonnes pratiques"
    },
    {
      title: "Tech arachide",
      summary: "Semis en lignes, inoculation rhizobium, désherbage précoce, séchage gousses.",
      tag: "Bonnes pratiques"
    },
    {
      title: "Tech niébé",
      summary: "Variétés résistantes bruches, stockage hermétique (PICS).",
      tag: "Bonnes pratiques"
    },
    {
      title: "Maraîchage sous serre",
      summary: "Forte demande urbaine, cycles courts, prix premium en saison sèche.",
      tag: "Maraîchage sous serre",
      location: "Abidjan"
    },
    {
      title: "Cacao premium & transformation",
      summary: "Bonus qualité via fermentation contrôlée, séchage, certification.",
      tag: "Cacao premium & transformation",
      location: "Sud"
    },
    {
      title: "Riz de bas-fonds amélioré",
      summary: "Variétés à cycle court, mécanisation légère, débouchés régionaux.",
      tag: "Riz de bas-fonds amélioré",
      location: "Centre"
    },
    {
      title: "Oignon/échalote irrigué",
      summary: "Bonne marge hors-saison, conservation et stockage structuré.",
      tag: "Oignon/échalote irrigué",
      location: "Nord"
    },
    {
      title: "Café spécialité",
      summary: "Valorisation par process humide et tri densimétrique.",
      tag: "Café spécialité",
      location: "Ouest"
    },
    {
      title: "Anacarde + apiculture",
      summary: "Revenus diversifiés, pollinisation améliorée.",
      tag: "Anacarde + apiculture",
      location: "Est"
    },
    {
      title: "Hévéa",
      summary: "Contrats de rachat, clones productifs, demande stable.",
      tag: "Hévéa",
      location: "Centre-Ouest"
    },
    {
      title: "Mangue export",
      summary: "Chaîne d’export structurée, prime qualité.",
      tag: "Mangue export",
      location: "Nord-Ouest"
    },
    {
      title: "EFA Ferentella (Touba)",
      summary: "Formation agricole initiale et continue.",
      tag: "CFP/EFA",
      location: "Touba",
      source: "https://infpa.org"
    },
    {
      title: "CFP Agricole Korhogo",
      summary: "Techniques végétales, élevage, maraîchage irrigué.",
      tag: "CFP/EFA",
      location: "Korhogo"
    },
    {
      title: "Centre Rural Man",
      summary: "Formations cacao/café, diversification.",
      tag: "CFP/EFA",
      location: "Man"
    },
    {
      title: "CFP Abengourou",
      summary: "Techniques pérennes et vivriers.",
      tag: "CFP/EFA",
      location: "Abengourou"
    },
    {
      title: "Centre Rural Grand-Lahou",
      summary: "Pêche, aquaculture & vivriers côtiers.",
      tag: "CFP/EFA",
      location: "Grand-Lahou"
    },
    {
      title: "Union Coopérative Cacao Daloa",
      summary: "Collecte, formation, certification.",
      tag: "Agricole",
      location: "Daloa"
    },
    {
      title: "SCOOPS Café de Man",
      summary: "Qualité spécialité, process humide.",
      tag: "Agricole",
      location: "Man"
    },
    {
      title: "Coopérative Cacao Abengourou",
      summary: "Traçabilité, conformité EUDR.",
      tag: "Agricole",
      location: "Abengourou"
    },
    {
      title: "Union Céréalière Korhogo",
      summary: "Stockage, warrantage, intrants groupés.",
      tag: "Agricole",
      location: "Korhogo"
    },
    {
      title: "Coop Palmier Sassandra",
      summary: "Régimes -> huilerie, logistique.",
      tag: "Agricole",
      location: "Sassandra"
    },
    {
      title: "Coop Ananas Aboisso",
      summary: "Production export & jus.",
      tag: "Agricole",
      location: "Aboisso"
    },
    {
      title: "FIRCA appels à projets",
      summary: "Financement recherche & conseil agricoles.",
      tag: "Information/Financement",
      source: "https://www.firca.ci"
    },
    {
      title: "BMPA CI - Infos marchés",
      summary: "Cotation cajou, maïs, cola (transparence prix).",
      tag: "Information/Financement",
      source: "https://bmpa.ci"
    },
    {
      title: "ONDR - Appui rizicole",
      summary: "Conseil, variétés améliorées, périmètres irrigués.",
      tag: "Information/Financement",
      source: "https://ondr.ci"
    },
    {
      title: "Conseil Café-Cacao - Prix",
      summary: "Prix bord champ & notices techniques.",
      tag: "Information/Financement",
      source: "https://www.conseilcafecacao.ci"
    },
    {
      title: "Compostage urbain",
      summary: "Valorisation déchets organiques en compost pour maraîchage.",
      tag: "Pratique/Climat",
      location: "Abidjan"
    },
    {
      title: "Paillage cacao",
      summary: "Réduction évaporation et contrôle adventices.",
      tag: "Pratique/Climat",
      location: "Sud"
    },
    {
      title: "Rotations maïs/niébé",
      summary: "Améliore fertilité, casse cycles ravageurs.",
      tag: "Pratique/Climat",
      location: "Centre"
    },
    {
      title: "Micro-aspersion",
      summary: "Efficiente pour oignon/tomate en saison sèche.",
      tag: "Pratique/Climat",
      location: "Nord"
    },
    {
      title: "Brise-vent agroforestier",
      summary: "Réduit dégâts vent/pluie en montagne.",
      tag: "Pratique/Climat",
      location: "Ouest"
    },
    {
      title: "Séchage cajou",
      summary: "Sur claies, hygrométrie maîtrisée, qualité export.",
      tag: "Pratique/Climat",
      location: "Est"
    },
    {
      title: "Analyse de sol & plan de fumure",
      summary: "Bonnes pratiques adaptées à la zone Abidjan.",
      tag: "Sol/Fertilité",
      location: "Abidjan"
    },
    {
      title: "Biocontrôle et seuils d’intervention",
      summary: "Bonnes pratiques adaptées à la zone Abidjan.",
      tag: "Protection intégrée",
      location: "Abidjan"
    },
    {
      title: "Poulets améliorés, cycles 8-10 semaines",
      summary: "Bonnes pratiques adaptées à la zone Abidjan.",
      tag: "Volaille villageoise",
      location: "Abidjan"
    },
    {
      title: "Alimentation locale, marché urbain",
      summary: "Bonnes pratiques adaptées à la zone Abidjan.",
      tag: "Porcs fermiers",
      location: "Abidjan"
    },
    {
      title: "Analyse de sol & plan de fumure",
      summary: "Bonnes pratiques adaptées à la zone Sud.",
      tag: "Sol/Fertilité",
      location: "Sud"
    },
    {
      title: "Biocontrôle et seuils d’intervention",
      summary: "Bonnes pratiques adaptées à la zone Sud.",
      tag: "Protection intégrée",
      location: "Sud"
    },
    {
      title: "Poulets améliorés, cycles 8-10 semaines",
      summary: "Bonnes pratiques adaptées à la zone Sud.",
      tag: "Volaille villageoise",
      location: "Sud"
    },
    {
      title: "Alimentation locale, marché urbain",
      summary: "Bonnes pratiques adaptées à la zone Sud.",
      tag: "Porcs fermiers",
      location: "Sud"
    },
    {
      title: "Analyse de sol & plan de fumure",
      summary: "Bonnes pratiques adaptées à la zone Centre.",
      tag: "Sol/Fertilité",
      location: "Centre"
    },
    {
      title: "Biocontrôle et seuils d’intervention",
      summary: "Bonnes pratiques adaptées à la zone Centre.",
      tag: "Protection intégrée",
      location: "Centre"
    },
    {
      title: "Poulets améliorés, cycles 8-10 semaines",
      summary: "Bonnes pratiques adaptées à la zone Centre.",
      tag: "Volaille villageoise",
      location: "Centre"
    },
    {
      title: "Alimentation locale, marché urbain",
      summary: "Bonnes pratiques adaptées à la zone Centre.",
      tag: "Porcs fermiers",
      location: "Centre"
    },
    {
      title: "Analyse de sol & plan de fumure",
      summary: "Bonnes pratiques adaptées à la zone Nord.",
      tag: "Sol/Fertilité",
      location: "Nord"
    },
    {
      title: "Biocontrôle et seuils d’intervention",
      summary: "Bonnes pratiques adaptées à la zone Nord.",
      tag: "Protection intégrée",
      location: "Nord"
    },
    {
      title: "Poulets améliorés, cycles 8-10 semaines",
      summary: "Bonnes pratiques adaptées à la zone Nord.",
      tag: "Volaille villageoise",
      location: "Nord"
    },
    {
      title: "Alimentation locale, marché urbain",
      summary: "Bonnes pratiques adaptées à la zone Nord.",
      tag: "Porcs fermiers",
      location: "Nord"
    },
    {
      title: "Analyse de sol & plan de fumure",
      summary: "Bonnes pratiques adaptées à la zone Ouest.",
      tag: "Sol/Fertilité",
      location: "Ouest"
    },
    {
      title: "Biocontrôle et seuils d’intervention",
      summary: "Bonnes pratiques adaptées à la zone Ouest.",
      tag: "Protection intégrée",
      location: "Ouest"
    },
    {
      title: "Poulets améliorés, cycles 8-10 semaines",
      summary: "Bonnes pratiques adaptées à la zone Ouest.",
      tag: "Volaille villageoise",
      location: "Ouest"
    },
    {
      title: "Alimentation locale, marché urbain",
      summary: "Bonnes pratiques adaptées à la zone Ouest.",
      tag: "Porcs fermiers",
      location: "Ouest"
    },
    {
      title: "Analyse de sol & plan de fumure",
      summary: "Bonnes pratiques adaptées à la zone Est.",
      tag: "Sol/Fertilité",
      location: "Est"
    },
    {
      title: "Biocontrôle et seuils d’intervention",
      summary: "Bonnes pratiques adaptées à la zone Est.",
      tag: "Protection intégrée",
      location: "Est"
    },
    {
      title: "Poulets améliorés, cycles 8-10 semaines",
      summary: "Bonnes pratiques adaptées à la zone Est.",
      tag: "Volaille villageoise",
      location: "Est"
    },
    {
      title: "Alimentation locale, marché urbain",
      summary: "Bonnes pratiques adaptées à la zone Est.",
      tag: "Porcs fermiers",
      location: "Est"
    },
    {
      title: "Analyse de sol & plan de fumure",
      summary: "Bonnes pratiques adaptées à la zone Centre-Ouest.",
      tag: "Sol/Fertilité",
      location: "Centre-Ouest"
    },
    {
      title: "Biocontrôle et seuils d’intervention",
      summary: "Bonnes pratiques adaptées à la zone Centre-Ouest.",
      tag: "Protection intégrée",
      location: "Centre-Ouest"
    },
    {
      title: "Poulets améliorés, cycles 8-10 semaines",
      summary: "Bonnes pratiques adaptées à la zone Centre-Ouest.",
      tag: "Volaille villageoise",
      location: "Centre-Ouest"
    },
    {
      title: "Alimentation locale, marché urbain",
      summary: "Bonnes pratiques adaptées à la zone Centre-Ouest.",
      tag: "Porcs fermiers",
      location: "Centre-Ouest"
    },
    {
      title: "Analyse de sol & plan de fumure",
      summary: "Bonnes pratiques adaptées à la zone Centre-Nord.",
      tag: "Sol/Fertilité",
      location: "Centre-Nord"
    },
    {
      title: "Biocontrôle et seuils d’intervention",
      summary: "Bonnes pratiques adaptées à la zone Centre-Nord.",
      tag: "Protection intégrée",
      location: "Centre-Nord"
    },
    {
      title: "Poulets améliorés, cycles 8-10 semaines",
      summary: "Bonnes pratiques adaptées à la zone Centre-Nord.",
      tag: "Volaille villageoise",
      location: "Centre-Nord"
    },
    {
      title: "Alimentation locale, marché urbain",
      summary: "Bonnes pratiques adaptées à la zone Centre-Nord.",
      tag: "Porcs fermiers",
      location: "Centre-Nord"
    },
    {
      title: "Analyse de sol & plan de fumure",
      summary: "Bonnes pratiques adaptées à la zone Nord-Ouest.",
      tag: "Sol/Fertilité",
      location: "Nord-Ouest"
    },
    {
      title: "Biocontrôle et seuils d’intervention",
      summary: "Bonnes pratiques adaptées à la zone Nord-Ouest.",
      tag: "Protection intégrée",
      location: "Nord-Ouest"
    },
    {
      title: "Poulets améliorés, cycles 8-10 semaines",
      summary: "Bonnes pratiques adaptées à la zone Nord-Ouest.",
      tag: "Volaille villageoise",
      location: "Nord-Ouest"
    },
    {
      title: "Alimentation locale, marché urbain",
      summary: "Bonnes pratiques adaptées à la zone Nord-Ouest.",
      tag: "Porcs fermiers",
      location: "Nord-Ouest"
    },
    {
      title: "Analyse de sol & plan de fumure",
      summary: "Bonnes pratiques adaptées à la zone Sud-Est.",
      tag: "Sol/Fertilité",
      location: "Sud-Est"
    },
    {
      title: "Biocontrôle et seuils d’intervention",
      summary: "Bonnes pratiques adaptées à la zone Sud-Est.",
      tag: "Protection intégrée",
      location: "Sud-Est"
    },
    {
      title: "Poulets améliorés, cycles 8-10 semaines",
      summary: "Bonnes pratiques adaptées à la zone Sud-Est.",
      tag: "Volaille villageoise",
      location: "Sud-Est"
    },
    {
      title: "Alimentation locale, marché urbain",
      summary: "Bonnes pratiques adaptées à la zone Sud-Est.",
      tag: "Porcs fermiers",
      location: "Sud-Est"
    },
    {
      title: "Analyse de sol & plan de fumure",
      summary: "Bonnes pratiques adaptées à la zone Sud-Ouest.",
      tag: "Sol/Fertilité",
      location: "Sud-Ouest"
    },
    {
      title: "Biocontrôle et seuils d’intervention",
      summary: "Bonnes pratiques adaptées à la zone Sud-Ouest.",
      tag: "Protection intégrée",
      location: "Sud-Ouest"
    },
    {
      title: "Poulets améliorés, cycles 8-10 semaines",
      summary: "Bonnes pratiques adaptées à la zone Sud-Ouest.",
      tag: "Volaille villageoise",
      location: "Sud-Ouest"
    },
    {
      title: "Alimentation locale, marché urbain",
      summary: "Bonnes pratiques adaptées à la zone Sud-Ouest.",
      tag: "Porcs fermiers",
      location: "Sud-Ouest"
    },
    {
      title: "Analyse de sol & plan de fumure",
      summary: "Bonnes pratiques adaptées à la zone Lagunes.",
      tag: "Sol/Fertilité",
      location: "Lagunes"
    },
    {
      title: "Biocontrôle et seuils d’intervention",
      summary: "Bonnes pratiques adaptées à la zone Lagunes.",
      tag: "Protection intégrée",
      location: "Lagunes"
    },
    {
      title: "Poulets améliorés, cycles 8-10 semaines",
      summary: "Bonnes pratiques adaptées à la zone Lagunes.",
      tag: "Volaille villageoise",
      location: "Lagunes"
    },
    {
      title: "Alimentation locale, marché urbain",
      summary: "Bonnes pratiques adaptées à la zone Lagunes.",
      tag: "Porcs fermiers",
      location: "Lagunes"
    }
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