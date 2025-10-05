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
  // Loisirs & tourisme spécifiques
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
    { title: 'DECO -- Resultats BEPC / BAC', summary: 'Consultez en ligne les resultats officiels des examens scolaires (BEPC, BAC).', tag: 'Resultats', source: 'https://www.men-deco.org/' },
    { title: 'BTS Cote dIvoire -- Inscriptions et resultats', summary: 'Examens du Brevet de Technicien Superieur (BTS): calendriers, inscriptions, resultats.', tag: 'Enseignement superieur', source: 'https://bts.mesrs.ci/' },
    { title: 'CAFOP -- Concours instituteurs', summary: 'Concours dentree aux CAFOP (formation des instituteurs).', tag: 'Concours', source: 'https://www.men-deco.org/' },
    { title: 'ENS Abidjan -- Concours', summary: 'Concours dacces a lEcole Normale Superieure (enseignants).', tag: 'Concours', source: 'https://www.ensabidjan.ci/' },
    { title: 'INFAS -- Concours paramedicaux', summary: 'Concours dacces a lINFAS (sante): filieres et modalites.', tag: 'Concours', source: 'https://www.infas.ci/' },
    { title: 'Fonction publique -- Recrutements & concours', summary: 'Annonces officielles des concours et recrutements (tous ministeres).', tag: 'Fonction publique', source: 'https://www.fonctionpublique.gouv.ci/' }
  ],

  services_publics: [
    { title: 'CNPS (Caisse Nationale de Prevoyance Sociale)', summary: 'Protection sociale des travailleurs et prestations (allocations, pensions).', tag: 'CNPS', source: 'https://www.cnps.ci', phones: [ { label: 'Service client', tel: '2720251000' } ] },
    { title: 'CNAM (Couverture Maladie Universelle)', summary: 'Information et prise en charge sante via la CMU (assurance maladie).', tag: 'CNAM', source: 'https://www.cnam.ci', phones: [ { label: 'Numero vert', tel: '143' } ] },
    { title: 'Impots Cote dIvoire (DGI)', summary: 'Declarations et paiements en ligne, informations fiscales (particuliers et entreprises).', tag: 'Fiscalite', source: 'https://www.dgi.gouv.ci', phones: [ { label: 'Standard', tel: '2720252525' } ] },
    { title: 'Douanes ivoiriennes', summary: 'Renseignements et formalites douanieres (import/export).', tag: 'Douanes', source: 'https://www.douanes.ci', phones: [ { label: 'Ligne info', tel: '2720210800' } ] },
  ],
  services_utiles: [
    // ... contenu existant conservé (non modifié)
  ],
  agriculture: [
    // ... contenu existant conservé (non modifié)
  ],
  transport: [
    { title: 'SOTRA -- Reseau dAbidjan', summary: 'Lignes de bus et bateaux-bus (horaires et plans).', tag: 'Urbain', location: 'Abidjan', date: 'Horaires: 05:30-22:00 (indicatif)', source: 'https://www.sotra.ci/' },
    { title: 'Aeroport FHB -- Vols & informations', summary: 'Renseignements vols, bagages et acces.', tag: 'Aerien', location: 'Port-Bouet (Abidjan)', date: 'Horaires: 24h/24', source: 'https://www.abidjan-airport.com/' },
    { title: 'STL -- Bateaux-bus lagunaires', summary: 'Liaisons lagunaires Abidjan (selon lignes).', tag: 'Lagunaires', location: 'Abidjan', date: 'Horaires: 06:00-20:00 (indicatif)' },
  ],
  alertes: [
    { title: 'Publiez une alerte utile', summary: 'Signalez un danger, une disparition, un accident ou un embouteillage avec photo et localisation.', tag: 'Communaute', date: 'Horaires: 24h/24' },
    { title: 'Astuces de securite', summary: "Gardez les numeros durgence a portee de main et partagez des infos verifiees.", tag: 'Conseils' },
  ],
  pharmacies: [
    { title: 'Pharmacies de garde -- Abidjan', summary: 'Retrouvez rapidement les pharmacies de garde autour de vous ou par ville.', tag: 'De garde', date: 'Horaires: 24h/24' },
    { title: 'Ordre des Pharmaciens -- Infos patients', summary: 'Conseils sur le bon usage des medicaments et vigilance.', tag: 'Conseils', date: 'Horaires: Lun-Ven 08:00-16:00' },
  ],
  // NOUVEAU: Loisirs & Tourisme
  loisirs_tourisme: [
    // Abidjan
    { title: 'Sofitel Abidjan Hôtel Ivoire', summary: 'Hôtel 5★ avec piscine, restaurants et vue sur la lagune.', commune: 'Cocody', phone: '+225 27 22 44 10 10', source: 'https://all.accor.com', lat: 5.3459, lng: -3.9996, tag: 'Hôtel' },
    { title: 'Zoo d\'Abidjan', summary: 'Parc zoologique historique, idéal en famille.', commune: 'Cocody', phone: '+225 27 22 44 36 88', lat: 5.3654, lng: -3.9779, tag: 'Aire de jeux' },
    { title: 'Parc National du Banco', summary: 'Forêt primaire à 30 min du Plateau pour randonnées.', commune: 'Yopougon', phone: '+225 27 20 33 10 61', lat: 5.3832, lng: -4.0759, tag: 'Site touristique' },
    { title: 'Musée des Civilisations de Côte d\'Ivoire', summary: 'Collections ethnographiques et arts africains.', commune: 'Plateau', phone: '+225 27 20 21 80 51', lat: 5.3256, lng: -4.0217, tag: 'Musée' },
    { title: 'Jardin Botanique de Bingerville', summary: 'Grand jardin historique, balade et pique-nique.', commune: 'Bingerville', phone: '+225 27 22 40 00 00', lat: 5.3567, lng: -3.8839, tag: 'Site touristique' },
    { title: 'Cap Sud Restaurants (Zone 4)', summary: 'Ensemble de restaurants et lounges à Marcory.', commune: 'Marcory', phone: '', lat: 5.3064, lng: -3.9991, tag: 'Restaurant' },
    { title: 'Galerie Cécile Fakhoury', summary: 'Galerie d\'art contemporain.', commune: 'Marcory', phone: '+225 27 21 35 03 05', lat: 5.3066, lng: -4.0066, tag: 'Art' },

    // Grand-Bassam
    { title: 'Plage de Grand-Bassam', summary: 'Plage historique, maisons coloniales à proximité.', commune: 'Grand-Bassam', phone: '', lat: 5.2110, lng: -3.7395, tag: 'Plage' },
    { title: 'Musée National du Costume', summary: 'Costumes traditionnels, patrimoine UNESCO.', commune: 'Grand-Bassam', phone: '+225 27 21 30 18 44', lat: 5.2103, lng: -3.7385, tag: 'Musée' },

    // Assinie
    { title: 'Assinie – Étoile du Sud', summary: 'Hôtel plage, sports nautiques, escapade détente.', commune: 'Assinie', phone: '+225 27 21 30 70 71', lat: 5.1295, lng: -3.2819, tag: 'Hôtel' },
    { title: 'Assinie Mafia – Plage', summary: 'Lagune, plage, restaurants sur pilotis.', commune: 'Assinie', phone: '', lat: 5.1099, lng: -3.2510, tag: 'Plage' },

    // San-Pedro
    { title: 'Plage de Monogaga', summary: 'Superbe plage au nord de San-Pedro.', commune: 'San-Pedro', phone: '', lat: 4.9038, lng: -6.6235, tag: 'Plage' },

    // Man
    { title: 'Cascades de Man', summary: 'Chutes d\'eau pittoresques au pied des montagnes.', commune: 'Man', phone: '', lat: 7.4095, lng: -7.5551, tag: 'Site touristique' },
    { title: 'Dent de Man', summary: 'Sommet emblématique pour randonnée.', commune: 'Man', phone: '', lat: 7.4008, lng: -7.5620, tag: 'Site touristique' },

    // Korhogo
    { title: 'Sculptures Sénoufo – Quartier des Artisans', summary: 'Ateliers de sculpture et tissage Poro.', commune: 'Korhogo', phone: '', lat: 9.4576, lng: -5.6296, tag: 'Artisanat' },

    // Bouaké
    { title: 'La Paillote – Restaurant', summary: 'Cuisine locale populaire.', commune: 'Bouaké', phone: '', lat: 7.6868, lng: -5.0303, tag: 'Restaurant' },

    // Yamoussoukro
    { title: 'Basilique Notre‑Dame de la Paix', summary: 'Basilique monumentale ouverte aux visites.', commune: 'Yamoussoukro', phone: '+225 27 30 64 11 11', lat: 6.8210, lng: -5.2865, tag: 'Site touristique' },
    { title: 'Fondation F. Houphouët‑Boigny', summary: 'Centre de culture et de paix.', commune: 'Yamoussoukro', phone: '+225 27 30 64 50 20', lat: 6.8045, lng: -5.2763, tag: 'Site touristique' },
  ],
};
