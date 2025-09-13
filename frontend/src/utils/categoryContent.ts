export type CatSlug = 'urgence' | 'sante' | 'education' | 'examens_concours' | 'services_publics' | 'services_utiles' | 'agriculture' | 'loisirs_tourisme' | 'transport' | 'alertes' | 'pharmacies';

export interface CatItem {
  title: string;
  summary: string;
  tag?: string;
  location?: string;
  date?: string; // ISO or human readable
  source?: string; // url if any
}

export const CONTENT_BY_CATEGORY: Record<string, CatItem[]> = {
  urgence: [
    {
      title: 'Numéros d\'urgence en Côte d\'Ivoire',
      summary: 'Police Secours: 170 • Sapeurs-pompiers (GSPM): 180 • SAMU: 185. À appeler selon la nature de l\'urgence.',
      tag: 'Numéros utiles',
      source: 'https://www.gouv.ci/'
    },
    {
      title: 'Sapeurs-Pompiers (GSPM) — Interventions à Abidjan',
      summary: 'Composez le 180 pour signaler un incendie, accident ou secours d\'urgence.',
      tag: 'Urgences',
      source: 'https://www.facebook.com/GSPMCI/'
    },
    {
      title: 'SAMU — Aide médicale urgente',
      summary: 'Appelez le 185 pour une assistance médicale d\'urgence, 24h/24.',
      tag: 'Santé',
      source: 'https://sante.gouv.ci/'
    },
  ],
  sante: [
    {
      title: 'CHU de Treichville — Urgences 24/7',
      summary: 'Accueil des urgences médico-chirurgicales. Adresse: Boulevard de Marseille, Abidjan.',
      tag: 'Hôpital',
      source: 'https://sante.gouv.ci/'
    },
    {
      title: 'Programme de vaccination (PNVSI)',
      summary: 'Vaccinations de routine pour enfants et adultes selon le calendrier national.',
      tag: 'Prévention',
      source: 'https://sante.gouv.ci/'
    },
    {
      title: 'Centres de santé de proximité',
      summary: 'Renseignez-vous auprès du centre de santé le plus proche pour les consultations.',
      tag: 'Infos pratiques'
    },
  ],
  education: [
    {
      title: 'Calendrier scolaire 2024–2025',
      summary: 'Rentrée, congés et périodes d\'examens (BEPC, BAC).',
      tag: 'Officiel',
      source: 'https://www.education.gouv.ci/'
    },
    {
      title: 'Orientation et bourses',
      summary: 'Information sur les procédures d\'orientation et demandes de bourses.',
      tag: 'Études',
      source: 'https://www.education.gouv.ci/'
    },
    {
      title: 'Écoles et lycées — Abidjan & intérieur du pays',
      summary: 'Coordonnées et contacts des établissements publics et privés.',
      tag: 'Annuaire'
    },
  ],
  examens_concours: [
    {
      title: 'Inscriptions en ligne — Examens',
      summary: 'BEPC, BAC: vérifiez les dates d\'inscription et modalités.',
      tag: 'Examens',
      source: 'https://www.men-deco.org/'
    },
    {
      title: 'Concours de la Fonction Publique',
      summary: 'Consultez les avis d\'ouverture et les conditions d\'éligibilité.',
      tag: 'Concours',
      source: 'https://www.fonctionpublique.gouv.ci/'
    },
    {
      title: 'Concours paramédicaux & professionnels',
      summary: 'Informations sur les concours des écoles professionnelles.',
      tag: 'Carrière',
      source: 'https://www.ena.ci/'
    },
  ],
  services_publics: [
    {
      title: 'e-Impôts Côte d\'Ivoire',
      summary: 'Déclarations et paiements en ligne pour particuliers et entreprises.',
      tag: 'Fiscalité',
      source: 'https://www.e-impots.gouv.ci/'
    },
    {
      title: 'État civil — Extrait de naissance',
      summary: 'Procédures pour l\'obtention ou la régularisation des actes.',
      tag: 'État civil'
    },
    {
      title: 'Carte nationale d\'identité',
      summary: 'Renouvellement et informations sur les centres d\'enrôlement.',
      tag: 'Identité',
      source: 'https://www.oneci.ci/'
    },
  ],
  services_utiles: [
    {
      title: 'CIE — Signaler une panne',
      summary: 'Coupure d\'électricité, problème de réseau: contactez le service client ou signalez en ligne.',
      tag: 'Électricité',
      source: 'https://www.cie.ci/'
    },
    {
      title: 'SODECI — Déclarer une fuite',
      summary: 'Coupure d\'eau, fuite sur la voie publique: service en ligne et numéros utiles.',
      tag: 'Eau',
      source: 'https://www.sodeci.ci/'
    },
    {
      title: 'Opérateurs mobiles',
      summary: 'Assistance Orange, MTN, Moov: offres, dépannage, internet.',
      tag: 'Télécoms'
    },
  ],
  agriculture: [
    {
      title: 'Cacao — Informations officielles',
      summary: 'Actualités du Conseil du Café-Cacao et campagnes en cours.',
      tag: 'Cacao',
      source: 'https://www.conseilcafecacao.ci/'
    },
    {
      title: 'Prix indicatifs — filières',
      summary: 'Suivez les prix indicatifs des principales filières agricoles.',
      tag: 'Marchés'
    },
    {
      title: 'Appui aux coopératives',
      summary: 'Programmes d\'accompagnement et de formation.',
      tag: 'Programmes'
    },
  ],
  loisirs_tourisme: [
    {
      title: 'Parc National du Banco — Abidjan',
      summary: 'Randonnées et découverte de la forêt primaire aux portes d\'Abidjan.',
      tag: 'Nature'
    },
    {
      title: 'Grand-Bassam — Patrimoine UNESCO',
      summary: 'Visites culturelles, plages et patrimoine historique.',
      tag: 'Patrimoine'
    },
    {
      title: 'Assinie — Lagunes et plages',
      summary: 'Séjours balnéaires et activités nautiques.',
      tag: 'Balnéaire'
    },
  ],
  transport: [
    {
      title: 'SOTRA — Réseau d\'Abidjan',
      summary: 'Consultez les lignes et horaires des bus et bateaux-bus.',
      tag: 'Urbain',
      source: 'https://www.sotra.ci/'
    },
    {
      title: 'Aéroport FHB — Vols & infos',
      summary: 'Renseignements vols, consignes bagages, accès.',
      tag: 'Aérien',
      source: 'https://www.abidjan-airport.com/'
    },
    {
      title: 'Interurbain — Compagnies & liaisons',
      summary: 'Informations sur les liaisons routières entre villes.',
      tag: 'Voyages'
    },
  ],
  alertes: [
    {
      title: 'Publiez une alerte utile',
      summary: 'Signalez un danger, une disparition, un accident ou un embouteillage avec photo et localisation.',
      tag: 'Communauté'
    },
    {
      title: 'Astuces de sécurité',
      summary: 'Gardez les numéros d\'urgence à portée de main et partagez des infos vérifiées.',
      tag: 'Conseils'
    },
  ],
  pharmacies: [
    {
      title: 'Pharmacies de garde — Abidjan',
      summary: 'Retrouvez rapidement les pharmacies de garde autour de vous ou par ville.',
      tag: 'De garde'
    },
    {
      title: 'Médicaments — Bon usage',
      summary: 'Suivez la prescription et demandez conseil à votre pharmacien.',
      tag: 'Conseils'
    },
  ],
};