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

  // Choix de l'image d'en-tête selon la catégorie
  const backgroundImages: Record<string, any> = {
    pharmacies: require('../../assets/headers/pharmacies_header.png'),
    sante: { uri: 'https://customer-assets.emergentagent.com/job_allo-assistance/artifacts/bgconh5v_santebis_bg.png' },
    urgence: require('../../assets/headers/headers/urgence_bg.png'),
    transport: { uri: 'https://customer-assets.emergentagent.com/job_allo-assistance/artifacts/b4gvhwle_transport_bg.png' },
    alertes: require('../../assets/headers/headers/alertes_bg.png'),
    examens_concours: { uri: 'https://customer-assets.emergentagent.com/job_allo-assistance/artifacts/if6ljosz_examens_concours_bg.png' },
    education: { uri: 'https://customer-assets.emergentagent.com/job_allo-assistance/artifacts/wdyf0nu5_education_bg.png' },
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

  // Fallback propre si l'ancienne URL /category/services_utiles est ouverte
  if (sKey === 'services_utiles') {
    const removedStyles = StyleSheet.create({
      wrap: { flex: 1, backgroundColor: '#F7F7F7' },
      header: { height: 200, width: '100%', justifyContent: 'flex-end' },
      headerTitleBox: { padding: 16 },
      title: { fontSize: 22, fontWeight: '800', color: '#fff' },
      sub: { color: '#fff' },
      content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
      msg: { fontSize: 18, color: '#222', textAlign: 'center', marginBottom: 16 },
      btn: { backgroundColor: '#0A7C3A', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12 },
      btnText: { color: '#fff', fontWeight: '700' },
    });
    return (
      <View style={removedStyles.wrap}>
        <ImageBackground source={{ uri: 'https://customer-assets.emergentagent.com/job_allo-assistance/artifacts/d23v2qjj_services_utiles_bg.png' }} style={removedStyles.header} resizeMode="cover">
          <LinearGradient colors={["rgba(0,0,0,0.45)", "rgba(0,0,0,0.2)", "rgba(0,0,0,0)"]} style={StyleSheet.absoluteFillObject as any} />
          <View style={removedStyles.headerTitleBox}>
            <Text style={removedStyles.title}>Catégorie supprimée</Text>
            <Text style={removedStyles.sub}>Cette section n'est plus disponible dans l'application.</Text>
          </View>
        </ImageBackground>
        <View style={removedStyles.content}>
          <Text style={removedStyles.msg}>« Services utiles » a été retirée définitivement. Utilisez les autres catégories depuis l'accueil.</Text>
          <TouchableOpacity onPress={() => router.replace('/(tabs)/home')} style={removedStyles.btn} accessibilityRole="button" accessibilityLabel="Retour à l’accueil">
            <Text style={removedStyles.btnText}>Retour à l’accueil</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Ville/communes et le reste du composant continuent ici (inchangé)

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

  // ... le reste du fichier reste inchangé ...
}