import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, ImageBackground, Dimensions, TextInput, Platform, ScrollView, RefreshControl } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from '../../src/utils/api';
import { useI18n } from '../../src/i18n/i18n';
import { useCitiesCommunes } from '../../src/hooks/useCitiesCommunes';

const HEADER_IMG = { uri: 'https://customer-assets.emergentagent.com/job_allo-assistance/artifacts/k9bf6flt_pharmaciebis_bg.png' };
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function Pharmacies() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onDuty, setOnDuty] = useState(false);
  const [nearMe, setNearMe] = useState(false);
  const [city, setCity] = useState<string>('');
  const [query, setQuery] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showNearTip, setShowNearTip] = useState(false);
  const [showDutyTip, setShowDutyTip] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [showResetLink, setShowResetLink] = useState(false);

  const { t, lang } = useI18n();
  
  // Utiliser le hook pour les villes et communes
  const { searchResults, searchCitiesCommunes, loading: searchLoading } = useCitiesCommunes();

  // Gérer la recherche avec debouncing
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Pharmacies ajoutées par les utilisateurs
  const [userPharmacies, setUserPharmacies] = useState<any[]>([]);

  // Charger les pharmacies utilisateur avec useFocusEffect (comme dans Education)
  useFocusEffect(
    useCallback(() => {
      const loadUserPharmacies = async () => {
        try {
          const stored = await AsyncStorage.getItem('pharmacies_user_items');
          if (stored) {
            const pharmacies = JSON.parse(stored);
            setUserPharmacies(pharmacies);
          }
        } catch (error) {
          console.error('Erreur lors du chargement des pharmacies utilisateur:', error);
        }
      };

      loadUserPharmacies();
    }, [])
  );

  const handleSearchQueryChange = (text: string) => {
    setQuery(text);
    
    // Annuler le timeout précédent
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Définir un nouveau timeout pour éviter trop d'appels API
    const newTimeout = setTimeout(() => {
      if (text.trim()) {
        searchCitiesCommunes(text.trim());
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    }, 300);
    
    setSearchTimeout(newTimeout);
  };

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { throw new Error('denied'); }
      const loc = await Location.getCurrentPositionAsync({});
      return { lat: loc.coords.latitude, lng: loc.coords.longitude };
    } catch (e) {
      throw new Error('denied');
    }
  };

  const buildUrl = async () => {
    const p: string[] = [];
    if (onDuty || nearMe) p.push('on_duty=true');
    if (!nearMe && city) p.push(`city=${encodeURIComponent(city)}`);
    if (nearMe) {
      const c = coords || await getLocation();
      if (!c) throw new Error('denied');
      setCoords(c);
      p.push(`near_lat=${c.lat}`); p.push(`near_lng=${c.lng}`); p.push('max_km=5');
    }
    const q = p.length ? `?${p.join('&')}` : '';
    return `/api/pharmacies${q}`;
  };

  const load = async () => {
    setError(null);
    setLoading(true);
    try {
      const url = await buildUrl();
      const res = await apiFetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setItems(json);
    } catch (e: any) {
      if (e.message === 'denied') { setError(t('locationDenied')); Alert.alert(t('error'), t('locationDenied')); }
      else { setError(t('fetchError')); Alert.alert(t('error'), t('fetchError')); }
    } finally { setLoading(false); }
  };

  // initial load: all pharmacies
  useEffect(() => { load(); }, []);

  // Auto-enable onDuty when nearMe is toggled on and reset city/query when enabling nearMe
  useEffect(() => {
    if (nearMe && !onDuty) setOnDuty(true);
    if (nearMe) { setCity(''); setQuery(''); }
  }, [nearMe]);

  useEffect(() => {
    (async () => {
      try {
        const used = await AsyncStorage.getItem('tips_reset_used');
        setShowResetLink(!used);
      } catch {
        setShowResetLink(true);
      }
    })();
  }, []);

  // Recharger automatiquement quand filtres changent
  useEffect(() => {
    load();
  }, [nearMe, onDuty]);

  const triggerHaptic = async () => {
    if (Platform.OS !== 'web') {
      try { await Haptics.selectionAsync(); } catch {}
    }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await load();
    } finally {
      setRefreshing(false);
    }
  };

  const toggleOnDuty = () => { setOnDuty((v) => !v); };
  const toggleNearMe = () => { 
    setNearMe((v) => { 
      const next = !v; 
      if (next) { 
        setCity(''); 
        setQuery(''); 
        setShowSuggestions(false);
        // Annuler le timeout de recherche
        if (searchTimeout) {
          clearTimeout(searchTimeout);
        }
      } 
      return next; 
    }); 
  };

  const handleNearPress = async () => {
    await triggerHaptic();
    toggleNearMe();
    try {
      const seen = await AsyncStorage.getItem('tip_near_shown');
      if (!seen) {
        setShowNearTip(true);
        await AsyncStorage.setItem('tip_near_shown', '1');
      }
    } catch {}
  };

  const handleDutyPress = async () => {
    await triggerHaptic();
    toggleOnDuty();
    try {
      const seen = await AsyncStorage.getItem('tip_duty_shown');
      if (!seen) {
        setShowDutyTip(true);
        await AsyncStorage.setItem('tip_duty_shown', '1');
      }
    } catch {}
  };

  const onSelectSuggestion = async (name: string) => {
    setCity(name);
    setQuery(name);
    setShowSuggestions(false);
    
    // Annuler le timeout de recherche si il existe
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    await load();
  };

  const CityButton = ({ result }: { result: { name: string; type: 'city' | 'commune' } }) => (
    <TouchableOpacity onPress={() => onSelectSuggestion(result.name)} style={[styles.cityItem, city === result.name && styles.cityItemActive]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={[styles.cityText, city === result.name && styles.cityTextActive]}>{result.name}</Text>
        <Text style={[styles.cityTypeText, city === result.name && styles.cityTypeTextActive]}>
          {result.type === 'city' ? 'Ville' : 'Commune'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header fixe */}
      <View style={styles.headerWrapperPharm}>
        <ImageBackground source={HEADER_IMG} style={styles.header} imageStyle={styles.headerImg}>
          <TouchableOpacity onPress={() => router.replace('/(tabs)/home')} accessibilityRole="button" accessibilityLabel="Retour" testID="backBtn-pharmacies" style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.titleWrap}>
            <View style={styles.headerRow} testID="pharmaciesHeaderRow" dataSet={{ testid: 'pharmaciesHeaderRow' }}>
              <View style={styles.titleSection}>
                <Text style={styles.headerTitle} testID="pharmaciesHeaderTitle" dataSet={{ testid: 'pharmaciesHeaderTitle' }} accessibilityLabel="Pharmacies" nativeID="pharmaciesHeaderTitle">{t('tabPharm')}</Text>
                {(nearMe || (city && !nearMe)) && (
                  <>
                    <Text style={styles.headerDot} testID="headerDot" dataSet={{ testid: 'headerDot' }}> • </Text>
                    {nearMe ? (
                      <Text style={styles.nearHeader} testID="nearHeaderLabel" dataSet={{ testid: 'nearHeaderLabel' }} accessibilityLabel="Autour de moi" nativeID="nearHeaderLabel">{t('nearMe')}</Text>
                    ) : (
                      <Text style={styles.cityHeader} testID="cityHeaderLabel" dataSet={{ testid: 'cityHeaderLabel' }} accessibilityLabel={city} nativeID="cityHeaderLabel">{city}</Text>
                    )}
                  </>
                )}
              </View>
              {/* Bouton Ajouter repositionné à droite */}
              <TouchableOpacity 
                onPress={() => router.push('/pharmacies/ajouter')} 
                accessibilityRole="button" 
                accessibilityLabel="Ajouter une pharmacie"
                style={styles.addBtnHeader}
              >
                <Ionicons name="add-circle-outline" size={20} color="#fff" />
                <Text style={styles.addBtnHeaderText}>Ajouter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </View>

      <ScrollView style={{ flex: 1 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0A7C3A" colors={["#0A7C3A"]} />}> 

        {/* Filtres actifs (badges) */}
        <View style={[styles.activeFiltersRow, { marginTop: 20 }]}>
          <TouchableOpacity onPress={handleNearPress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={[styles.chip, nearMe ? styles.chipNear : styles.chipInactive]} accessible accessibilityLabel="chipNear">
            <Ionicons name="location-outline" size={18} color={nearMe ? '#0D6EFD' : '#666'} style={{ marginRight: 8 }} />
            <Text style={nearMe ? styles.chipTextNear : styles.chipTextInactive}>{t('nearMe')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDutyPress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={[styles.chip, onDuty ? styles.chipOnDuty : styles.chipInactive]} accessible accessibilityLabel="chipOnDuty">
            <Ionicons name="location-outline" size={18} color={onDuty ? '#0A7C3A' : '#666'} style={{ marginRight: 8 }} />
            <Text style={onDuty ? styles.chipTextOn : styles.chipTextInactive}>Communes ou quartiers</Text>
          </TouchableOpacity>
        </View>

        {/* Tips (premier usage) */}
        {(showNearTip || showDutyTip) && (
          <View style={styles.tipsWrap}>
            {showNearTip && (
              <View style={[styles.tipBox, styles.tipNear]}>
                <View style={styles.tipRow}>
                  <Ionicons name="location-outline" size={16} color="#0D6EFD" style={{ marginRight: 6 }} />
                  <Text style={styles.tipText}>{t('tipNear')}</Text>
                </View>
                <TouchableOpacity onPress={() => setShowNearTip(false)} style={styles.tipBtn}>
                  <Text style={styles.tipBtnText}>{t('gotIt') || 'Compris'}</Text>
                </TouchableOpacity>
              </View>
            )}
            {showDutyTip && (
              <View style={[styles.tipBox, styles.tipDuty]}>
                <View style={styles.tipRow}>
                  <Ionicons name="medkit-outline" size={16} color="#0A7C3A" style={{ marginRight: 6 }} />
                  <Text style={styles.tipText}>{t('tipDuty')}</Text>
                </View>
                <TouchableOpacity onPress={() => setShowDutyTip(false)} style={styles.tipBtn}>
                  <Text style={styles.tipBtnText}>{t('gotIt') || 'Compris'}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Action: Réinitialiser les infobulles */}
        {showResetLink && (
          <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
            <TouchableOpacity
              onPress={async () => {
                try {
                  await AsyncStorage.removeItem('tip_near_shown');
                  await AsyncStorage.removeItem('tip_duty_shown');
                  await AsyncStorage.setItem('tips_reset_used', '1');
                  setShowNearTip(false);
                  setShowDutyTip(false);
                  setShowResetLink(false);
                  Alert.alert('Info', t('tipsReset'));
                } catch (e) {}
              }}
              style={styles.resetLink}
            >
              <Text style={styles.resetLinkText}>{t('resetTips') || 'Réinitialiser les infobulles'}</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.filters}>
          <View />

          {/* Barre de recherche ville/commune */}
          <View style={styles.searchBlock}>
            <Text style={styles.selectLabel}>Ville ou Commune</Text>
            <View style={[styles.searchRow, nearMe && styles.searchRowDisabled]}
              pointerEvents={nearMe ? 'none' : 'auto'}>
              <Ionicons name="search-outline" size={18} color={nearMe ? '#999' : '#666'} style={{ marginRight: 8 }} />
              <TextInput
                value={query}
                onChangeText={handleSearchQueryChange}
                onFocus={() => {
                  if (!nearMe && query.trim()) {
                    setShowSuggestions(true);
                  }
                }}
                placeholder="Rechercher une ville ou commune..."
                placeholderTextColor={nearMe ? '#CCC' : '#999'}
                style={styles.searchInputFlex}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!nearMe}
                returnKeyType="search"
                onSubmitEditing={() => {
                  if (!nearMe && searchResults[0]) onSelectSuggestion(searchResults[0].name);
                  setShowSuggestions(false);
                }}
              />
              {(!!query || !!city) && (
                <TouchableOpacity onPress={() => { 
                  setQuery(''); 
                  setCity(''); 
                  setShowSuggestions(false);
                  // Annuler le timeout de recherche
                  if (searchTimeout) {
                    clearTimeout(searchTimeout);
                  }
                }} style={styles.clearBtn}>
                  <Text style={styles.clearBtnText}>{t('clear') || 'Effacer'}</Text>
                </TouchableOpacity>
              )}
            </View>
            {!nearMe && showSuggestions && query.length > 0 && (
              <View style={styles.dropdown} testID="citySuggestions" dataSet={{ testid: 'citySuggestions' }}>
                <View style={{ maxHeight: 220 }}>
                  {searchLoading && (
                    <View style={[styles.noResult, { flexDirection: 'row', alignItems: 'center' }]}>
                      <ActivityIndicator size="small" color="#0A7C3A" style={{ marginRight: 8 }} />
                      <Text style={styles.noResultText}>Recherche en cours...</Text>
                    </View>
                  )}
                  {!searchLoading && searchResults.map((result) => (<CityButton key={`${result.type}-${result.name}`} result={result} />))}
                  {!searchLoading && searchResults.length === 0 && query.length > 2 && (
                    <View style={styles.noResult}><Text style={styles.noResultText}>{t('notAvailable') || 'Aucun résultat trouvé'}</Text></View>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>

        <View style={styles.filters}>
          <TouchableOpacity onPress={load} style={styles.btn}><Text style={styles.btnText}>{t('refresh')}</Text></TouchableOpacity>
        </View>

        {/* Contenu */}
        <View style={styles.content}>
          {error && <Text style={styles.error}>{error}</Text>}
          {loading && <ActivityIndicator />}
          
          {/* Pharmacies utilisateur (toujours affichées en premier) */}
          {userPharmacies.map((p) => (
            <View key={`user-${p.id}`} style={styles.card}>
              <Text style={styles.title}>{p.name}</Text>
              <Text style={styles.meta}>
                {p.address} • {p.city}
                {p.commune && ` • ${p.commune}`}
              </Text>
              {p.phone && <Text style={styles.meta}>{p.phone}</Text>}
              {p.opening_hours && <Text style={styles.meta}>{p.opening_hours}</Text>}
              {p.agrement && <Text style={styles.meta}>Agrément: {p.agrement}</Text>}
              <View style={styles.badgeRow}>
                {p.duty_days && p.duty_days.length > 0 && (
                  <Text style={[styles.badge, styles.badgeOnDuty]}>De garde</Text>
                )}
                {p.is_professional && (
                  <Text style={[styles.badge, styles.badgePro]}>Professionnel</Text>
                )}
                <Text style={[styles.badge, styles.badgeLocal]}>Annonce locale</Text>
              </View>
            </View>
          ))}

          {/* Pharmacies API */}
          {items.map((p) => (
            <View key={p.id} style={styles.card}>
              <Text style={styles.title}>{p.name}</Text>
              <Text style={styles.meta}>{p.address} • {p.city}</Text>
              {p.phone && <Text style={styles.meta}>{p.phone}</Text>}
              {p.opening_hours && <Text style={styles.meta}>{p.opening_hours}</Text>}
              {(p.on_duty || p.duty_days) && <Text style={[styles.badge, styles.badgeOnDuty]}>De garde</Text>}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 250 },
  headerWrapperPharm: {
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
  header: { height: 250, justifyContent: 'flex-end' },
  headerImg: { resizeMode: 'cover' },
  headerOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, backgroundColor: 'transparent' },
  titleWrap: { paddingHorizontal: 16, paddingBottom: 12, alignItems: 'flex-start' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleSection: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  headerTitle: { color: '#fff', fontWeight: '800', fontSize: 26, textShadowColor: 'rgba(0,0,0,0.35)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  addBtnHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255, 255, 255, 0.2)', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  addBtnHeaderText: { 
    color: '#fff', 
    fontSize: 14, 
    fontWeight: '600', 
    marginLeft: 4,
    textShadowColor: 'rgba(0,0,0,0.3)', 
    textShadowOffset: { width: 0, height: 1 }, 
    textShadowRadius: 2,
  },
  headerDot: { color: '#fff', fontSize: 20, fontWeight: '600', marginHorizontal: 6 },
  nearHeader: { color: '#0D6EFD', fontSize: 16, fontWeight: '700' },
  cityHeader: { color: '#FF8A00', fontSize: 16, fontWeight: '700' },
  backBtn: {
    position: 'absolute',
    top: Platform.select({ ios: 52, android: 22, default: 16 }) as number,
    left: 16,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  filters: { paddingHorizontal: 16, paddingTop: 12 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between' },
  toggle: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E8F0E8', marginRight: 8, alignItems: 'center', backgroundColor: '#fff' },
  toggleOn: { backgroundColor: '#0A7C3A', borderColor: '#0A7C3A' },
  toggleText: { color: '#0A7C3A', fontWeight: '700' },
  toggleTextOn: { color: '#fff' },

  searchBlock: { marginTop: 10 },
  selectLabel: { color: '#0A7C3A', fontWeight: '700', marginBottom: 6 },
  searchRow: { minHeight: 44, borderWidth: 1, borderColor: '#E8F0E8', borderRadius: 10, paddingHorizontal: 8, backgroundColor: '#FAFAF8', flexDirection: 'row', alignItems: 'center' },
  searchRowDisabled: { backgroundColor: '#F0F0F0' },
  searchInputFlex: { flex: 1, height: 40, paddingHorizontal: 8, color: '#0A7C3A' },
  clearBtn: { paddingHorizontal: 10, paddingVertical: 6, alignSelf: 'center' },
  clearBtnText: { color: '#0A7C3A', fontWeight: '700' },

  dropdown: { marginTop: 6, borderWidth: 1, borderColor: '#E8F0E8', borderRadius: 10, backgroundColor: '#fff' },
  cityItem: { paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#F0F3F0' },
  cityItemActive: { backgroundColor: '#F3F7F5' },
  cityText: { color: '#0A7C3A' },
  cityTextActive: { color: '#0A7C3A', fontWeight: '800' },
  cityTypeText: { color: '#666', fontSize: 12, fontStyle: 'italic' },
  cityTypeTextActive: { color: '#0A7C3A', fontSize: 12, fontStyle: 'italic', fontWeight: '600' },
  noResult: { paddingVertical: 12, paddingHorizontal: 12 },
  noResultText: { color: '#666' },

  btn: { backgroundColor: '#0A7C3A', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  btnText: { color: '#fff', fontWeight: '700' },

  content: { flex: 1, padding: 16 },
  error: { color: '#B00020', marginBottom: 8 },
  card: { backgroundColor: '#F7FAF7', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E8F0E8' },
  title: { fontSize: 16, fontWeight: '700', color: '#0A7C3A' },
  meta: { fontSize: 13, color: '#555', marginTop: 4 },
  badge: { marginTop: 6, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1, fontSize: 12, fontWeight: '700', marginRight: 4, marginBottom: 4 },
  badgeOnDuty: { color: '#0A7C3A', borderColor: '#0A7C3A', backgroundColor: '#E6F4EA' },
  badgePro: { backgroundColor: '#0A7C3A' },
  badgeLocal: { backgroundColor: '#FF8A00' },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },

  activeFiltersRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, marginRight: 8 },
  chipNear: { backgroundColor: '#E3F2FD', borderColor: '#0D6EFD' },
  chipOnDuty: { backgroundColor: '#E6F4EA', borderColor: '#0A7C3A' },
  chipCommunes: { backgroundColor: '#FFF4E6', borderColor: '#FF8A00' },
  chipTextNear: { color: '#0D6EFD', fontSize: 12, fontWeight: '600' },
  chipTextOn: { color: '#0A7C3A', fontSize: 12, fontWeight: '600' },
  chipTextCommunes: { color: '#FF8A00', fontSize: 12, fontWeight: '600' },
  chipInactive: { backgroundColor: '#F4F5F6', borderColor: '#DADADA' },
  chipTextInactive: { color: '#666', fontSize: 12, fontWeight: '600' },

  resetLink: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#F0F3F0', borderRadius: 8, alignItems: 'center' },
  resetLinkText: { color: '#0A7C3A', fontSize: 12, fontWeight: '600' },

  tipsWrap: { paddingHorizontal: 16, paddingVertical: 8 },
  tipBox: { backgroundColor: '#F8F9FA', borderRadius: 8, padding: 12, marginBottom: 8, borderWidth: 1 },
  tipNear: { borderColor: '#0D6EFD' },
  tipDuty: { borderColor: '#0A7C3A' },
  tipRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  tipText: { flex: 1, fontSize: 12, color: '#333' },
  tipBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#fff', borderRadius: 6, borderWidth: 1, borderColor: '#ddd' },
  tipBtnText: { fontSize: 12, fontWeight: '600', color: '#333' },

});