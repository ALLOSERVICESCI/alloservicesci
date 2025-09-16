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
    {
      title: 'Service de dépannage',
      summary: 'Électricité, eau et télécoms',
      tag: 'Dépannage',
      phones: [
        { label: 'CIE (électricité)', tel: '179' },
        { label: 'SODECI (eau)', tel: '175' },
        { label: 'Côte d\'Ivoire Télécom', tel: '190' },
        { label: 'Côte d\'Ivoire Télécom (ligne 2)', tel: '120' },
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
      title: 'e-Impôts Côte d’Ivoire',
      summary: 'Déclarations et paiements en ligne pour particuliers et entreprises.',
      tag: 'Fiscalité',
      date: 'Service en ligne 24h/24',
      source: 'https://www.e-impots.gouv.ci/'
    },
    {
      title: 'ONECI — Carte nationale d’identité',
      summary: 'Renouvellement et informations sur les centres d’enrôlement.',
      tag: 'Identité',
      location: 'Centres ONECI (Plateau, Abobo, etc.)',
      date: 'Horaires: Lun–Ven 08:00–16:00',
      source: 'https://www.oneci.ci/'
    },
    {
      title: 'État civil — Extrait de naissance',
      summary: 'Procédures pour l’obtention ou la régularisation des actes.',
      tag: 'État civil',
      date: 'Horaires: selon mairie/centre'
    },
  ],
  services_utiles: [
    {
      title: 'CIE — Signaler une panne',
      summary: 'Coupure d’électricité, problème de réseau: service client et signalement en ligne.',
      tag: 'Électricité',
      date: 'Horaires: 24h/24 (en ligne)',
      source: 'https://www.cie.ci/'
    },
    {
      title: 'SODECI — Déclarer une fuite',
      summary: 'Coupure d’eau, fuite sur la voie publique: assistance clients et signalement.',
      tag: 'Eau',
      date: 'Horaires: 24h/24 (en ligne)',
      source: 'https://www.sodeci.ci/'
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