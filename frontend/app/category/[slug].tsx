import React, { useMemo, useState, useRef, useEffect } from 'react';
import { View, Text, ImageBackground, StyleSheet, FlatList, SectionList, TouchableOpacity, Linking, TextInput, ScrollView, Platform, Image, Dimensions, Animated, Easing, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import { useI18n } from '../../src/i18n/i18n';
import { CONTENT_BY_CATEGORY } from '../../src/utils/categoryContent';
import { useAuth } from '../../src/context/AuthContext';

const COMMON_HEADER = { uri: 'https://customer-assets.emergent.sh/alloscici/home/header_pharmacies.png' };
const eduHeaderHeight = 250; // Header Education (fixe)

export default function CategoryPage() {
  const { slug } = useLocalSearchParams();
  const s = Array.isArray(slug) ? slug[0] : (slug || 'urgence');
  const { t } = useI18n();
  const { user } = useAuth();
  // Données de contenu pour la catégorie courante (disponible tôt pour éviter TDZ)
  const categoryData = CONTENT_BY_CATEGORY[s] || [];

  // Ville effective (contexte puis stockage local en secours)
  const [effectiveCity, setEffectiveCity] = useState<string>(user?.city || 'Abidjan');

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        if (user?.city) {
          if (mounted) setEffectiveCity(user.city);
          return;
        }
        const raw = await AsyncStorage.getItem('auth_user');
        if (!raw) return;
        const u = JSON.parse(raw);
        if (u?.city && mounted) setEffectiveCity(u.city);
      } catch {}
    };
    load();
    return () => { mounted = false; };
  }, [user?.city]);

  // États pour la section santé
  const [mode, setMode] = useState<'nearby' | 'commune'>('nearby');
  const [communeQuery, setCommuneQuery] = useState('');
  const [showCommuneSuggestions, setShowCommuneSuggestions] = useState(false);
  const [communeChosen, setCommuneChosen] = useState(false);

  // Education dropdown state
  const [eduMenuOpen, setEduMenuOpen] = useState(false);
  const [selectedEduType, setSelectedEduType] = useState<null | 'scolaire' | 'college_lycee' | 'formation'>(null);
  const [eduHasAutoHidden, setEduHasAutoHidden] = useState(false);

  // Ne pas masquer l'UI Éducation au chargement
  useEffect(() => {
    setEduUIHidden(false);
  }, []);

  // Fonction pour réinitialiser les filtres
  const [eduUIHidden, setEduUIHidden] = useState(false);

  const resetFilters = () => {
    setMode('nearby');
    setCommuneQuery('');
    setShowCommuneSuggestions(false);
    setSelectedEduType(null);
    setEduUIHidden(false);
  };

  // Communes par ville
  const communesByCity: Record<string, string[]> = {
    'Abidjan': [
      'Abobo', 'Adjamé', 'Anyama', 'Attécoubé', 'Bingerville', 'Cocody', 
      'Koumassi', 'Marcory', 'Plateau', 'Port-Bouët', 'Treichville', 
      'Songon', 'Yopougon'
    ],
    // Autres villes de Côte d'Ivoire
    'Divo': ['Divo'],
    'Ferkessédougou': ['Ferkessédougou'],
    'Guiglo': ['Guiglo'],
    'Katiola': ['Katiola'],
    'Soubré': ['Soubré'],
    'Aboisso': ['Aboisso'],
    'Séguéla': ['Séguéla'],
    'Daoukro': ['Daoukro'],
    'Touba': ['Touba'],
    'Boundiali': ['Boundiali'],
    'Agboville': ['Agboville'],
    'Dimbokro': ['Dimbokro'],
    'Bongouanou': ['Bongouanou'],
    'Issia': ['Issia'],
    'Odienné': ['Odienné'],
    'Dabou': ['Dabou'],
    'Tiassalé': ['Tiassalé'],
    'Tabou': ['Tabou'],
    'Toumodi': ['Toumodi'],
    'Adzopé': ['Adzopé'],
    'Bondoukou': ['Bondoukou'],
    'Bouaflé': ['Bouaflé'],
    'Lakota': ['Lakota'],
    'Sinématiali': ['Sinématiali'],
    'Dikodougou': ['Dikodougou'],
    'Danané': ['Danané'],
    'Méagui': ['Méagui'],
    'Tiébissou': ['Tiébissou'],
    'Zuénoula': ['Zuénoula'],
    'Grand-Bassam': ['Grand-Bassam'],
    // Nouvelles villes ajoutées
    'Tiapoum': ['Tiapoum'],
    'Fresco': ['Fresco'],
    'Sassandra': ['Sassandra'],
    'Béoumi': ['Béoumi'],
    'Sakassou': ['Sakassou'],
    'Facobly': ['Facobly'],
    'Kounahiri': ['Kounahiri'],
    'Guitry': ['Guitry'],
    'Grand-Lahou': ['Grand-Lahou'],
    'Arrah': ['Arrah'],
    'Bouna': ['Bouna'],
    'Tanda': ['Tanda'],
    'Mankono': ['Mankono'],
    'Oumé': ['Oumé'],
    'Kani': ['Kani'],
    'Minignan': ['Minignan'],
    'Zouan-Hounien': ['Zouan-Hounien'],
    'Jacqueville': ['Jacqueville'],
    'Agnibilékrou': ['Agnibilékrou'],
    'Kong': ['Kong'],
    'Toulepleu': ['Toulepleu'],
    'Adiaké': ['Adiaké'],
    'M\'Batto': ['M\'Batto'],
    'Kouto': ['Kouto'],
    // Nouvelles villes ajoutées
    'Djékanou': ['Djékanou'],
    'Grand-Béréby': ['Grand-Béréby'],
    'Dabakala': ['Dabakala'],
    'Akoupé': ['Akoupé'],
    'Bloléquin': ['Bloléquin'],
    'Prikro': ['Prikro'],
    'Koun-Fao': ['Koun-Fao'],
    'Guibéroua': ['Guibéroua'],
    'N\'Douci': ['N\'Douci'],
    'Grabo': ['Grabo'],
    'Bouaké': ['Broukro', 'Djébonoua', 'Gonfreville', 'Korhogo'],
    'Yamoussoukro': ['Attiégouakro', 'N\'Gokro'],
  };

  // Établissements de santé par commune
  const healthFacilitiesByCommune: Record<string, any[]> = {
    'Cocody': [
      {
        id: 'chu-cocody',
        name: 'CHU de Cocody',
        type: 'public',
        services: 'urgences, médecine interne, chirurgie, gynéco-obs, pédiatrie, odonto, ophtalmo',
        address: 'Bd de l\'Université, Cocody',
        phones: ['22 44 90 00', '22 44 90 38'],
        commune: 'Cocody',
        city: 'Abidjan'
      },
      {
        id: 'chu-angre',
        name: 'CHU d\'Angré',
        type: 'public',
        services: 'urgences 24/7, médecine, chirurgie, pédiatrie, gynéco, imagerie',
        address: 'Angré 8e tranche, Cocody',
        phones: ['+225 27 22 49 64 00'],
        website: 'chuangre.ci',
        lat: 5.401012,
        lng: -3.957433,
        commune: 'Cocody',
        city: 'Abidjan'
      },
      {
        id: 'pisam',
        name: 'PISAM (Polyclinique Int. Ste Anne-Marie)',
        type: 'clinic',
        services: 'clinique multi-spécialités, urgences 24/7, imagerie, maternité',
        address: 'Rue Cannebière / Av. Joseph Blohorn, Cocody',
        phones: ['27 22 48 31 31', '27 22 48 31 32'],
        website: 'groupepisam.com',
        commune: 'Cocody',
        city: 'Abidjan'
      },
      {
        id: 'danga',
        name: 'Clinique Médicale Danga',
        type: 'clinic',
        services: 'pluridisciplinaire, historique en néphro-dialyse',
        address: 'Av. des Jasmins n°26, Danga, Cocody',
        phones: ['27 22 48 44 44', '27 22 48 23 23'],
        website: 'cliniquemedicaledanga.com',
        commune: 'Cocody',
        city: 'Abidjan'
      },
      {
        id: 'ii-plateaux',
        name: 'Polyclinique des II Plateaux (Groupe Novamed)',
        type: 'clinic',
        services: 'multi-spécialités',
        address: 'II Plateaux, Bd Latrille',
        phones: ['27 22 41 33 34', '27 22 41 33 20'],
        website: 'groupenovamed.com',
        commune: 'Cocody',
        city: 'Abidjan'
      },
      {
        id: 'inhp-vaccination-cocody',
        name: 'Services vaccination & hygiène (INHP)',
        type: 'public',
        services: 'PEV, hygiène, vaccination',
        address: 'Cocody/Abidjan',
        emails: ['info@inhp.ci', 'portbouet@inhp.ci'],
        commune: 'Cocody',
        city: 'Abidjan',
        note: 'Antenne Treichville et Port-Bouët disponibles'
      }
    ],
    'Treichville': [
      {
        id: 'chu-treichville',
        name: 'CHU de Treichville',
        type: 'public',
        services: 'urgences 24/7, médecine, chirurgie, réanimation, maternité',
        address: 'Bd de Marseille (Km 4), Treichville',
        commune: 'Treichville',
        city: 'Abidjan'
      },
      {
        id: 'ica-treichville',
        name: 'Institut de Cardiologie d\'Abidjan (ICA)',
        type: 'public',
        services: 'cardiologie, chirurgie cardiaque, rythmologie, cathétérisme',
        address: 'au sein du CHU de Treichville, Bd de Marseille',
        phones: ['+225 27 21 21 61 70', '07 78 77 18 67'],
        website: 'ica.ci',
        commune: 'Treichville',
        city: 'Abidjan',
        note: 'Ouvert 24/7'
      },
      {
        id: 'pole-cardio-treichville',
        name: 'LE POLE CARDIO - ICA',
        type: 'public',
        services: 'cardiologie interventionnelle, chirurgie cardiaque',
        address: 'CHU Treichville, Bd de Marseille',
        phones: ['27 21 21 61 70', '07 78 77 18 67'],
        commune: 'Treichville',
        city: 'Abidjan'
      },
      {
        id: 'novamed-plateau-indenie',
        name: 'Polyclinique Internationale de l\'Indénié (Novamed)',
        type: 'clinic',
        services: 'multi-spécialités, urgences 24/7',
        address: '4 Bd de l\'Indénié, Plateau (à 5–10 min de Treichville)',
        phones: ['27 20 30 91 00'],
        website: 'groupenovamed.com',
        commune: 'Treichville',
        city: 'Abidjan'
      },
      {
        id: 'inhp-treichville',
        name: 'INHP – Antenne Treichville',
        type: 'public',
        services: 'vaccins de voyage, PEV, hygiène',
        address: 'Treichville',
        emails: ['info@inhp.ci'],
        commune: 'Treichville',
        city: 'Abidjan'
      }
    ],
    'Plateau': [
      {
        id: 'novamed-plateau',
        name: 'Polyclinique Int. de l\'Indénié (Novamed)',
        type: 'clinic',
        services: 'multi-spécialités, urgences 24/7',
        address: '4 Bd de l\'Indénié, Plateau',
        phones: ['27 20 30 91 00'],
        website: 'groupenovamed.com',
        commune: 'Plateau',
        city: 'Abidjan'
      },
      {
        id: 'nova-cardiologie',
        name: 'Nova Cardiologie (Novamed)',
        type: 'clinic',
        services: 'cardiologie',
        address: '4 Bd de l\'Indénié, Plateau',
        phones: ['27 20 30 91 00'],
        website: 'groupenovamed.com',
        commune: 'Plateau',
        city: 'Abidjan',
        note: 'Via standard'
      },
      {
        id: 'insp-plateau',
        name: 'INSP – Institut National de Santé Publique',
        type: 'public',
        services: 'épidémiologie, santé publique',
        address: 'Plateau, Abidjan',
        commune: 'Plateau',
        city: 'Abidjan'
      }
    ],
    'Marcory': [
      {
        id: 'hopital-marcory',
        name: 'Hôpital Général de Marcory',
        type: 'public',
        services: 'médecine, pédiatrie, gynéco, radiologie, odonto, urgences',
        address: 'Marcory (Bd de Brazzaville / environs)',
        phones: ['+225 21 26 30 08'],
        commune: 'Marcory',
        city: 'Abidjan'
      },
      {
        id: 'novamed-graces',
        name: 'Nouvelle Polyclinique Les Grâces (Novamed)',
        type: 'clinic',
        services: 'multi-spécialités',
        address: 'Zone 4C, Rue Marconi',
        phones: ['27 21 75 15 95', '27 21 75 15 97', '27 21 75 15 98'],
        website: 'groupenovamed.com',
        commune: 'Marcory',
        city: 'Abidjan'
      }
    ],
    'Koumassi': [
      {
        id: 'hopital-koumassi',
        name: 'Hôpital Général de Koumassi',
        type: 'public',
        services: 'médecine générale, maternité, pédiatrie, imagerie de base',
        address: 'Grand Carrefour Koumassi',
        phones: ['+225 27 21 36 13 10'],
        commune: 'Koumassi',
        city: 'Abidjan'
      }
    ],
    'Port-Bouët': [
      {
        id: 'hopital-port-bouet',
        name: 'Hôpital Général de Port-Bouët',
        type: 'public',
        services: 'consultations, urgences, imagerie, maternité, chirurgie, pédiatrie',
        address: 'Rue des Caraïbes / Abattoir',
        phones: ['+225 27 21 27 85 00'],
        commune: 'Port-Bouët',
        city: 'Abidjan'
      },
      {
        id: 'inhp-port-bouet',
        name: 'Antenne INHP – Port-Bouët',
        type: 'public',
        services: 'vaccination, hygiène',
        address: 'Port-Bouët',
        emails: ['portbouet@inhp.ci'],
        commune: 'Port-Bouët',
        city: 'Abidjan'
      }
    ],
    'Bingerville': [
      {
        id: 'hme-bingerville',
        name: 'Hôpital Mère-Enfant Dominique Ouattara (HME)',
        type: 'public',
        services: 'pédiatrie, néonat, gynéco-obs, chirurgie pédiat., urgences 24/7',
        address: 'Bingerville',
        phones: ['+225 27 22 51 15 00', '01 72 76 76 76'],
        commune: 'Bingerville',
        city: 'Abidjan'
      },
      {
        id: 'ephd-bingerville',
        name: 'EPHD / Hôpital Général de Bingerville',
        type: 'public',
        services: 'services généraux',
        address: 'Bingerville',
        commune: 'Bingerville',
        city: 'Abidjan'
      }
    ],
    'Yopougon': [
      {
        id: 'hopital-yopougon-attie',
        name: 'Hôpital Général de Yopougon-Attié',
        type: 'public',
        services: 'médecine, maternité, pédiatrie, PEC VIH/IST/TB',
        address: 'Av. M-T Houphouët-Boigny, Yopougon',
        phones: ['05 06 14 50 27'],
        commune: 'Yopougon',
        city: 'Abidjan',
        note: 'Ouvert 24/7 (garde), ancien fixe 23 45 38 52'
      }
    ],
    'Adjamé': [
      {
        id: 'hopital-adjame',
        name: 'Hôpital Général d\'Adjamé',
        type: 'public',
        services: 'médecine générale, urgences, maternité, pédiatrie, chirurgie de base',
        address: 'Adjamé',
        phones: ['+225 27 20 21 31 44', '27 20 30 40 73'],
        commune: 'Adjamé',
        city: 'Abidjan'
      }
    ],
    'Abobo': [
      {
        id: 'hopital-abobo',
        name: 'Hôpital Général d\'Abobo',
        type: 'public',
        services: 'médecine, chirurgie, maternité, urgences',
        address: 'Quartier de la Cent Douze Hectares, Abobo',
        phones: ['+225 05 86 30 20 83'],
        commune: 'Abobo',
        city: 'Abidjan',
        note: 'Réhabilitation en travaux'
      },
      {
        id: 'cmsh-biabou',
        name: 'Centre Médical Spécialisé Hinneh (CMSH) de Biabou',
        type: 'public',
        services: 'dispensaire, maternité, services spécialisés',
        address: 'Abobo-Biabou',
        commune: 'Abobo',
        city: 'Abidjan'
      },
      {
        id: 'clinique-chirurgical-abobo',
        name: 'Clinique Médical Chirurgical d\'Abobo',
        type: 'clinic',
        services: 'chirurgicale & médicale pluridisciplinaire',
        address: 'Derrière la CIE à environ 250 m, Avocatier, Abobo',
        phones: ['+225 78 88 22 46 9'],
        commune: 'Abobo',
        city: 'Abidjan'
      },
      {
        id: 'polyclinique-centrale-abobo',
        name: 'Polyclinique Centrale Abobo',
        type: 'clinic',
        services: 'polyclinique de référence',
        address: 'Route du Zoo, Abobo (Carrefour Menuiserie / Aboboté)',
        commune: 'Abobo',
        city: 'Abidjan'
      },
      {
        id: 'polyclinique-etoile',
        name: 'Polyclinique Médicale de l\'Étoile',
        type: 'clinic',
        services: 'clinique médicale',
        address: 'Face Camp Commando, Abobo',
        phones: ['24 49 44 81'],
        commune: 'Abobo',
        city: 'Abidjan'
      },
      {
        id: 'grande-clinique-dokui',
        name: 'Grande Clinique du Dokui',
        type: 'clinic',
        services: 'soins divers',
        address: 'Abobo',
        phones: ['20 37 23 40'],
        commune: 'Abobo',
        city: 'Abidjan'
      },
      {
        id: 'clinique-fatima-4etages',
        name: 'Clinique Fatima des 4 Étages',
        type: 'clinic',
        services: 'centre hospitalier, clinique, maternité',
        address: 'Sogé-Phia, Abobo (près mosquée des 4 étages)',
        commune: 'Abobo',
        city: 'Abidjan'
      }
    ],
    'Anyama': [
      {
        id: 'centre-don-orione-anyama',
        name: 'Centre Médical Don Orione Anyama',
        type: 'public',
        services: 'gynécologie obstétrique, médecine générale',
        address: 'Anyama',
        commune: 'Anyama',
        city: 'Abidjan'
      },
      {
        id: 'clinique-medicale-anyama',
        name: 'Clinique Médicale d\'Anyama',
        type: 'clinic',
        services: 'services médicaux généraux',
        address: 'Anyama',
        phones: ['23 55 91 45'],
        commune: 'Anyama',
        city: 'Abidjan'
      },
      {
        id: 'centre-st-louis-orione',
        name: 'Centre Médical St Louis Orione',
        type: 'clinic',
        services: 'service médical',
        address: 'Anyama',
        phones: ['23 55 95 34'],
        website: 'gcya-holding.com',
        commune: 'Anyama',
        city: 'Abidjan',
        note: 'Privé confessionnel'
      }
    ],
    'Songon': [
      {
        id: 'societe-medicale-songon',
        name: 'Société Médicale de Songon',
        type: 'clinic',
        services: 'clinique médicale',
        address: 'Carrefour Gravier, Songon',
        phones: ['07 58 30 87 81'],
        commune: 'Songon',
        city: 'Abidjan'
      }
    ],
    // Autres villes de Côte d'Ivoire
    'Divo': [
      {
        id: 'chr-divo',
        name: 'Centre Hospitalier Régional de Divo (CHR de Divo)',
        type: 'public',
        services: 'urgences, médecine, chirurgie, maternité, pédiatrie, imagerie',
        address: "Près de l’Église Catholique, Divo",
        phones: ['+225 0151443842', '+225 0749669461'],
        website: 'accessante.org',
        lat: 5.85,
        lng: -5.85,
        commune: 'Divo',
        city: 'Divo'
      },
      {
        id: 'clinique-nouvelle-providence-divo',
        name: 'Clinique Médicale La Nouvelle Providence',
        type: 'clinic',
        services: 'clinique médicale',
        address: 'Vers Mediska Laboratoires, Quartier Dialogue 1, Divo',
        commune: 'Divo',
        city: 'Divo'
      },
      {
        id: 'clinique-ahissa-divo',
        name: 'Clinique Médicale Ahissa',
        type: 'clinic',
        services: 'clinique médicale',
        address: 'Konankro, BP 1602, Divo — En allant à la gare, non loin du CHR',
        phones: ['+225 27 32 76 02 24', '+225 27 32 76 02 35', '+225 07 07 90 71 99'],
        commune: 'Divo',
        city: 'Divo'
      },
      {
        id: 'centre-sante-police-divo',
        name: 'Centre de Santé de la Police (CRS) — Divo',
        type: 'public',
        services: 'service de santé spécialisé (Police)',
        address: 'Caserne/Quartier Police, Divo',
        phones: ['+225 27 32 76 22 47'],
        website: 'scaintera-sgam.com',
        commune: 'Divo',
        city: 'Divo'
      },
      {
        id: 'clinique-saint-jean-marie-vianney-divo',
        name: 'Clinique médicale Saint Jean Marie-Vianney',
        type: 'clinic',
        services: 'clinique médicale',
        address: 'Quartier Libanais 3, Divo',
        website: 'depps.sante.gouv.ci',
        commune: 'Divo',
        city: 'Divo'
      }
    ],
    'Ferkessédougou': [
      {
        id: 'hopital-ferkessedougou',
        name: 'Hôpital Général de Ferkessédougou',
        type: 'public',
        services: 'médecine générale, maternité, pédiatrie, urgences',
        address: 'Quartier central, Ferkessédougou',
        phones: ['+225 36 61 21 87'],
        commune: 'Ferkessédougou',
        city: 'Ferkessédougou'
      },
      {
        id: 'clinique-saint-luc',
        name: 'Clinique Saint-Luc',
        type: 'clinic',
        services: 'médecine générale, maternité',
        address: 'Ferkessédougou',
        commune: 'Ferkessédougou',
        city: 'Ferkessédougou'
      },
      {
        id: 'inhp-ferkessedougou',
        name: 'INHP – Antenne Ferkessédougou',
        type: 'public',
        services: 'vaccination, hygiène',
        address: 'Ferkessédougou',
        emails: ['ferkessedougou@inhp.ci'],
        commune: 'Ferkessédougou',
        city: 'Ferkessédougou'
      }
    ],
    'Toumodi': [
      {
        id: 'hopital-toumodi',
        name: 'Hôpital Général de Toumodi',
        type: 'public',
        services: 'médecine générale, maternité, pédiatrie',
        address: 'Toumodi centre',
        phones: ['+225 27 30 61 21 12'],
        commune: 'Toumodi',
        city: 'Toumodi'
      },
      {
        id: 'inhp-toumodi',
        name: 'INHP – Antenne Toumodi',
        type: 'public',
        services: 'vaccination, hygiène',
        address: 'Toumodi',
        emails: ['toumodi@inhp.ci'],
        commune: 'Toumodi',
        city: 'Toumodi'
      }
    ],
    'Tiapoum': [
      {
        id: 'hopital-tiapoum',
        name: 'Hôpital Général de Tiapoum',
        type: 'public',
        services: 'soins de base : médecine, maternité, pédiatrie',
        address: 'Tiapoum centre',
        phones: ['+225 27 35 53 21 22'],
        commune: 'Tiapoum',
        city: 'Tiapoum'
      },
      {
        id: 'inhp-tiapoum',
        name: 'INHP – Antenne Tiapoum',
        type: 'public',
        services: 'vaccination, hygiène',
        address: 'Tiapoum',
        emails: ['tiapoum@inhp.ci'],
        commune: 'Tiapoum',
        city: 'Tiapoum'
      }
    ],
    'Fresco': [
      {
        id: 'hopital-fresco',
        name: 'Hôpital Général de Fresco',
        type: 'public',
        services: 'médecine générale, maternité, pédiatrie, chirurgie de base',
        address: 'Fresco centre',
        phones: ['+225 27 34 62 21 14'],
        commune: 'Fresco',
        city: 'Fresco'
      },
      {
        id: 'inhp-fresco',
        name: 'INHP – Antenne Fresco',
        type: 'public',
        services: 'vaccination, hygiène',
        address: 'Fresco',
        emails: ['fresco@inhp.ci'],
        commune: 'Fresco',
        city: 'Fresco'
      }
    ],
    'Sassandra': [
      {
        id: 'chr-sassandra',
        name: 'CHR de Sassandra',
        type: 'public',
        services: 'hôpital régional, urgences, médecine, chirurgie, maternité, pédiatrie, imagerie',
        address: 'Sassandra',
        phones: ['+225 27 34 61 21 37'],
        commune: 'Sassandra',
        city: 'Sassandra'
      },
      {
        id: 'inhp-sassandra',
        name: 'INHP – Antenne Sassandra',
        type: 'public',
        services: 'vaccination, hygiène',
        address: 'Sassandra',
        emails: ['sassandra@inhp.ci'],
        commune: 'Sassandra',
        city: 'Sassandra'
      }
    ],
    'Béoumi': [
      {
        id: 'hopital-beoumi',
        name: 'Hôpital Général de Béoumi',
        type: 'public',
        services: 'médecine, maternité, pédiatrie',
        address: 'Béoumi (près de Bouaké)',
        phones: ['+225 27 31 65 21 24'],
        commune: 'Béoumi',
        city: 'Béoumi'
      },
      {
        id: 'inhp-beoumi',
        name: 'INHP – Antenne Béoumi',
        type: 'public',
        services: 'vaccination, hygiène',
        address: 'Béoumi',
        emails: ['beoumi@inhp.ci'],
        commune: 'Béoumi',
        city: 'Béoumi'
      }
    ],
    'Sakassou': [
      {
        id: 'hopital-sakassou',
        name: 'Hôpital Général de Sakassou',
        type: 'public',
        services: 'médecine générale, maternité, pédiatrie',
        address: 'Sakassou (près de Bouaké)',
        phones: ['+225 27 31 66 21 44'],
        commune: 'Sakassou',
        city: 'Sakassou'
      },
      {
        id: 'inhp-sakassou',
        name: 'INHP – Antenne Sakassou',
        type: 'public',
        services: 'vaccination, hygiène',
        address: 'Sakassou',
        emails: ['sakassou@inhp.ci'],
        commune: 'Sakassou',
        city: 'Sakassou'
      }
    ],
    'Facobly': [
      {
        id: 'hopital-facobly',
        name: 'Hôpital Général de Facobly',
        type: 'public',
        services: 'médecine générale, maternité, pédiatrie, chirurgie de base',
        address: 'Facobly centre',
        phones: ['+225 27 33 84 21 33'],
        commune: 'Facobly',
        city: 'Facobly'
      },
      {
        id: 'inhp-facobly',
        name: 'INHP – Antenne Facobly',
        type: 'public',
        services: 'vaccination, hygiène',
        address: 'Facobly',
        emails: ['facobly@inhp.ci'],
        commune: 'Facobly',
        city: 'Facobly'
      }
    ],
    'Kounahiri': [
      {
        id: 'hopital-kounahiri',
        name: 'Hôpital Général de Kounahiri',
        type: 'public',
        services: 'médecine générale, maternité, pédiatrie',
        address: 'Kounahiri',
        phones: ['+225 27 36 83 21 14'],
        commune: 'Kounahiri',
        city: 'Kounahiri'
      },
      {
        id: 'inhp-kounahiri',
        name: 'INHP – Antenne Kounahiri',
        type: 'public',
        services: 'vaccination, hygiène',
        address: 'Kounahiri',
        emails: ['kounahiri@inhp.ci'],
        commune: 'Kounahiri',
        city: 'Kounahiri'
      }
    ],
    'Guitry': [
      {
        id: 'hopital-guitry',
        name: 'Hôpital Général de Guitry',
        type: 'public',
        services: 'médecine, maternité, pédiatrie, chirurgie de base',
        address: 'Guitry centre',
        phones: ['+225 27 32 55 21 18'],
        commune: 'Guitry',
        city: 'Guitry'
      },
      {
        id: 'inhp-guitry',
        name: 'INHP – Antenne Guitry',
        type: 'public',
        services: 'vaccination, hygiène',
        address: 'Guitry',
        emails: ['guitry@inhp.ci'],
        commune: 'Guitry',
        city: 'Guitry'
      }
    ],
    'Grand-Lahou': [
      {
        id: 'hopital-grand-lahou',
        name: 'Hôpital Général de Grand-Lahou',
        type: 'public',
        services: 'médecine, maternité, pédiatrie, urgences',
        address: 'Grand-Lahou',
        phones: ['+225 27 23 63 21 22'],
        commune: 'Grand-Lahou',
        city: 'Grand-Lahou'
      },
      {
        id: 'inhp-grand-lahou',
        name: 'INHP – Antenne Grand-Lahou',
        type: 'public',
        services: 'vaccination, hygiène',
        address: 'Grand-Lahou',
        emails: ['grandlahou@inhp.ci'],
        commune: 'Grand-Lahou',
        city: 'Grand-Lahou'
      }
    ],
    'Arrah': [
      {
        id: 'hopital-arrah',
        name: 'Hôpital Général d\'Arrah',
        type: 'public',
        services: 'médecine générale, maternité, pédiatrie',
        address: 'Arrah',
        phones: ['+225 27 35 82 21 21'],
        commune: 'Arrah',
        city: 'Arrah'
      },
      {
        id: 'inhp-arrah',
        name: 'INHP – Antenne Arrah',
        type: 'public',
        services: 'vaccination, hygiène',
        address: 'Arrah',
        emails: ['arrah@inhp.ci'],
        commune: 'Arrah',
        city: 'Arrah'
      }
    ],
    'Bouna': [
      {
        id: 'hopital-bouna',
        name: 'Hôpital Général de Bouna',
        type: 'public',
        services: 'médecine générale, maternité, pédiatrie, urgences, chirurgie de base',
        address: 'Bouna centre',
        phones: ['+225 27 35 95 21 11'],
        commune: 'Bouna',
        city: 'Bouna'
      },
      {
        id: 'inhp-bouna',
        name: 'INHP – Antenne Bouna',
        type: 'public',
        services: 'vaccination, hygiène',
        address: 'Bouna',
        emails: ['bouna@inhp.ci'],
        commune: 'Bouna',
        city: 'Bouna'
      }
    ],
    'Tanda': [
      {
        id: 'hopital-tanda',
        name: 'Hôpital Général de Tanda',
        type: 'public',
        services: 'médecine, maternité, pédiatrie, chirurgie générale',
        address: 'Tanda',
        phones: ['+225 27 35 93 21 17'],
        commune: 'Tanda',
        city: 'Tanda'
      },
      {
        id: 'inhp-tanda',
        name: 'INHP – Antenne Tanda',
        type: 'public',
        services: 'vaccination, hygiène',
        address: 'Tanda',
        emails: ['tanda@inhp.ci'],
        commune: 'Tanda',
        city: 'Tanda'
      }
    ],
    'Mankono': [
      {
        id: 'chr-mankono',
        name: 'CHR de Mankono',
        type: 'public',
        services: 'hôpital régional, médecine générale, chirurgie, maternité, pédiatrie, urgences',
        address: 'Mankono centre',
        phones: ['+225 27 36 84 21 23'],
        commune: 'Mankono',
        city: 'Mankono'
      },
      {
        id: 'inhp-mankono',
        name: 'INHP – Antenne Mankono',
        type: 'public',
        services: 'vaccination, hygiène',
        address: 'Mankono',
        emails: ['mankono@inhp.ci'],
        commune: 'Mankono',
        city: 'Mankono'
      }
    ],
    'Oumé': [
      {
        id: 'hopital-oume',
        name: 'Hôpital Général d\'Oumé',
        type: 'public',
        services: 'médecine, maternité, pédiatrie, chirurgie de base',
        address: 'Oumé centre',
        phones: ['+225 27 32 76 21 13'],
        commune: 'Oumé',
        city: 'Oumé'
      },
      {
        id: 'inhp-oume',
        name: 'INHP – Antenne Oumé',
        type: 'public',
        services: 'vaccination, hygiène',
        address: 'Oumé',
        emails: ['oume@inhp.ci'],
        commune: 'Oumé',
        city: 'Oumé'
      }
    ],
    'Kani': [
      {
        id: 'hopital-kani',
        name: 'Hôpital Général de Kani',
        type: 'public',
        services: 'médecine générale, maternité, pédiatrie, chirurgie de base',
        address: 'Kani centre',
        phones: ['+225 27 36 93 21 22'],
        commune: 'Kani',
        city: 'Kani'
      },
      {
        id: 'inhp-kani',
        name: 'INHP – Antenne Kani',
        type: 'public',
        services: 'vaccination, hygiène',
        address: 'Kani',
        emails: ['kani@inhp.ci'],
        commune: 'Kani',
        city: 'Kani'
      }
    ],
    'Minignan': [
      {
        id: 'hopital-minignan',
        name: 'Hôpital Général de Minignan',
        type: 'public',
        services: 'médecine, maternité, pédiatrie, urgences',
        address: 'Minignan centre',
        phones: ['+225 27 34 91 21 12'],
        commune: 'Minignan',
        city: 'Minignan'
      },
      {
        id: 'inhp-minignan',
        name: 'INHP – Antenne Minignan',
        type: 'public',
        services: 'vaccination, hygiène',
        address: 'Minignan',
        emails: ['minignan@inhp.ci'],
        commune: 'Minignan',
        city: 'Minignan'
      }
    ],
    'Zouan-Hounien': [
      {
        id: 'hopital-zouan-hounien',
        name: 'Hôpital Général de Zouan-Hounien',
        type: 'public',
        services: 'médecine générale, maternité, pédiatrie, chirurgie de base',
        address: 'Zouan-Hounien centre',
        phones: ['+225 27 33 86 21 27'],
        commune: 'Zouan-Hounien',
        city: 'Zouan-Hounien'
      },
      {
        id: 'inhp-zouan-hounien',
        name: 'INHP – Antenne Zouan-Hounien',
        type: 'public',
        services: 'vaccination, hygiène',
        address: 'Zouan-Hounien',
        emails: ['zouanhounien@inhp.ci'],
        commune: 'Zouan-Hounien',
        city: 'Zouan-Hounien'
      }
    ],
    'Jacqueville': [
      {
        id: 'hopital-jacqueville',
        name: 'Hôpital Général de Jacqueville',
        type: 'public',
        services: 'médecine générale, maternité, pédiatrie',
        address: 'Jacqueville centre',
        phones: ['+225 27 23 62 21 33'],
        commune: 'Jacqueville',
        city: 'Jacqueville'
      },
      {
        id: 'inhp-jacqueville',
        name: 'INHP – Antenne Jacqueville',
        type: 'public',
        services: 'vaccination, hygiène',
        address: 'Jacqueville',
        emails: ['jacqueville@inhp.ci'],
        commune: 'Jacqueville',
        city: 'Jacqueville'
      }
    ],
    'Agnibilékrou': [
      {
        id: 'hopital-agnibilekrou',
        name: 'Hôpital Général d\'Agnibilékrou',
        type: 'public',
        services: 'médecine, maternité, pédiatrie, chirurgie de base',
        address: 'Agnibilékrou centre',
        phones: ['+225 27 35 92 21 19'],
        commune: 'Agnibilékrou',
        city: 'Agnibilékrou'
      },
      {
        id: 'inhp-agnibilekrou',
        name: 'INHP – Antenne Agnibilékrou',
        type: 'public',
        services: 'vaccination, hygiène',
        address: 'Agnibilékrou',
        emails: ['agnibilekrou@inhp.ci'],
        commune: 'Agnibilékrou',
        city: 'Agnibilékrou'
      }
    ],
    'Kong': [
      {
        id: 'hopital-kong',
        name: 'Hôpital Général de Kong',
        type: 'public',
        services: 'médecine générale, maternité, pédiatrie, chirurgie de base',
        address: 'Kong centre',
        phones: ['+225 27 36 87 21 18'],
        commune: 'Kong',
        city: 'Kong'
      },
      {
        id: 'inhp-kong',
        name: 'INHP – Antenne Kong',
        type: 'public',
        services: 'vaccination, hygiène',
        address: 'Kong',
        emails: ['kong@inhp.ci'],
        commune: 'Kong',
        city: 'Kong'
      }
    ],
    'Toulepleu': [
      {
        id: 'hopital-toulepleu',
        name: 'Hôpital Général de Toulépleu',
        type: 'public',
        services: 'médecine, maternité, pédiatrie, urgences',
        address: 'Toulépleu centre',
        phones: ['+225 27 33 87 21 12'],
        commune: 'Toulepleu',
        city: 'Toulepleu'
      },
      {
        id: 'inhp-toulepleu',
        name: 'INHP – Antenne Toulépleu',
        type: 'public',
        services: 'vaccination, hygiène',
        address: 'Toulépleu',
        emails: ['toulepleu@inhp.ci'],
        commune: 'Toulepleu',
        city: 'Toulepleu'
      }
    ],
    'Adiaké': [
      {
        id: 'hopital-adiake',
        name: 'Hôpital Général d\'Adiaké',
        type: 'public',
        services: 'médecine générale, maternité, pédiatrie, chirurgie de base',
        address: 'Adiaké centre',
        phones: ['+225 27 35 52 21 25'],
        commune: 'Adiaké',
        city: 'Adiaké'
      },
      {
        id: 'inhp-adiake',
        name: 'INHP – Antenne Adiaké',
        type: 'public',
        services: 'vaccination, hygiène',
        address: 'Adiaké',
        emails: ['adiake@inhp.ci'],
        commune: 'Adiaké',
        city: 'Adiaké'
      }
    ],
    'M\'Batto': [
      {
        id: 'hopital-mbatto',
        name: 'Hôpital Général de M\'Batto',
        type: 'public',
        services: 'médecine générale, maternité, pédiatrie',
        address: 'M\'Batto centre',
        phones: ['+225 27 35 83 21 11'],
        commune: 'M\'Batto',
        city: 'M\'Batto'
      },
      {
        id: 'inhp-mbatto',
        name: 'INHP – Antenne M\'Batto',
        type: 'public',
        services: 'vaccination, hygiène',
        address: 'M\'Batto',
        emails: ['mbatto@inhp.ci'],
        commune: 'M\'Batto',
        city: 'M\'Batto'
      }
    ],
    'Kouto': [
      {
        id: 'hopital-kouto',
        name: 'Hôpital Général de Kouto',
        type: 'public',
        services: 'médecine générale, maternité, pédiatrie, chirurgie de base',
        address: 'Kouto centre',
        phones: ['+225 27 36 92 21 20'],
        commune: 'Kouto',
        city: 'Kouto'
      },
      {
        id: 'inhp-kouto',
        name: 'INHP – Antenne Kouto',
        type: 'public',
        services: 'vaccination, hygiène',
        address: 'Kouto',
        emails: ['kouto@inhp.ci'],
        commune: 'Kouto',
        city: 'Kouto'
      }
    ],
    'Djékanou': [
      {
        id: 'hopital-djekanou',
        name: 'Hôpital Général de Djékanou',
        type: 'public',
        services: 'médecine générale, maternité, pédiatrie',
        address: 'Djékanou centre',
        phones: ['+225 27 30 65 21 13'],
        commune: 'Djékanou',
        city: 'Djékanou'
      },
      {
        id: 'inhp-djekanou',
        name: 'INHP – Antenne Djékanou',
        type: 'public',
        services: 'vaccination, hygiène',
        address: 'Djékanou',
        emails: ['djekanou@inhp.ci'],
        commune: 'Djékanou',
        city: 'Djékanou'
      }
    ],
    'Grand-Béréby': [
      {
        id: 'hopital-grand-bereby',
        name: 'Hôpital Général de Grand-Béréby',
        type: 'public',
        services: 'médecine générale, maternité, pédiatrie, urgences',
        address: 'Grand-Béréby centre',
        phones: ['+225 27 34 72 21 18'],
        commune: 'Grand-Béréby',
        city: 'Grand-Béréby'
      },
      {
        id: 'inhp-grand-bereby',
        name: 'INHP – Antenne Grand-Béréby',
        type: 'public',
        services: 'vaccination, hygiène',
        address: 'Grand-Béréby',
        emails: ['grandbereby@inhp.ci'],
        commune: 'Grand-Béréby',
        city: 'Grand-Béréby'
      }
    ],
    'Dabakala': [
      {
        id: 'hopital-dabakala',
        name: 'Hôpital Général de Dabakala',
        type: 'public',
        services: 'médecine, maternité, pédiatrie, chirurgie de base',
        address: 'Dabakala centre',
        phones: ['+225 27 36 65 21 24'],
        commune: 'Dabakala',
        city: 'Dabakala'
      },
      {
        id: 'inhp-dabakala',
        name: 'INHP – Antenne Dabakala',
        type: 'public',
        services: 'vaccination, hygiène',
        address: 'Dabakala',
        emails: ['dabakala@inhp.ci'],
        commune: 'Dabakala',
        city: 'Dabakala'
      }
    ],
    'Akoupé': [
      {
        id: 'hopital-akoupe',
        name: 'Hôpital Général d\'Akoupé',
        type: 'public',
        services: 'médecine générale, maternité, pédiatrie, chirurgie générale',
        address: 'Akoupé centre',
        phones: ['+225 27 32 72 21 22'],
        commune: 'Akoupé',
        city: 'Akoupé'
      },
      {
        id: 'inhp-akoupe',
        name: 'INHP – Antenne Akoupé',
        type: 'public',
        services: 'vaccination, hygiène',
        address: 'Akoupé',
        emails: ['akoupe@inhp.ci'],
        commune: 'Akoupé',
        city: 'Akoupé'
      }
    ],
    'Bloléquin': [
      {
        id: 'hopital-blolequin',
        name: 'Hôpital Général de Bloléquin',
        type: 'public',
        services: 'médecine générale, maternité, pédiatrie, urgences',
        address: 'Bloléquin centre',
        phones: ['+225 27 33 88 21 15'],
        commune: 'Bloléquin',
        city: 'Bloléquin'
      },
      {
        id: 'inhp-blolequin',
        name: 'INHP – Antenne Bloléquin',
        type: 'public',
        services: 'vaccination, hygiène',
        address: 'Bloléquin',
        emails: ['blolequin@inhp.ci'],
        commune: 'Bloléquin',
        city: 'Bloléquin'
      }
    ],
    'Prikro': [
      {
        id: 'hopital-prikro',
        name: 'Hôpital Général de Prikro',
        type: 'public',
        services: 'médecine générale, maternité, pédiatrie, chirurgie de base',
        address: 'Prikro centre',
        phones: ['+225 27 35 72 21 21'],
        commune: 'Prikro',
        city: 'Prikro'
      },
      {
        id: 'inhp-prikro',
        name: 'INHP – Antenne Prikro',
        type: 'public',
        services: 'vaccination, hygiène',
        address: 'Prikro',
        emails: ['prikro@inhp.ci'],
        commune: 'Prikro',
        city: 'Prikro'
      }
    ],
    'Koun-Fao': [
      {
        id: 'hopital-koun-fao',
        name: 'Hôpital Général de Koun-Fao',
        type: 'public',
        services: 'médecine, maternité, pédiatrie, chirurgie de base',
        address: 'Koun-Fao centre',
        phones: ['+225 27 35 94 21 17'],
        commune: 'Koun-Fao',
        city: 'Koun-Fao'
      },
      {
        id: 'inhp-koun-fao',
        name: 'INHP – Antenne Koun-Fao',
        type: 'public',
        services: 'vaccination, hygiène',
        address: 'Koun-Fao',
        emails: ['kounfao@inhp.ci'],
        commune: 'Koun-Fao',
        city: 'Koun-Fao',
        note: 'Cliniques privées : cabinets privés de proximité'
      }
    ],
    'Guibéroua': [
      {
        id: 'hopital-guiberoua',
        name: 'Hôpital Général de Guibéroua',
        type: 'public',
        services: 'médecine générale, maternité, pédiatrie',
        address: 'Guibéroua centre',
        phones: ['+225 27 32 77 21 13'],
        commune: 'Guibéroua',
        city: 'Guibéroua'
      },
      {
        id: 'inhp-guiberoua',
        name: 'INHP – Antenne Guibéroua',
        type: 'public',
        services: 'vaccination, hygiène',
        address: 'Guibéroua',
        emails: ['guiberoua@inhp.ci'],
        commune: 'Guibéroua',
        city: 'Guibéroua'
      }
    ],
    'N\'Douci': [
      {
        id: 'hopital-ndouci',
        name: 'Hôpital Général de N\'Douci',
        type: 'public',
        services: 'médecine générale, maternité, pédiatrie',
        address: 'N\'Douci centre',
        phones: ['+225 27 34 65 21 25'],
        commune: 'N\'Douci',
        city: 'N\'Douci'
      },
      {
        id: 'inhp-ndouci',
        name: 'INHP – Antenne N\'Douci',
        type: 'public',
        services: 'vaccination, hygiène',
        address: 'N\'Douci',
        emails: ['ndouci@inhp.ci'],
        commune: 'N\'Douci',
        city: 'N\'Douci'
      }
    ],
    'Grabo': [
      {
        id: 'hopital-grabo',
        name: 'Hôpital Général de Grabo',
        type: 'public',
        services: 'médecine générale, maternité, pédiatrie, urgences',
        address: 'Grabo centre',
        phones: ['+225 27 34 73 21 14'],
        commune: 'Grabo',
        city: 'Grabo'
      },
      {
        id: 'inhp-grabo',
        name: 'INHP – Antenne Grabo',
        type: 'public',
        services: 'vaccination, hygiène',
        address: 'Grabo',
        emails: ['grabo@inhp.ci'],
        commune: 'Grabo',
        city: 'Grabo'
      }
    ]
  };


  // Établissements scolaires par ville/commune (échantillon)
  const schoolFacilitiesByCommune: Record<string, any[]> = {
    'Abidjan': [], // placeholder for direct mode if needed
    'Cocody': [
      {
        id: 'lycee-classique',
        name: "Lycée Classique d'Abidjan",
        type: 'public',
        eduType: 'college_lycee',
        services: 'Secondaire général, séries Littéraires & Scientifiques',
        address: 'Bd de l’Université, Cocody',
        phones: ['+225 27 22 44 00 00'],
        commune: 'Cocody',
        city: 'Abidjan',
      },
      {
        id: 'insaac',
        name: 'INSAAC – Institut National Supérieur des Arts et de l’Action Culturelle',
        type: 'public',
        eduType: 'formation',
        services: 'Formations supérieures artistiques et culturelles',
        address: 'Cocody, près de RTI',
        website: 'https://www.insaac.ci',
        commune: 'Cocody',
        city: 'Abidjan',
      },
    ],
    'Yopougon': [
      {
        id: 'lycee-moderne-yop',
        name: 'Lycée Moderne de Yopougon',
        type: 'public',
        eduType: 'college_lycee',
        services: 'Secondaire général',
        address: 'Yopougon',
        phones: ['+225 27 23 45 67 89'],
        commune: 'Yopougon',
        city: 'Abidjan',
      },
      {
        id: 'groupe-scolaire-prive-yop',
        name: 'Groupe Scolaire Privé Académie Yopougon',
        type: 'prive',
        services: 'Maternelle, Primaire, Collège',
        address: 'Yopougon',
        commune: 'Yopougon',
        city: 'Abidjan',
      },
    ],
    'Marcory': [
      {
        id: 'lycee-moderne-marcory',
        name: 'Lycée Moderne de Marcory',
        type: 'public',
        eduType: 'college_lycee',
        services: 'Secondaire général',
        address: 'Marcory Résidentiel',
        commune: 'Marcory',
        city: 'Abidjan',
      },
      {
        id: 'ecole-privee-saint-marc',
        name: 'École Privée Saint-Marc',
        type: 'prive',
        eduType: 'scolaire',
        services: 'Maternelle, Primaire',
        address: 'Marcory Zone 4',
        commune: 'Marcory',
        city: 'Abidjan',
      }
    ],
    'Koumassi': [
      {
        id: 'lycee-moderne-koumassi',
        name: 'Lycée Moderne de Koumassi',
        type: 'public',
        eduType: 'college_lycee',
        services: 'Secondaire général',
        address: 'Koumassi Quartier Divo',
        commune: 'Koumassi',
        city: 'Abidjan',
      },
      {
        id: 'cfp-koumassi',
        name: 'Centre de Formation Professionnelle de Koumassi',
        type: 'public',
        eduType: 'formation',
        services: 'Formations qualifiantes & techniques',
        address: 'Koumassi Sicogi',
        commune: 'Koumassi',
        city: 'Abidjan',
      }
    ],
    'Plateau': [
      {
        id: 'lycee-technique-plateau',
        name: 'Lycée Technique d’Abidjan',
        type: 'public',
        eduType: 'formation',
        services: 'Formations techniques & professionnelles',
        address: 'Plateau, Bd de la République',
        commune: 'Plateau',
        city: 'Abidjan',
      },
      {
        id: 'ecole-privee-le-plateau',
        name: 'École Privée Le Plateau',
        type: 'prive',
        eduType: 'scolaire',
        services: 'Maternelle, Primaire',
        address: 'Avenue Lamblin, Plateau',
        commune: 'Plateau',
        city: 'Abidjan',
      }
    ],
    // Autres villes
    'Bouaké': [
      {
        id: 'lycee-moderne-bouake',
        name: 'Lycée Moderne de Bouaké',
        type: 'public',
        eduType: 'college_lycee',
        services: 'Secondaire général',
        address: 'Bouaké centre',
        city: 'Bouaké',
      },
      {
        id: 'groupe-scolaire-prive-bouake',
        name: 'Groupe Scolaire Privé Notre Avenir',
        type: 'prive',
        eduType: 'scolaire',
        services: 'Maternelle, Primaire',
        address: 'Bouaké Koko',
        city: 'Bouaké',
      }
    ],
    'Yamoussoukro': [
      {
        id: 'lycee-scientifique-yao',
        name: 'Lycée Scientifique de Yamoussoukro',
        type: 'public',
        eduType: 'college_lycee',
        services: 'Secondaire scientifique d’excellence',
        address: 'Yamoussoukro',
        city: 'Yamoussoukro',
      },
      {
        id: 'cfp-yamoussoukro',
        name: 'Centre de Formation Professionnelle de Yamoussoukro',
        type: 'public',
        eduType: 'formation',
        services: 'Formations qualifiantes & techniques',
        address: 'Yamoussoukro',
        city: 'Yamoussoukro',
      }
    ],
    'San Pedro': [
      {
        id: 'lycee-moderne-sanpedro',
        name: 'Lycée Moderne de San Pedro',
        type: 'public',
        eduType: 'college_lycee',
        services: 'Secondaire général',
        address: 'San Pedro centre',
        city: 'San Pedro',
      },
      {
        id: 'ecole-privee-sapphire',
        name: 'École Privée Sapphire',
        type: 'prive',
        eduType: 'scolaire',
        services: 'Maternelle, Primaire',
        address: 'Quartier Bardot, San Pedro',
        city: 'San Pedro',
      }
    ],

    'Treichville': [
      {
        id: 'cfp-treich',
        name: 'Centre de Formation Professionnelle de Treichville',
        type: 'formation',
        services: 'Formations qualifiantes, techniques & professionnelles',
        address: 'Treichville',
        commune: 'Treichville',
        city: 'Abidjan',
      },
    ],
    // Mode direct pour quelques villes
    'Divo': [
      {
        id: 'lycee-moderne-divo',
        name: 'Lycée Moderne de Divo',
        type: 'public',
        services: 'Secondaire général',
        address: 'Divo centre',
        city: 'Divo',
      },
      {
        id: 'groupe-scolaire-prive-divo',
        name: 'Groupe Scolaire Privé Les Étoiles',
        type: 'prive',
        services: 'Maternelle, Primaire',
        address: 'Quartier Résidentiel, Divo',
        city: 'Divo',
    'Korhogo': [
      {
        id: 'lycee-moderne-korhogo',
        name: 'Lycée Moderne de Korhogo',
        type: 'public',
        eduType: 'college_lycee',
        services: 'Secondaire général',
        address: 'Korhogo centre',
        city: 'Korhogo',
      },
      {
        id: 'groupe-scolaire-prive-korhogo',
        name: 'Groupe Scolaire Privé Poro',
        type: 'prive',
        eduType: 'scolaire',
        services: 'Maternelle, Primaire',
        address: 'Quartier Soba, Korhogo',
        city: 'Korhogo',
      },
      {
        id: 'cfp-korhogo',
        name: 'Centre de Formation Professionnelle de Korhogo',
        type: 'public',
        eduType: 'formation',
        services: 'Formations techniques & professionnelles',
        address: 'Korhogo',
        city: 'Korhogo',
      }
    ],
    'Daloa': [
      {
        id: 'lycee-moderne-daloa',
        name: 'Lycée Moderne de Daloa',
        type: 'public',
        eduType: 'college_lycee',
        services: 'Secondaire général',
        address: 'Daloa centre',
        city: 'Daloa',
      },
      {
        id: 'ecole-privee-daloa',
        name: 'École Privée La Cité des Anges',
        type: 'prive',
        eduType: 'scolaire',
        services: 'Maternelle, Primaire',
        address: 'Quartier Kennedy, Daloa',
        city: 'Daloa',
      },
      {
        id: 'cfp-daloa',
        name: 'Centre de Formation Professionnelle de Daloa',
        type: 'public',
        eduType: 'formation',
        services: 'Formations qualifiantes & techniques',
        address: 'Daloa',
        city: 'Daloa',
      }
    ],
    'Man': [
      {
        id: 'lycee-moderne-man',
        name: 'Lycée Moderne de Man',
        type: 'public',
        eduType: 'college_lycee',
        services: 'Secondaire général',
        address: 'Man centre',
        city: 'Man',
      },
      {
        id: 'cfp-man',
        name: 'Centre de Formation Professionnelle de Man',
        type: 'public',
        eduType: 'formation',
        services: 'Formations techniques & professionnelles',
        address: 'Man',
        city: 'Man',
      },
      {
        id: 'ecole-privee-montagnes',
        name: 'École Privée Les Montagnes',
        type: 'prive',
        eduType: 'scolaire',
        services: 'Maternelle, Primaire',
        address: 'Quartier Lycée, Man',
        city: 'Man',
      }
    ],
    'Gagnoa': [
      {
        id: 'lycee-moderne-gagnoa',
        name: 'Lycée Moderne de Gagnoa',
        type: 'public',
        eduType: 'college_lycee',
        services: 'Secondaire général',
        address: 'Gagnoa centre',
        city: 'Gagnoa',
      },
      {
        id: 'groupe-scolaire-prive-elite-gagnoa',
        name: 'Groupe Scolaire Privé Les Élites',
        type: 'prive',
        eduType: 'scolaire',
        services: 'Maternelle, Primaire',
        address: 'Quartier Garahio, Gagnoa',
        city: 'Gagnoa',
      },
      {
        id: 'cfp-gagnoa',
        name: 'Centre de Formation Professionnelle de Gagnoa',
        type: 'public',
        eduType: 'formation',
        services: 'Formations qualifiantes & techniques',
        address: 'Gagnoa',
        city: 'Gagnoa',
      }
    ],
    'Abengourou': [
      {
        id: 'lycee-moderne-abengourou',
        name: 'Lycée Moderne d’Abengourou',
        type: 'public',
        eduType: 'college_lycee',
        services: 'Secondaire général',
        address: 'Abengourou centre',
        city: 'Abengourou',
      },
      {
        id: 'ecole-privee-sainte-marie-abg',
        name: 'École Privée Sainte-Marie',
        type: 'prive',
        eduType: 'scolaire',
        services: 'Maternelle, Primaire',
        address: 'Quartier Plateau, Abengourou',
        city: 'Abengourou',
      },
      {
        id: 'cfp-abengourou',
        name: 'Centre de Formation Professionnelle d’Abengourou',
        type: 'public',
        eduType: 'formation',
        services: 'Formations techniques & professionnelles',
        address: 'Abengourou',
        city: 'Abengourou',
      }
    ],
    'Odienné': [
      {
        id: 'lycee-moderne-odienne',
        name: 'Lycée Moderne d’Odienné',
        type: 'public',
        eduType: 'college_lycee',
        services: 'Secondaire général',
        address: 'Odienné centre',
        city: 'Odienné',
      },
      {
        id: 'cfp-odienne',
        name: 'Centre de Formation Professionnelle d’Odienné',
        type: 'public',
        eduType: 'formation',
        services: 'Formations techniques & professionnelles',
        address: 'Odienné',
        city: 'Odienné',
      },
      {
        id: 'ecole-privee-bafing',
        name: 'École Privée du Bafing',
        type: 'prive',
        eduType: 'scolaire',
        services: 'Maternelle, Primaire',
        address: 'Quartier Résidentiel, Odienné',
        city: 'Odienné',
      }
    ],

      },
    ],
  };

  const userSelectedCity = effectiveCity || 'Abidjan';
  
  // Règle demandée: Seule Abidjan utilise les communes, toutes les autres villes affichent directement leurs établissements
  // Normalisation simple (insensible aux accents/majuscules) pour fiabiliser la correspondance de ville
  const normCity = (s: string) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();

  const isAbidjan = normCity(userSelectedCity) === normCity('Abidjan');
  const matchedCityKey = Object.keys(healthFacilitiesByCommune).find(k => normCity(k) === normCity(userSelectedCity)) || null;
  const cityHasFacilities = !!matchedCityKey;

  // Si la ville sélectionnée n'a pas d'établissements connus, fallback sur Abidjan
  const userCity = isAbidjan ? 'Abidjan' : (cityHasFacilities ? (matchedCityKey as string) : 'Abidjan');

  // Communes disponibles uniquement pour Abidjan
  const availableCommunes = isAbidjan ? (communesByCity['Abidjan'] || []) : [];

  // Mode d'affichage: communes uniquement pour Abidjan, direct sinon
  const displayMode: 'communes' | 'direct' = isAbidjan ? 'communes' : 'direct';

  // Filtrage des communes
  const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const filteredCommunes = useMemo(() => {
    if (!communeQuery) return availableCommunes;
    const q = normalize(communeQuery);
    return availableCommunes.filter(c => normalize(c).includes(q));
  }, [communeQuery, availableCommunes]);

  // Obtenir les établissements pour la commune sélectionnée ou directement pour la ville
  const selectedFacilities = useMemo(() => {
    if (displayMode === 'communes') {
      if (mode === 'nearby') return [];
      if (!communeQuery) return [];
      return healthFacilitiesByCommune[communeQuery] || [];
    }
    return healthFacilitiesByCommune[userCity] || [];
  }, [mode, communeQuery, displayMode, userCity]);

  // Sélection pour Éducation (établissements scolaires)
  const selectedSchoolFacilities = useMemo(() => {
    if (displayMode === 'communes') {
      if (mode === 'nearby') return [];
      if (!communeQuery) return [];
      return schoolFacilitiesByCommune[communeQuery] || [];
    }
    return schoolFacilitiesByCommune[userCity] || [];
  }, [mode, communeQuery, displayMode, userCity]);

  // Filtre appliqué par le type d'établissement (Éducation)
  const eduFiltered = useMemo(() => {
    return selectedEduType ? selectedSchoolFacilities.filter(f => f.eduType === selectedEduType) : selectedSchoolFacilities;
  }, [selectedSchoolFacilities, selectedEduType]);

  // Persistance du filtre Éducation
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('@eduType');
        if (saved) setSelectedEduType(saved as any);
      } catch (e) {}
    })();
  }, []);
  useEffect(() => {
    (async () => {
      try {
        if (selectedEduType) await AsyncStorage.setItem('@eduType', selectedEduType);
        else await AsyncStorage.removeItem('@eduType');
      } catch (e) {}
    })();
  }, [selectedEduType]);

  const getBrand = (name?: string): 'orange' | 'mtn' | 'moov' | null => {
    if (!name) return null;
    const n = name.toLowerCase();
    if (n.includes('orange')) return 'orange';
    if (n.includes('mtn')) return 'mtn';
    if (n.includes('moov')) return 'moov';
    return null;
  };


  // Fonctions d'actions
  // ----- Urgence (mise en page sectionnée) -----

  const urgenceSections = useMemo(() => {
    if (s !== 'urgence') return [] as { title: string; data: any[] }[];
    const items = Array.isArray(categoryData) ? categoryData : [];
    const groups: Record<string, any[]> = {};
    items.forEach((it: any) => {
      const key = it?.tag || 'Autres';
      if (!groups[key]) groups[key] = [];
      groups[key].push(it);
    });
    return Object.keys(groups).map((key) => ({ title: key, data: groups[key] }));
  }, [s, categoryData]);



  const renderUrgenceItem = ({ item }: { item: any; index: number }) => {
    const title = item?.title || '';
    const summary = item?.summary || '';
    const source = item?.source;
    const phones: { label?: string; tel?: string }[] = Array.isArray(item?.phones) ? item.phones : [];

    return (
      <View style={styles.urgItemCard}>
        <Text style={styles.urgItemTitle}>{title}</Text>
        {summary ? <Text style={styles.urgItemSummary}>{summary}</Text> : null}
        <View style={styles.cardActions}>
          {phones.map((p, idx) => (
            <TouchableOpacity key={`u-phone-${idx}`} onPress={() => p?.tel && openPhone(p.tel)} style={styles.actionBtn}>
              <Ionicons name="call" size={16} color="#fff" />
              <Text style={styles.actionBtnText}>{p?.label ? `${p.label} • ${p.tel}` : p?.tel || ''}</Text>
            </TouchableOpacity>
          ))}
          {source ? (
            <TouchableOpacity onPress={() => openSource(source)} style={styles.actionBtnAlt}>
              <Ionicons name="globe" size={16} color="#0A7C3A" />
              <Text style={styles.actionBtnAltText}>Site officiel</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  };

  const openPhone = (phone: string) => {
    const cleanPhone = phone.replace(/\s+/g, '');
    Linking.openURL(`tel:${cleanPhone}`);
  };

  const openWebsite = (website: string) => {
    const url = website.startsWith('http') ? website : `https://${website}`;
    Linking.openURL(url);
  };

  const openGoogleMaps = async (lat?: number|null, lng?: number|null, label?: string) => {
    if (lat == null || lng == null) return;
    const query = encodeURIComponent(label || 'Itinéraire');
    const url = Platform.select({
      ios: `http://maps.apple.com/?ll=${lat},${lng}&q=${query}`,
      android: `geo:${lat},${lng}?q=${lat},${lng}(${query})`,
      default: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
    }) as string;
    try { await Linking.openURL(url); } catch (e) {}
  };

  const openSource = async (url?: string) => { if (!url) return; try { await Linking.openURL(url); } catch (e) {} };

  const data = CONTENT_BY_CATEGORY[s] || [];

  const openUSSD = (code: string) => {
    if (!code) return;
    // Encode # for tel: links (especially on Android)
    const encoded = code.replace(/#/g, encodeURIComponent('#'));
    Linking.openURL(`tel:${encoded}`);
  };

  const renderContentItem = ({ item, index }: { item: any; index: number }) => {
    const title: string = item?.title || item?.name || '';
    const summary: string | undefined = item?.summary || item?.description;
    const tag: string | undefined = item?.tag;
    const location: string | undefined = item?.location;
    const date: string | undefined = item?.date;
    const source: string | undefined = item?.source || item?.website;
    const phones: { label?: string; tel?: string }[] = Array.isArray(item?.phones) ? item.phones : [];
    const ussd: { label?: string; code?: string }[] = Array.isArray(item?.ussd) ? item.ussd : [];

    return (
      <View style={styles.contentCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{title}</Text>
          {getBrand(title) && (
            <View style={[
              styles.brandBadge,
              getBrand(title) === 'orange' ? styles.brandOrange : getBrand(title) === 'mtn' ? styles.brandMtn : styles.brandMoov
            ]}>
              <Text style={styles.brandBadgeText}>{getBrand(title)?.toUpperCase()}</Text>
            </View>
          )}
        </View>

        {summary ? (
          <Text style={styles.cardDescription}>{summary}</Text>
        ) : null}

        {(location || date) ? (
          <Text style={styles.cardDescription}>
            {location ? `${location}` : ''}
            {location && date ? ' • ' : ''}
            {date ? `${date}` : ''}
          </Text>
        ) : null}

        {/* Actions */}
        <View style={styles.cardActions}>
          {phones.map((p, idx) => (
            <TouchableOpacity key={`phone-${idx}`} onPress={() => p?.tel && openPhone(p.tel)} style={styles.actionBtn}>
              <Ionicons name="call" size={16} color="#fff" />
              <Text style={styles.actionBtnText}>{p?.label ? `${p.label} • ${p.tel}` : p?.tel || ''}</Text>
            </TouchableOpacity>
          ))}

          {ussd.map((u, idx) => (
            <TouchableOpacity key={`ussd-${idx}`} onPress={() => u?.code && openUSSD(u.code)} style={styles.actionBtnAlt}>
              <Ionicons name="keypad" size={16} color="#0D6EFD" />
              <Text style={styles.actionBtnAltText}>{u?.label ? `${u.label} • ${u.code}` : u?.code || ''}</Text>
            </TouchableOpacity>
          ))}

          {source ? (
            <TouchableOpacity onPress={() => openSource(source)} style={styles.actionBtnAlt}>
              <Ionicons name="globe" size={16} color="#0A7C3A" />
              <Text style={styles.actionBtnAltText}>Site officiel</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  };

  // Choix de l'image d'en-tête selon la catégorie
  const backgroundImages: Record<string, any> = {
    pharmacies: require('../../assets/headers/pharmacies_header.png'),
    sante: { uri: 'https://customer-assets.emergentagent.com/job_allo-assistance/artifacts/bgconh5v_santebis_bg.png' },
    urgence: require('../../assets/headers/headers/urgence_bg.png'),
    transport: { uri: 'https://customer-assets.emergentagent.com/job_allo-assistance/artifacts/b4gvhwle_transport_bg.png' },
    alertes: require('../../assets/headers/headers/alertes_bg.png'),
    examens_concours: { uri: 'https://customer-assets.emergentagent.com/job_allo-assistance/artifacts/if6ljosz_examens_concours_bg.png' },
    education: { uri: 'https://customer-assets.emergentagent.com/job_allo-assistance/artifacts/wdyf0nu5_education_bg.png' },
    services_utiles: { uri: 'https://customer-assets.emergentagent.com/job_allo-assistance/artifacts/d23v2qjj_services_utiles_bg.png' },
    agriculture: { uri: 'https://customer-assets.emergentagent.com/job_allo-assistance/artifacts/6bg34mgh_agriculture_bg.png' },
    loisirs_tourisme: { uri: 'https://customer-assets.emergentagent.com/job_allo-assistance/artifacts/s7mbb0g4_loisirs_bg.png' },
    services_publics: { uri: 'https://customer-assets.emergentagent.com/job_allo-assistance/artifacts/7mhah4lt_services_publics_bg.png' },
    emplois_offres: { uri: 'https://customer-assets.emergentagent.com/job_allo-assistance/artifacts/wexk9qlh_emplois_offres_bg.png' },
  };

  // Assure alias support (e.g., loisir_tourisme, loisirs-tourisme)
  const slugAliases: Record<string, string> = {
    'loisir_tourisme': 'loisirs_tourisme',
    'loisir-tourisme': 'loisirs_tourisme',
    'loisirs-tourisme': 'loisirs_tourisme',
    'emplois': 'emplois_offres',
    'emploi': 'emplois_offres',
    'offres': 'emplois_offres',
    'emplois-offres': 'emplois_offres',
    'offres-emploi': 'emplois_offres',
  };
  const sKey = slugAliases[s] || s;
  const bg = backgroundImages[sKey] || COMMON_HEADER;

  const fixedHeaderKeys = ['urgence','sante','education','examens_concours','agriculture','loisirs_tourisme','transport','services_publics','emplois_offres'];
  const padTop = fixedHeaderKeys.includes(sKey) ? (sKey === 'education' ? eduHeaderHeight : (sKey === 'sante' ? 270 : 250)) : 0;

  return (
    <View style={styles.container}>
      {/* En-tête avec image */}
      {sKey === 'urgence' ? (
        <View style={styles.headerWrapperUrgence}>
          <ImageBackground source={bg} style={styles.headerUrgence} resizeMode="cover" />
          <TouchableOpacity onPress={() => router.replace('/(tabs)/home')} accessibilityRole="button" accessibilityLabel="Retour" testID={`backBtn-${sKey}`} style={styles.backBtnUrgence}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : sKey === 'sante' ? (
        <View style={styles.headerWrapperSante}>
          <ImageBackground source={bg} style={styles.header} resizeMode="cover" />
          <TouchableOpacity onPress={() => router.replace('/(tabs)/home')} accessibilityRole="button" accessibilityLabel="Retour" testID={`backBtn-${sKey}`} style={styles.backBtnUrgence}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : sKey === 'education' ? (
        <View style={styles.headerWrapperEducation}>
          <ImageBackground source={bg} style={styles.header} resizeMode="cover">
            <View style={styles.eduListOverlay}>
              <Text style={styles.eduListText}>• Etablissements scolaires</Text>
              <Text style={styles.eduListText}>• Collèges et Lycées</Text>
              <Text style={styles.eduListText}>• Universités</Text>
              <Text style={styles.eduListText}>• Centres de Formations</Text>
            </View>
          </ImageBackground>
          <TouchableOpacity onPress={() => router.replace('/(tabs)/home')} accessibilityRole="button" accessibilityLabel="Retour" testID={`backBtn-${sKey}`} style={styles.backBtnUrgence}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : sKey === 'examens_concours' ? (
        <View style={styles.headerWrapperExamens}>
          <ImageBackground source={bg} style={styles.header} resizeMode="cover" />
          <TouchableOpacity onPress={() => router.replace('/(tabs)/home')} accessibilityRole="button" accessibilityLabel="Retour" testID={`backBtn-${sKey}`} style={styles.backBtnUrgence}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : sKey === 'agriculture' ? (
        <View style={styles.headerWrapperAgriculture}>
          <ImageBackground source={bg} style={styles.header} resizeMode="cover" />
          <TouchableOpacity onPress={() => router.replace('/(tabs)/home')} accessibilityRole="button" accessibilityLabel="Retour" testID={`backBtn-${sKey}`} style={styles.backBtnUrgence}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : sKey === 'loisirs_tourisme' ? (
        <View style={styles.headerWrapperLoisirs}>
          <ImageBackground source={bg} style={styles.header} resizeMode="cover" />
        </View>
      ) : sKey === 'transport' ? (
        <View style={styles.headerWrapperTransport}>
          <ImageBackground source={bg} style={styles.header} resizeMode="cover" />
        </View>
      ) : sKey === 'services_publics' ? (
        <View style={styles.headerWrapperServices}>
          <ImageBackground source={bg} style={styles.header} resizeMode="cover" />
        </View>
      ) : sKey === 'emplois_offres' ? (
        <View style={styles.headerWrapperEmplois}>
          <ImageBackground source={bg} style={styles.header} resizeMode="cover" />
        </View>
      ) : (
        <ImageBackground source={bg} style={styles.header} resizeMode="cover">
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} style={styles.headerGradient}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>{t(`categories.${sKey}`)}</Text>
              <Text style={styles.headerSubtitle}>Services disponibles en Côte d'Ivoire</Text>
            </View>
          </LinearGradient>
        </ImageBackground>
      )}

      {/* Contenu spécifique par catégorie */}
      {sKey === 'urgence' ? (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: padTop, paddingHorizontal: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {(CONTENT_BY_CATEGORY[s] || []).map((item, idx) => (
            <View key={`urg-card-${idx}`}>{renderContentItem({ item, index: idx } as any)}</View>
          ))}
        </ScrollView>
      ) : sKey === 'sante' ? (
        <View style={{ flex: 1, padding: 16, paddingTop: padTop + 20 }}>
          {/* Filtres (capsules) */}
          {displayMode === 'communes' && (
            <View style={{ marginBottom: 12 }}>
              <View style={[styles.filtersRowAligned, { justifyContent: 'flex-start' }]}>
                <TouchableOpacity 
                  onPress={() => setMode('nearby')} 
                  style={[styles.chip, mode === 'nearby' ? styles.chipNear : styles.chipInactive]}
                >
                  <Ionicons name="location-outline" size={16} color={mode === 'nearby' ? '#0D6EFD' : '#666'} style={{ marginRight: 8 }} />
                  <Text style={mode === 'nearby' ? styles.chipTextNear : styles.chipTextInactive}>Autour de moi</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setMode('commune')} 
                  style={[styles.chip, mode === 'commune' ? styles.chipCommune : styles.chipInactive]}
                >
                  <Ionicons name="map-outline" size={16} color={mode === 'commune' ? '#0A7C3A' : '#666'} style={{ marginRight: 8 }} />
                  <Text style={mode === 'commune' ? styles.chipTextCommune : styles.chipTextInactive}>Communes</Text>
                </TouchableOpacity>
                {(mode === 'commune' && communeQuery) && (
                  <TouchableOpacity 
                    onPress={resetFilters} 
                    style={{ paddingHorizontal: 4, paddingVertical: 4 }}
                  >
                    <Ionicons name="refresh-outline" size={18} color="#000" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Localités (en dessous des capsules) */}
          <View style={{ marginBottom: 4 }}>
            <Text style={styles.locationText}>
              <Text style={{ fontWeight: '700', color: '#0A7C3A' }}>Localités: </Text>
              <Text style={{ color: '#555' }}>{userCity}</Text>
              {displayMode === 'direct' && userSelectedCity !== userCity && (
                <Text style={{ color: '#FF8A00', fontSize: 13, fontStyle: 'italic' }}>
                  {' '}(données par défaut - {userSelectedCity} non disponible)
                </Text>
              )}
            </Text>
          </View>


          {/* Barre de recherche communes (visible seulement en mode commune ET si la ville a des communes) */}
          {displayMode === 'communes' && mode === 'commune' && (showCommuneSuggestions || !communeChosen || selectedFacilities.length === 0) && (
            <View style={{ marginTop: 16 }}>
              <Text style={styles.searchLabel}>Rechercher une commune</Text>
              <View style={styles.searchContainer}>
                <TextInput
                  value={communeQuery}
                  onChangeText={(text) => {
                    setCommuneQuery(text);
                    setShowCommuneSuggestions(true);
                  }}
                  onFocus={() => setShowCommuneSuggestions(true)}
                  placeholder={`Rechercher dans ${userCity}...`}
                  style={styles.searchInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {communeQuery.length > 0 && (
                  <TouchableOpacity 
                    onPress={() => {
                      setCommuneQuery('');
                      setShowCommuneSuggestions(false);
                    }} 
                    style={styles.clearButton}
                  >
                    <Ionicons name="close-circle" size={20} color="#666" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Suggestions de communes */}
              {showCommuneSuggestions && communeQuery.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                    {filteredCommunes.length > 0 ? (
                      filteredCommunes.map((commune, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => {
                            setCommuneQuery(commune);
                            setShowCommuneSuggestions(false);
                          }}
                          style={styles.suggestionItem}
                        >
                          <Text style={styles.suggestionText}>{commune}</Text>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <View style={styles.suggestionItem}>
                        <Text style={[styles.suggestionText, { color: '#999' }]}>Aucune commune trouvée</Text>
                      </View>
                    )}
                  </ScrollView>
                </View>
              )}
            </View>
          )}

          {/* Contenu principal */}
          {displayMode === 'communes' ? (
            // Mode avec communes (comme Abidjan)
            mode === 'nearby' ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 }}>
                <Text style={{ color: '#666', fontSize: 16, textAlign: 'center' }}>
                  Recherche d'établissements de santé autour de vous dans {userCity}...
                </Text>
                <Text style={{ color: '#999', fontSize: 14, textAlign: 'center', marginTop: 8 }}>
                  Fonctionnalité en cours de développement
                </Text>
              </View>
            ) : (
              <View style={{ flex: 1, marginTop: 20 }}>
                {selectedFacilities.length > 0 ? (
                  <>
                    <Text style={styles.facilitiesCount}>
                      {selectedFacilities.length} établissement{selectedFacilities.length > 1 ? 's' : ''} trouvé{selectedFacilities.length > 1 ? 's' : ''} à {communeQuery}
                    </Text>
                    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                      {selectedFacilities.map((facility) => (
                        <View key={facility.id} style={styles.facilityCard}>
                          {/* En-tête avec nom et type */}
                          <View style={styles.facilityHeader}>
                            <Text style={styles.facilityName}>{facility.name}</Text>
                            <View style={[styles.typeBadge, facility.type === 'public' ? styles.badgePublic : styles.badgeClinic]}>
                              <Text style={styles.typeBadgeText}>
                                {facility.type === 'public' ? 'Public' : 'Clinique'}
                              </Text>
                            </View>
                          </View>

                          {/* Services */}
                          {facility.services && (
                            <Text style={styles.facilityServices}>
                              <Text style={{ fontWeight: '600', color: '#0A7C3A' }}>Services: </Text>
                              {facility.services}
                            </Text>
                          )}

                          {/* Adresse */}
                          {facility.address && (
                            <Text style={styles.facilityAddress}>
                              <Ionicons name="location-outline" size={14} color="#666" />
                              {' '}{facility.address}
                            </Text>
                          )}

                          {/* Note supplémentaire */}
                          {facility.note && (
                            <Text style={styles.facilityNote}>
                              <Ionicons name="information-circle-outline" size={14} color="#FF8A00" />
                              {' '}{facility.note}
                            </Text>
                          )}

                          {/* Actions */}
                          <View style={styles.facilityActions}>
                            {/* Téléphones */}
                            {facility.phones && facility.phones.map((phone: string, index: number) => (
                              <TouchableOpacity
                                key={index}
                                onPress={() => openPhone(phone)}
                                style={styles.actionButton}
                              >
                                <Ionicons name="call" size={16} color="#fff" />
                                <Text style={styles.actionButtonText}>
                                  {phone}
                                </Text>
                              </TouchableOpacity>
                            ))}

                            {/* Emails */}
                            {facility.emails && facility.emails.map((email: string, index: number) => (
                              <TouchableOpacity
                                key={index}
                                onPress={() => Linking.openURL(`mailto:${email}`)}
                                style={styles.actionButtonAlt}
                              >
                                <Ionicons name="mail" size={16} color="#0A7C3A" />
                                <Text style={styles.actionButtonAltText}>
                                  {email}
                                </Text>
                              </TouchableOpacity>
                            ))}

                            {/* Site web */}
                            {facility.website && (
                              <TouchableOpacity
                                onPress={() => openWebsite(facility.website)}
                                style={styles.actionButtonAlt}
                              >
                                <Ionicons name="globe" size={16} color="#0A7C3A" />
                                <Text style={styles.actionButtonAltText}>
                                  {facility.website}
                                </Text>
                              </TouchableOpacity>
                            )}

                            {/* GPS */}
                            {facility.lat && facility.lng && (
                              <TouchableOpacity
                                onPress={() => openGoogleMaps(facility.lat, facility.lng, facility.name)}
                                style={styles.actionButtonAlt}
                              >
                                <Ionicons name="navigate" size={16} color="#0A7C3A" />
                                <Text style={styles.actionButtonAltText}>
                                  Itinéraire GPS
                                </Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>
                      ))}
                    </ScrollView>
                  </>
                ) : communeQuery ? (
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 }}>
                    <Text style={{ color: '#666', fontSize: 16, textAlign: 'center' }}>
                      Aucun établissement de santé disponible pour {communeQuery}
                    </Text>
                    <Text style={{ color: '#999', fontSize: 14, textAlign: 'center', marginTop: 8 }}>
                      Essayez une autre commune comme Cocody
                    </Text>
                  </View>
                ) : (
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 }}>
                    <Text style={{ color: '#666', fontSize: 16, textAlign: 'center' }}>
                      Sélectionnez une commune pour voir les établissements de santé
                    </Text>
                  </View>
                )}
              </View>
            )
          ) : (
            // Mode direct (villes comme Divo, Ferkessédougou)
            <View style={{ flex: 1, marginTop: 20 }}>
              {selectedFacilities.length > 0 ? (
                <>
                  <Text style={styles.facilitiesCount}>
                    {selectedFacilities.length} établissement{selectedFacilities.length > 1 ? 's' : ''} trouvé{selectedFacilities.length > 1 ? 's' : ''} à {userCity}
                  </Text>
                  <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                    {selectedFacilities.map((facility) => (
                      <View key={facility.id} style={styles.facilityCard}>
                        {/* En-tête avec nom et type */}
                        <View style={styles.facilityHeader}>
                          <Text style={styles.facilityName}>{facility.name}</Text>
                          <View style={[styles.typeBadge, facility.type === 'public' ? styles.badgePublic : styles.badgeClinic]}>
                            <Text style={styles.typeBadgeText}>
                              {facility.type === 'public' ? 'Public' : 'Clinique'}
                            </Text>
                          </View>
                        </View>

                        {/* Services */}
                        {facility.services && (
                          <Text style={styles.facilityServices}>
                            <Text style={{ fontWeight: '600', color: '#0A7C3A' }}>Services: </Text>
                            {facility.services}
                          </Text>
                        )}

                        {/* Adresse */}
                        {facility.address && (
                          <Text style={styles.facilityAddress}>
                            <Ionicons name="location-outline" size={14} color="#666" />
                            {' '}{facility.address}
                          </Text>
                        )}

                        {/* Note supplémentaire */}
                        {facility.note && (
                          <Text style={styles.facilityNote}>
                            <Ionicons name="information-circle-outline" size={14} color="#FF8A00" />
                            {' '}{facility.note}
                          </Text>
                        )}

                        {/* Actions */}
                        <View style={styles.facilityActions}>
                          {/* Téléphones */}
                          {facility.phones && facility.phones.map((phone: string, index: number) => (
                            <TouchableOpacity
                              key={index}
                              onPress={() => openPhone(phone)}
                              style={styles.actionButton}
                            >
                              <Ionicons name="call" size={16} color="#fff" />
                              <Text style={styles.actionButtonText}>
                                {phone}
                              </Text>
                            </TouchableOpacity>
                          ))}

                          {/* Emails */}
                          {facility.emails && facility.emails.map((email: string, index: number) => (
                            <TouchableOpacity
                              key={index}
                              onPress={() => Linking.openURL(`mailto:${email}`)}
                              style={styles.actionButtonAlt}
                            >
                              <Ionicons name="mail" size={16} color="#0A7C3A" />
                              <Text style={styles.actionButtonAltText}>
                                {email}
                              </Text>
                            </TouchableOpacity>
                          ))}

                          {/* Site web */}
                          {facility.website && (
                            <TouchableOpacity
                              onPress={() => openWebsite(facility.website)}
                              style={styles.actionButtonAlt}
                            >
                              <Ionicons name="globe" size={16} color="#0A7C3A" />
                              <Text style={styles.actionButtonAltText}>
                                {facility.website}
                              </Text>
                            </TouchableOpacity>
                          )}

                          {/* GPS */}
                          {facility.lat && facility.lng && (
                            <TouchableOpacity
                              onPress={() => openGoogleMaps(facility.lat, facility.lng, facility.name)}
                              style={styles.actionButtonAlt}
                            >
                              <Ionicons name="navigate" size={16} color="#0A7C3A" />
                              <Text style={styles.actionButtonAltText}>
                                Itinéraire GPS
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                </>
              ) : (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 }}>
                  <Text style={{ color: '#666', fontSize: 16, textAlign: 'center' }}>
                    Aucun établissement de santé disponible pour {userCity}
                  </Text>
                  <Text style={{ color: '#999', fontSize: 14, textAlign: 'center', marginTop: 8 }}>
                    Données en cours d'ajout
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      ) : sKey === 'education' ? (
        <FlatList
          data={displayMode === 'communes' ? (mode === 'commune' ? eduFiltered : []) : eduFiltered}
          keyExtractor={(item: any, idx: number) => (item?.id ? String(item.id) : `edu-${idx}`)}
          contentContainerStyle={{ paddingTop: padTop + 20, paddingHorizontal: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: facility }: any) => (
            <View style={styles.facilityCard}>
              <View style={styles.facilityHeader}>
                <Text style={styles.facilityName}>{facility.name}</Text>
                <View style={[styles.typeBadge, facility.eduType === 'formation' ? styles.eduBadgeFormation : (facility.type === 'public' ? styles.eduBadgePublic : styles.eduBadgePrive)]}>
                  <Text style={styles.typeBadgeText}>
                    {facility.type === 'public' ? 'Public' : (facility.type === 'prive' ? 'Privé' : (facility.type === 'formation' ? 'Form. prof.' : (facility.type || 'Autre')))}
                  </Text>
                </View>
              </View>
              {facility.services && (
                <Text style={styles.facilityServices}>
                  <Text style={{ fontWeight: '600', color: '#0A7C3A' }}>Niveaux: </Text>
                  {facility.services}
                </Text>
              )}
              {facility.address && (
                <Text style={styles.facilityAddress}>
                  <Ionicons name="location-outline" size={14} color="#666" /> {facility.address}
                </Text>
              )}
              <View style={styles.facilityActions}>
                {facility.phones && facility.phones.map((phone: string, index: number) => (
                  <TouchableOpacity key={index} onPress={() => openPhone(phone)} style={styles.actionButton}>
                    <Ionicons name="call" size={16} color="#fff" />
                    <Text style={styles.actionButtonText}>{phone}</Text>
                  </TouchableOpacity>
                ))}
                {facility.website && (
                  <TouchableOpacity onPress={() => openWebsite(facility.website)} style={styles.actionButtonAlt}>
                    <Ionicons name="globe" size={16} color="#0A7C3A" />
                    <Text style={styles.actionButtonAltText}>{facility.website}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
          ListHeaderComponent={
            <View>
              {eduUIHidden && (
                <View style={{ marginBottom: 8 }}>
                  <TouchableOpacity onPress={() => setEduUIHidden(false)} style={{ alignSelf: 'flex-start', padding: 6 }}>
                    <Ionicons name="filter-outline" size={18} color="#0A7C3A" />
                  </TouchableOpacity>
                </View>
              )}
              {displayMode === 'communes' && (
                <View style={{ marginBottom: 12 }}>
                  <View style={[styles.filtersRowAligned, eduUIHidden && { display: 'none' }, { justifyContent: 'flex-start' }]}> 
                    <TouchableOpacity onPress={() => setMode('nearby')} style={[styles.chip, mode === 'nearby' ? styles.chipNear : styles.chipInactive]}>
                      <Ionicons name="location-outline" size={16} color={mode === 'nearby' ? '#0D6EFD' : '#666'} style={{ marginRight: 8 }} />
                      <Text style={mode === 'nearby' ? styles.chipTextNear : styles.chipTextInactive}>Autour de moi</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setMode('commune')} style={[styles.chip, mode === 'commune' ? styles.chipCommune : styles.chipInactive]}>
                      <Ionicons name="map-outline" size={16} color={mode === 'commune' ? '#0A7C3A' : '#666'} style={{ marginRight: 8 }} />
                      <Text style={mode === 'commune' ? styles.chipTextCommune : styles.chipTextInactive}>Communes</Text>
                    </TouchableOpacity>
                    {(mode === 'commune' && communeQuery) && (
                      <TouchableOpacity onPress={resetFilters} style={{ paddingHorizontal: 4, paddingVertical: 4 }}>
                        <Ionicons name="refresh-outline" size={18} color="#000" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
              <View style={{ marginBottom: 4 }}>
                <Text style={styles.locationText}>
                  <Text style={{ fontWeight: '700', color: '#0A7C3A' }}>Localités: </Text>
                  <Text style={{ color: '#555' }}>{userCity}</Text>
                  {displayMode === 'direct' && userSelectedCity !== userCity && (
                    <Text style={{ color: '#FF8A00', fontSize: 13, fontStyle: 'italic' }}>
                      {' '}(données par défaut - {userSelectedCity} non disponible)
                    </Text>
                  )}
                </Text>
              </View>
              <View style={{ marginBottom: 8 }}>
                <Text style={{ color: '#0A7C3A', fontWeight: '700', marginBottom: 6 }}>Établissement :</Text>
                {[
                  { key: 'scolaire', label: 'Scolaires' },
                  { key: 'college_lycee', label: 'Collèges & Lycées' },
                  { key: 'formation', label: 'Formation technique & professionnelle' },
                ].map(opt => (
                  <TouchableOpacity key={opt.key} testID={`edu-radio-${opt.key}`} onPress={() => setSelectedEduType(selectedEduType === opt.key ? null : (opt.key as any))} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
                    <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#0A7C3A', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                      {selectedEduType === opt.key && (<View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#0A7C3A' }} />)}
                    </View>
                    <Text style={{ fontSize: 14, color: '#0A7C3A', fontWeight: '600' }}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {displayMode === 'communes' && mode === 'commune' && (showCommuneSuggestions || !communeChosen || selectedFacilities.length === 0) && (
                <View style={{ marginTop: 16 }}>
                  <Text style={styles.searchLabel}>Rechercher une commune</Text>
                  <View style={styles.searchContainer}>
                    <TextInput
                      value={communeQuery}
                      onChangeText={(text) => { setCommuneQuery(text); setShowCommuneSuggestions(true); setCommuneChosen(false); }}
                      onFocus={() => setShowCommuneSuggestions(true)}
                      placeholder={`Rechercher dans ${userCity}...`}
                      style={styles.searchInput}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    {communeQuery.length > 0 && (
                      <TouchableOpacity onPress={() => { setCommuneQuery(''); setShowCommuneSuggestions(false); }} style={styles.clearButton}>
                        <Ionicons name="close-circle" size={20} color="#666" />
                      </TouchableOpacity>
                    )}
                  </View>
                  {showCommuneSuggestions && communeQuery.length > 0 && (
                    <View style={styles.suggestionsContainer}>
                      <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                        {filteredCommunes.length > 0 ? (
                          filteredCommunes.map((commune, index) => (
                            <TouchableOpacity key={index} onPress={() => { setCommuneQuery(commune); setCommuneChosen(true); setShowCommuneSuggestions(false); }} style={styles.suggestionItem}>
                              <Text style={styles.suggestionText}>{commune}</Text>
                            </TouchableOpacity>
                          ))
                        ) : (
                          <View style={styles.suggestionItem}>
                            <Text style={[styles.suggestionText, { color: '#999' }]}>Aucune commune trouvée</Text>
                          </View>
                        )}
                      </ScrollView>
                    </View>
                  )}
                </View>
              )}
            </View>
          }

          ListEmptyComponent={
            <View style={{ paddingHorizontal: 16, paddingVertical: 24 }}>
              <Text style={{ color: '#666', fontSize: 16, textAlign: 'center' }}>
                {displayMode === 'communes' && mode !== 'commune'
                  ? "Sélectionnez une commune pour voir les établissements scolaires"
                  : `Aucun établissement scolaire disponible pour ${displayMode === 'communes' ? (communeQuery || userCity) : userCity}`}
              </Text>
            </View>
          }
        />
      ) : (

        <View style={{ padding: 16, paddingBottom: 40, paddingTop: padTop }}>
          <FlatList
            data={data}
            renderItem={renderContentItem}
            keyExtractor={(_, idx) => `${s}-urgence-${idx}`}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8' },
  header: { height: 250, justifyContent: 'flex-end', overflow: 'hidden' },
  headerGradient: { flex: 1, justifyContent: 'flex-end' },
  headerContent: { padding: 20, paddingBottom: 30 },
  headerContentLower: { paddingBottom: 10 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 6 },
  headerTitleSante: { color: '#FF8A00', marginBottom: 2, fontSize: 22 },
  headerTitleUrgence: { color: '#FF8A00', marginBottom: 2, fontSize: 24, fontWeight: '900' },
  headerSubtitle: { color: '#fff', fontSize: 14, opacity: 0.9 },
  headerSubtitleTight: { marginTop: -2 },
  headerContentLowerUrgence: { paddingBottom: 18 },
  headerNote: { backgroundColor: '#FF8A00', padding: 16, borderRadius: 12, marginBottom: 20 },
  headerNoteTitle: { color: '#FF8A00', fontSize: 20, fontWeight: '900' },
  headerNoteSub: { color: '#fff', fontSize: 13, lineHeight: 18, marginTop: 4, maxWidth: '92%' },

  // Urgence: header fixe sans effet + petite ombre basse
  headerWrapperUrgence: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 250,
    zIndex: 10,
    backgroundColor: 'transparent',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.28, shadowRadius: 14 },
      android: { elevation: 14 },
      default: { boxShadow: '0px 18px 28px rgba(0,0,0,0.20)' as any },
    }),
  },
  headerUrgence: { width: '100%', height: '100%', justifyContent: 'flex-end' },
  backBtnUrgence: {
    position: 'absolute',
    top: Platform.select({ ios: 52, android: 22, default: 16 }) as number,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 20,
  },
  backBtnText: { color: '#fff', marginLeft: 4, fontWeight: '600' },
  headerWrapperSante: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 250,
    zIndex: 10,
    backgroundColor: 'transparent',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.28, shadowRadius: 14 },
      android: { elevation: 14 },
      default: { boxShadow: '0px 18px 28px rgba(0,0,0,0.20)' as any },
    }),
  },
  headerWrapperEducation: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 250,
    zIndex: 10,
    backgroundColor: 'transparent',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.28, shadowRadius: 14 },
      android: { elevation: 14 },
      default: { boxShadow: '0px 18px 28px rgba(0,0,0,0.20)' as any },
    }),
  },
  headerWrapperExamens: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 250,
    zIndex: 10,
    backgroundColor: 'transparent',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.28, shadowRadius: 14 },
      android: { elevation: 14 },
      default: { boxShadow: '0px 18px 28px rgba(0,0,0,0.20)' as any },
    }),
  },
  headerWrapperAgriculture: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 250,
    zIndex: 10,
    backgroundColor: 'transparent',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.28, shadowRadius: 14 },
      android: { elevation: 14 },
      default: { boxShadow: '0px 18px 28px rgba(0,0,0,0.20)' as any },
    }),
  },
  headerWrapperLoisirs: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 250,
    zIndex: 10,
    backgroundColor: 'transparent',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.28, shadowRadius: 14 },
      android: { elevation: 14 },
      default: { boxShadow: '0px 18px 28px rgba(0,0,0,0.20)' as any },
    }),
  },
  headerWrapperTransport: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 250,
    zIndex: 10,
    backgroundColor: 'transparent',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.28, shadowRadius: 14 },
      android: { elevation: 14 },
      default: { boxShadow: '0px 18px 28px rgba(0,0,0,0.20)' as any },
    }),
  },
  headerWrapperServices: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 250,
    zIndex: 10,
    backgroundColor: 'transparent',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.28, shadowRadius: 14 },
      android: { elevation: 14 },
      default: { boxShadow: '0px 18px 28px rgba(0,0,0,0.20)' as any },
    }),
  },
  headerWrapperEmplois: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 250,
    zIndex: 10,
    backgroundColor: 'transparent',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.34, shadowRadius: 18 },
      android: { elevation: 18 },
      default: { boxShadow: '0px 24px 36px rgba(0,0,0,0.28)' as any },
    }),
  },
  headerUrgenceContent: { padding: 20, paddingBottom: 6, alignItems: 'flex-start' },
  headerTitleUrg: {
    color: '#FF8A00',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 2,
    ...Platform.select({
      ios: { textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
      android: { textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
      default: { textShadow: '0px 2px 6px rgba(0,0,0,0.5)' as any },
    }),
  },
  headerSubtitleUrg: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.95,
    ...Platform.select({
      ios: { textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
      android: { textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
      default: { textShadow: '0px 2px 6px rgba(0,0,0,0.5)' as any },
    }),
  // Education ovals
  ovalCheck: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 18, borderWidth: 1, borderColor: '#DADADA', backgroundColor: '#fff', marginRight: 8, marginBottom: 8 },
  ovalCheckActive: { borderColor: '#0A7C3A', backgroundColor: '#E6F4EA' },
  ovalBullet: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#DADADA', marginRight: 8 },
  ovalBulletActive: { backgroundColor: '#0A7C3A' },
  ovalLabel: { color: '#333', fontSize: 13, fontWeight: '600' },
  ovalLabelActive: { color: '#0A7C3A' },

  },

  // Brand badge styles
  brandBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginLeft: 8 },
  brandBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  brandOrange: { backgroundColor: '#FF7900' },
  brandMtn: { backgroundColor: '#FDDC00' },
  brandMoov: { backgroundColor: '#00A859' },

  // Styles pour la section santé
  locationText: { fontSize: 16, marginBottom: 8 },
  filtersRow: { flexDirection: 'row', marginBottom: 16 },
  // Santé (styles init)
  filtersRowAligned: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 16, borderWidth: 1, marginRight: 6 },
  chipNear: { backgroundColor: '#E3F2FD', borderColor: '#0D6EFD' },
  chipCommune: { backgroundColor: '#E6F4EA', borderColor: '#0A7C3A' },
  chipInactive: { backgroundColor: '#F4F5F6', borderColor: '#DADADA' },
  chipTextNear: { color: '#0D6EFD', fontSize: 13, fontWeight: '600' },
  chipTextCommune: { color: '#0A7C3A', fontSize: 14, fontWeight: '600' },
  chipTextInactive: { color: '#666', fontSize: 14, fontWeight: '600' },
  chipReset: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 14, borderWidth: 1, backgroundColor: '#FFF3E0', borderColor: '#FF8A00', marginLeft: 6, minHeight: 32 },
  chipTextReset: { color: '#FF8A00', fontSize: 14, fontWeight: '600' },
  
  searchLabel: { color: '#0A7C3A', fontWeight: '700', marginBottom: 8, fontSize: 16 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E8F0E8', borderRadius: 10, backgroundColor: '#FAFAF8' },
  searchInput: { flex: 1, height: 44, paddingHorizontal: 12, fontSize: 16, color: '#0A7C3A' },
  clearButton: { paddingHorizontal: 12, paddingVertical: 12 },
  
  suggestionsContainer: { marginTop: 8, borderWidth: 1, borderColor: '#E8F0E8', borderRadius: 10, backgroundColor: '#fff', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  suggestionItem: { paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F0F3F0' },
  suggestionText: { fontSize: 16, color: '#0A7C3A' },

  // Styles pour les établissements de santé
  facilitiesCount: { fontSize: 14, color: '#666', marginBottom: 16, fontWeight: '600' },
  facilityCard: { backgroundColor: '#F7FAF7', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E8F0E8' },
  facilityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  facilityName: { fontSize: 18, fontWeight: '700', color: '#0A7C3A', flex: 1, marginRight: 12 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  // Santé (valeurs initiales)
  badgePublic: { backgroundColor: '#E3F2FD', borderColor: '#0D6EFD' },
  badgeClinic: { backgroundColor: '#FFF3E0', borderColor: '#FF8A00' },
  // Éducation (badges séparés)
  eduBadgePublic: { backgroundColor: '#E6F4EA', borderColor: '#0A7C3A' },
  eduBadgePrive: { backgroundColor: '#E3F2FD', borderColor: '#0D6EFD' },
  eduBadgeFormation: { backgroundColor: '#FFF3E0', borderColor: '#FF8A00' },
  typeBadgeText: { fontSize: 12, fontWeight: '600', color: '#0A7C3A' },
  facilityServices: { fontSize: 14, color: '#555', marginBottom: 8, lineHeight: 20 },
  facilityAddress: { fontSize: 14, color: '#666', marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  facilityNote: { fontSize: 13, color: '#FF8A00', marginBottom: 12, flexDirection: 'row', alignItems: 'center', fontStyle: 'italic' },
  facilityActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0A7C3A', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 8, marginBottom: 8 },
  actionButtonText: { color: '#fff', fontSize: 12, fontWeight: '600', marginLeft: 6 },
  actionButtonAlt: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#0A7C3A', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 8, marginBottom: 8 },
  actionButtonAltText: { color: '#0A7C3A', fontSize: 12, fontWeight: '600', marginLeft: 6 },

  // Styles pour les cartes de contenu générique
  contentCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E8F0E8' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#0A7C3A', flex: 1 },
  premiumBadge: { backgroundColor: '#FFD700', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  premiumBadgeText: { fontSize: 10, fontWeight: '700', color: '#333' },
  cardDescription: { fontSize: 14, color: '#555', marginBottom: 8, lineHeight: 20 },
  cardUssd: { fontSize: 14, color: '#0D6EFD', fontWeight: '600', marginBottom: 12 },
  cardActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0A7C3A', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 8, marginBottom: 8 },
  actionBtnText: { color: '#fff', fontSize: 12, fontWeight: '600', marginLeft: 6 },
  actionBtnAlt: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#0A7C3A', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 8, marginBottom: 8 },
  actionBtnAltText: { color: '#0A7C3A', fontSize: 12, fontWeight: '600', marginLeft: 6 },
  tipBtnText: { fontSize: 12, fontWeight: '600', color: '#333' },
  
  // Education overlay text styles
  eduListOverlay: {
    position: 'absolute',
    bottom: 12,
    right: 16,
    alignItems: 'flex-start',
  },
  eduListText: {
    fontSize: 13,
    color: '#f9f9f9',
    textAlign: 'left',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    marginBottom: 4,
    opacity: 0.95,
  }

});