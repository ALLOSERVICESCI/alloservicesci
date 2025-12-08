import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Image, ImageBackground, FlatList, TouchableOpacity, Platform, Linking, TextInput, RefreshControl, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONTENT_BY_CATEGORY } from '../../src/utils/categoryContent';
const loisirsData = require('../../src/data/loisirs_tourisme.json');

const SCREEN_WIDTH = Dimensions.get('window').width;

// Type definition for LoisirItem
// interface LoisirItem { id; __local; title; summary; description; commune; tag; phone; website; source; lat; lng; photos?[]; rating; createdAt; }

// Mapper les données importées vers le format attendu
const FALLBACK_LOISIRS = loisirsData.map((item) => ({
  id: item.id?.toString(),
  title: item.nom,
  summary: item.description_courte,
  description: item.description_longue,
  commune: item.ville || item.quartier,
  tag: item.categorie === 'hotel' ? 'Hôtel' : 
       item.categorie === 'residence' ? 'Résidence' :
       item.categorie === 'loisir' ? 'Loisir' :
       item.categorie === 'site_incontournable' ? 'Site incontournable' :
       item.categorie === 'plage' ? 'Plage' : item.categorie,
  photos: item.photos || [],
}));

// Ancienne définition statique supprimée - maintenant utilise les données JSON

const HEADER_BG = { uri: 'https://customer-assets.emergentagent.com/job_smartcommunity-2/artifacts/x28hv0dw_loisirst_bg.png' };
const CAT_FILTERS = ['Tous', 'Hôtel', 'Résidence', 'Loisir', 'Plage', 'Site incontournable'];

// Communes d'Abidjan + villes clés CI
const ABJ_COMMUNES = [
  'Abobo','Adjamé','Anyama','Attécoubé','Bingerville','Cocody','Koumassi','Marcory','Plateau','Port-Bouët','Treichville','Songon','Yopougon',
  // Étendues CI
  'Grand-Bassam','Assinie','Yamoussoukro','Bouaké','San-Pedro','Korhogo','Daloa','Man','Gagnoa','Jacqueville','Grand-Lahou','Sassandra'
];

// type Mode = 'nearby' | 'communes';

export default function LoisirsTourisme() {
  const router = useRouter();
  const [mode, setMode] = useState('communes');
  const [coords, setCoords] = useState(null);
  const [locError, setLocError] = useState(null);

  // Filtres
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  // UI state
  const [refreshing, setRefreshing] = useState(false);
  const [success, setSuccess] = useState(false);

  // Localité effective
  const [effectiveCity, setEffectiveCity] = useState<string>('Abidjan');
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('auth_user');
        const u = raw ? JSON.parse(raw) : null;
        const loc = u?.city || u?.commune || 'Abidjan';
        if (mounted) setEffectiveCity(loc);
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

  // Demande de localisation (Autour de moi)
  useEffect(() => {
    (async () => {
      if (mode !== 'nearby' || coords) return;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') { setLocError("Autorisation localisation refusée"); return; }
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      } catch (e) { setLocError('Localisation indisponible'); }
    })();
  }, [mode, coords]);

  // Recherches
  const [communeQuery, setCommuneQuery] = useState('');
  const [selectedCommune, setSelectedCommune] = useState<string | null>(null);
  const communeSuggestions = useMemo(() => {
    const q = communeQuery.trim().toLowerCase();
    if (!q) return [];
    return ABJ_COMMUNES.filter(c => c.toLowerCase().includes(q)).slice(0, 8);
  }, [communeQuery]);

  // Données Loisirs & Tourisme (lecture seule)
  const rawData = useMemo(() => {
    const raw = CONTENT_BY_CATEGORY?.loisirs_tourisme;
    if (Array.isArray(raw) && raw.length > 0) return raw;
    return FALLBACK_LOISIRS;
  }, []);

  // Annonces utilisateur (stockées localement)
  const [userItems, setUserItems] = useState([]);

  const loadUserItems = useCallback(async () => {
    try {
      console.log('[Loisirs] Début chargement des annonces locales');
      const raw = await AsyncStorage.getItem('loisirs_user_items');
      console.log('[Loisirs] Raw data:', raw);
      const arr = raw ? JSON.parse(raw) : [];
      console.log('[Loisirs] Array parsed:', arr.length, 'items');
      
      // Filtrer les annonces expirées (>7 jours = 7 * 24 * 60 * 60 * 1000 ms)
      const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
      const now = Date.now();
      const validItems = (Array.isArray(arr) ? arr : []).filter((it) => {
        // Si pas de createdAt, on garde l'annonce (rétrocompatibilité)
        if (!it.createdAt) return true;
        // Sinon, on vérifie si elle a moins de 7 jours
        const age = now - it.createdAt;
        return age < SEVEN_DAYS_MS;
      });
      
      console.log('[Loisirs] Items valides (non expirés):', validItems.length, 'sur', arr.length);
      
      // Sauvegarder uniquement les items valides (nettoyage automatique)
      if (validItems.length !== arr.length) {
        await AsyncStorage.setItem('loisirs_user_items', JSON.stringify(validItems));
        console.log('[Loisirs] Nettoyage effectué:', arr.length - validItems.length, 'annonces expirées supprimées');
      }
      
      const normalized = validItems.map((it) => ({ ...it, __local: true }));
      console.log('[Loisirs] Items normalisés:', normalized.length);
      setUserItems(normalized);
    } catch (e) {
      console.error('[Loisirs] Erreur chargement:', e);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await loadUserItems();
    })();
    return () => { mounted = false; };
  }, [loadUserItems]);

  // Rafraîchir à chaque focus et capter le flag de succès de publication
  useFocusEffect(useCallback(() => {
    let cancelled = false;
    (async () => {
      await loadUserItems();
      try {
        const flag = await AsyncStorage.getItem('loisirs_publish_success');
        if (!cancelled && flag === '1') {
          setSuccess(true);
          await AsyncStorage.removeItem('loisirs_publish_success');
          setTimeout(() => setSuccess(false), 2500);
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [loadUserItems]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadUserItems();
    setRefreshing(false);
  }, [loadUserItems]);

  // Utils distance
  const toRad = (x) => (x * Math.PI) / 180;
  const distKm = (a, b) => {
    const R = 6371; // km
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const sinDLat = Math.sin(dLat/2);
    const sinDLng = Math.sin(dLng/2);
    const c = 2 * Math.asin(Math.sqrt(sinDLat*sinDLat + Math.cos(lat1)*Math.cos(lat2)*sinDLng*sinDLng));
    return R * c;
  };

  // Filtrage
  const data = useMemo(() => {
    let list = [...userItems, ...rawData];

    if (categoryFilter) {
      list = list.filter((it) => {
        const t = it?.tag || '';
        if (categoryFilter === 'Lieux insolites') {
          return t === 'Lieux insolites' || t === 'Lieu insolite';
        }
        return t === categoryFilter;
      });
    }

    if (selectedCommune) {
      list = list.filter((it) => (it?.commune || '').toLowerCase() === selectedCommune.toLowerCase());
    }

    if (mode === 'nearby' && coords) {
      const withDist = list.map((it) => {
        const lat = Number(it?.lat);
        const lng = Number(it?.lng);
        const hasCoords = !isNaN(lat) && !isNaN(lng);
        const d = hasCoords ? distKm(coords, { lat, lng }) : 999999;
        return { ...it, _d: d };
      });
      return withDist.filter((x) => x._d <= 50).sort((a, b) => a._d - b._d);
    }

    return list;
  }, [rawData, userItems, selectedCommune, mode, coords, categoryFilter]);

  const openPhone = (phone) => {
    const clean = (phone || '').replace(/\s+/g, '');
    if (!clean) return;
    Linking.openURL(`tel:${clean}`);
  };

  const openWebsite = (website?, source) => {
    const w = website || source;
    if (!w) return; const url = w.startsWith('http') ? w : `https://${w}`; Linking.openURL(url);
  };

  const openMaps = (lat?, lng?, label) => {
    if (lat == null || lng == null) return;
    const query = encodeURIComponent(label || 'Itinéraire');
    const url = Platform.select({
      ios: `http://maps.apple.com/?ll=${lat},${lng}&q=${query}`,
      android: `geo:${lat},${lng}?q=${lat},${lng}(${query})`,
      default: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
    }) as string;
    Linking.openURL(url);
  };

  const RatingRow = ({ value }: { value? }) => {
    if (!value || value <= 0) return null;
    return (
      <View style={styles.ratingRow}>
        {[1,2,3,4,5].map((n) => (
          <Ionicons key={n} name={n <= value ? 'star' : 'star-outline'} size={14} color="#F59E0B" />
        ))}
      </View>
    );
  };

  // Composant Carrousel pour les photos
  const PhotoCarousel = ({ photos, onPhotoPress }: { photos[]; onPhotoPress: (index) => void }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollViewRef = useRef<ScrollView>(null);
    const CARD_WIDTH = SCREEN_WIDTH - 32; // Padding de la carte
    const IMAGE_WIDTH = CARD_WIDTH - 32; // Padding interne

    const handleScroll = (event) => {
      const contentOffsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(contentOffsetX / IMAGE_WIDTH);
      setCurrentIndex(index);
    };

    if (!photos || photos.length === 0) return null;

    return (
      <View style={styles.carouselContainer}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          decelerationRate="fast"
          snapToInterval={IMAGE_WIDTH}
          contentContainerStyle={styles.carouselContent}
        >
          {photos.map((photo, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => onPhotoPress(index)}
              activeOpacity={0.9}
              style={styles.carouselImageWrapper}
            >
              <Image
                source={{ uri: photo }}
                style={[styles.carouselImage, { width: IMAGE_WIDTH }]}
                resizeMode="cover"
              />
              {photos.length > 1 && (
                <View style={styles.photoCounter}>
                  <Ionicons name="images" size={14} color="#fff" />
                  <Text style={styles.photoCounterText}>{index + 1}/{photos.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
        {photos.length > 1 && (
          <View style={styles.paginationDots}>
            {photos.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  currentIndex === index ? styles.dotActive : styles.dotInactive
                ]}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderItem = ({ item }: { item }) => {
    const title = item?.title || item?.name || '';
    const summary | undefined = item?.summary || item?.description;
    const commune | undefined = item?.commune;
    const website | undefined = item?.website;
    const source | undefined = item?.source || item?.site;
    const phone | undefined = item?.phone;
    const lat | undefined = item?.lat;
    const lng | undefined = item?.lng;
    const photos[] | undefined = item?.photos;
    const rating | undefined = item?.rating;
    const isLocal = !!item?.__local;

    return (
      <View style={styles.card}>
        {isLocal ? (
          <>
            <View style={styles.localBadge}>
              <Ionicons name="home" size={14} color="#0A7C3A" />
              <Text style={styles.localBadgeText}>Annonce locale</Text>
            </View>
            <View style={styles.localActionsRow}>
              <TouchableOpacity onPress={async () => {
                try {
                  const raw = await AsyncStorage.getItem('loisirs_user_items');
                  const arr = raw ? JSON.parse(raw) : [];
                  const next = arr.filter((x) => x.id !== item?.id);
                  await AsyncStorage.setItem('loisirs_user_items', JSON.stringify(next));
                  setUserItems(next.map((x) => ({ ...x, __local: true })));
                } catch {}
              }}>
                <Text style={[styles.localActionText, { color: '#D32F2F' }]}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : null}
        {photos && photos.length > 0 ? (
          <PhotoCarousel
            photos={photos}
            onPhotoPress={(index) => {
              router.push({
                pathname: '/photo_viewer',
                params: { photos: JSON.stringify(photos), initialIndex: index }
              });
            }}
          />
        ) : null}
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
        {summary ? <Text style={styles.cardSummary}>{summary}</Text> : null}
        <RatingRow value={rating} />
        {commune ? (
          <View style={styles.communeBadgeRow}>
            <Ionicons name="location" size={14} color="#FF8A00" />
            <Text style={styles.communeBadgeText}>{commune}</Text>
          </View>
        ) : null}
        <View style={styles.actionsRow}>
          {phone ? (
            <TouchableOpacity onPress={() => openPhone(phone)} style={[styles.badgeBtn, styles.badgeGreen]}>
              <Ionicons name="call" size={16} color="#fff" />
              <Text style={styles.badgeText}>Pour Réserver</Text>
            </TouchableOpacity>
          ) : null}
          {(lat != null && lng != null) ? (
            <TouchableOpacity onPress={() => openMaps(lat, lng, title)} style={[styles.badgeBtn, styles.badgeBlue]}>
              <Ionicons name="navigate" size={16} color="#0D6EFD" />
              <Text style={styles.badgeTextBlue}>Itinéraire</Text>
            </TouchableOpacity>
          ) : null}
          {(website || source) ? (
            <TouchableOpacity onPress={() => openWebsite(website, source)} style={[styles.badgeBtn, styles.badgeAlt]}>
              <Ionicons name="globe" size={16} color="#0A7C3A" />
              <Text style={styles.badgeTextAlt}>Site</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header visuel */}
      <View style={styles.headerWrapper}>
        <ImageBackground source={HEADER_BG} style={styles.header} resizeMode="cover">
          <LinearGradient colors={["rgba(0,0,0,0.45)", "rgba(0,0,0,0.2)", "rgba(0,0,0,0)"]} style={StyleSheet.absoluteFillObject as any} />
          <View style={styles.headerTopRow}>
            <TouchableOpacity onPress={() => router.replace('/(tabs)/home')} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Retour">
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.headerTitleBox}>
            <View style={styles.headerTitleRow}>
              <View style={{ flexShrink: 1 }}>
                <Text style={styles.headerTitle}>Loisirs & Tourisme</Text>
                <View style={styles.subtitleWrap}>
                  <Text style={styles.headerSubtitle}>Hôtels, plages, sites, restaurants…</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => router.push('/annonceur')} style={styles.publishHeaderBtn} accessibilityRole="button" accessibilityLabel="Publier une annonce">
                <Ionicons name="add-circle" size={18} color="#0A7C3A" />
                <Text style={styles.publishHeaderText}>Publier</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </View>

      {/* Ombre renforcée sous le header */}
      <View
        style={[ styles.headerShadow,
          Platform.select({
            web: { boxShadow: '0 20px 36px rgba(0,0,0,0.30)' } as any,
            ios: { shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 16, shadowOffset: { width: 0, height: 16 } },
            android: { elevation: 16 },
          }),
        ]}
        pointerEvents="none"
      />

      {/* Liste */}
      <FlatList
        contentContainerStyle={styles.listContent}
        data={data}
        renderItem={renderItem}
        keyExtractor={(it, idx) => `${it?.id || it?.title || 'loisir'}-${idx}`}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <View style={styles.headerControls}>
            {success ? (
              <View style={styles.successBanner}>
                <Ionicons name="checkmark-circle" size={16} color="#0A7C3A" />
                <Text style={styles.successText}>Annonce publiée avec succès</Text>
              </View>
            ) : null}
            {/* Capsules de mode */}
            <View style={styles.capsRow}>
              <ModeCapsule label="Autour de moi" icon="navigate" color="#0D6EFD" active={mode === 'nearby'} onPress={() => setMode('nearby')} />
              <ModeCapsule label="Communes" icon="home" color="#0A7C3A" active={mode === 'communes'} onPress={() => setMode('communes')} />
            </View>

            {/* Ligne Localité */}
            <View style={styles.localityLine}>
              <Ionicons name="location" size={26} color="#FF8A00" />
              <Text style={styles.localityValue}>{selectedCommune || effectiveCity}</Text>
            </View>

            {/* Filtres par catégorie (toutes visibles, wrap) */}
            <View style={styles.catWrapRow}>
              {CAT_FILTERS.map((c) => (
                <TouchableOpacity key={c} onPress={() => setCategoryFilter(c === 'Tous' ? null : (c as any))} style={[styles.catChip, (categoryFilter === null && c === 'Tous') || categoryFilter === c ? styles.catChipActive : null]}>
                  <Text style={[(categoryFilter === null && c === 'Tous') || categoryFilter === c ? styles.catChipTextActive : styles.catChipText]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Sélection commune */}
            {mode === 'communes' ? (
              <>
                <Text style={styles.searchLabel}>Sélectionner une commune</Text>
                <View style={styles.searchRow}>
                  <Ionicons name="search" size={18} color="#888" />
                  <TextInput
                    style={styles.searchInput}
                    value={communeQuery}
                    onChangeText={setCommuneQuery}
                    placeholder="Sélectionner une commune"
                    placeholderTextColor="#999"
                    returnKeyType="search"
                    onSubmitEditing={() => { if (communeSuggestions.length > 0) { setSelectedCommune(communeSuggestions[0]); setCommuneQuery(''); } }}
                  />
                  {selectedCommune ? (
                    <TouchableOpacity onPress={() => setSelectedCommune(null)} accessibilityRole="button" accessibilityLabel="Effacer la sélection">
                      <Ionicons name="close-circle" size={18} color="#999" />
                    </TouchableOpacity>
                  ) : null}
                </View>
                {communeQuery && communeSuggestions.length > 0 ? (
                  <View style={styles.suggestBox}>
                    {communeSuggestions.map((s) => (
                      <TouchableOpacity key={s} onPress={() => { setSelectedCommune(s); setCommuneQuery(''); }} style={styles.suggestItem}>
                        <Text style={styles.suggestText}>{s}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : null}
              </>
            ) : null}
            {mode === 'nearby' && locError ? (
              <Text style={styles.locErrorText}>{locError}</Text>
            ) : null}

            {/* Recherche services SUPPRIMÉE selon demande */}
          </View>
        }
        ListEmptyComponent={<View style={styles.emptyBox}><Text style={styles.emptyText}>Aucun résultat. Essayez une autre commune ou activez « Autour de moi ».</Text></View>}
      />
    </View>
  );
}

function ModeCapsule({ label, active, onPress, color, icon }: { label; active; onPress: () => void; color; icon }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.modeCapsule, active ? { backgroundColor: color } : { backgroundColor: '#FFFFFF', borderColor: '#E1E6ED', borderWidth: 1 }, Platform.select({ web: { boxShadow: active ? '0 6px 16px rgba(0,0,0,0.12)' : 'none' } as any, ios: { shadowColor: '#000', shadowOpacity: active ? 0.12 : 0, shadowRadius: 8, shadowOffset: { width: 0, height: 6 } }, android: { elevation: active ? 4 : 0 } })]} accessibilityRole="button" accessibilityLabel={label}>
      <Ionicons name={icon} size={16} color={active ? '#fff' : color} />
      <Text style={[styles.modeCapsuleText, { color: active ? '#fff' : '#222' }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const HEADER_HEIGHT = 250;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  headerWrapper: { height: HEADER_HEIGHT, width: '100%' },
  header: { flex: 1, width: '100%', height: '100%' },
  headerTopRow: { paddingTop: Platform.select({ ios: 52, android: 24, default: 16 }), paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  headerTitleBox: { position: 'absolute', bottom: 16, left: 16, right: 16 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  headerSubtitle: { color: '#fff', fontSize: 12 },
  subtitleWrap: { alignSelf: 'flex-start', backgroundColor: 'rgba(0,0,0,0.25)', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 6, marginTop: 4 },
  publishHeaderBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.92)' },
  publishHeaderText: { color: '#0A7C3A', fontWeight: '800' },

  headerShadow: { height: 10, width: '100%', backgroundColor: 'transparent' },

  listContent: { paddingTop: 16, paddingHorizontal: 16, paddingBottom: 24 },

  headerControls: { marginBottom: 10 },
  capsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' },
  localityLine: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  localityLabelSmall: { color: '#444', fontSize: 13 },
  localityValue: { color: '#222', fontSize: 16, fontWeight: '400' },
  modeCapsule: { borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  modeCapsuleText: { fontWeight: '400' },

  successBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, backgroundColor: '#E8F5E9', borderWidth: 1, borderColor: '#C8E6C9', marginBottom: 8 },
  successText: { color: '#0A7C3A', fontWeight: '700' },

  catWrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  catChip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0' },
  catChipActive: { backgroundColor: '#0D6EFD', borderColor: '#0D6EFD' },
  catChipText: { color: '#111', fontWeight: '400' },
  catChipTextActive: { color: '#fff', fontWeight: '400' },

  searchLabel: { color: '#222', fontSize: 14, fontWeight: '700', marginBottom: 6, marginTop: 8 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 6 },
  searchInput: { flex: 1, color: '#222', paddingVertical: 2 },
  suggestBox: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, marginTop: 4, marginBottom: 8, overflow: 'hidden' },
  suggestItem: { paddingVertical: 10, paddingHorizontal: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  suggestText: { color: '#222' },
  locErrorText: { color: '#D32F2F', fontSize: 12, marginBottom: 8 },

  localBadge: { 
    position: 'absolute', 
    top: 10, 
    right: 10, 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4, 
    backgroundColor: '#E6F4EA', 
    paddingHorizontal: 10, 
    paddingVertical: 6, 
    borderRadius: 999, 
    zIndex: 10,
    borderWidth: 1,
    borderColor: '#0A7C3A'
  },
  localBadgeText: { 
    color: '#0A7C3A', 
    fontSize: 12, 
    fontWeight: '700' 
  },
  localActionsRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 10, marginBottom: 6 },
  localActionText: { color: '#0D6EFD', fontWeight: '700' },

  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2, position: 'relative' },
  cardThumb: { width: '100%', height: 160, borderRadius: 8, marginBottom: 10 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#222', flex: 1, paddingRight: 8 },
  cardSummary: { marginTop: 6, color: '#444', lineHeight: 20 },
  ratingRow: { flexDirection: 'row', gap: 2, marginTop: 4 },
  communeBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, marginBottom: 6 },
  communeBadgeText: { fontSize: 13, color: '#FF8A00', fontWeight: '600' },
  photosLink: { color: '#0D6EFD', fontWeight: '700', marginTop: 2 },

  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10, alignItems: 'center' },
  badgeBtn: { flexDirection: 'row', alignItems: 'center', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 10 },
  badgeGreen: { backgroundColor: '#0A7C3A' },
  badgeText: { marginLeft: 6, color: '#fff', fontWeight: '700' },
  badgeAlt: { backgroundColor: '#E6F4EA' },
  badgeTextAlt: { marginLeft: 6, color: '#0A7C3A', fontWeight: '700' },
  badgeBlue: { backgroundColor: '#E3F2FD' },
  badgeTextBlue: { marginLeft: 6, color: '#0D6EFD', fontWeight: '700' },

  emptyBox: { paddingVertical: 24, alignItems: 'center' },
  emptyText: { color: '#666' },

  // Styles du carrousel
  carouselContainer: { marginBottom: 10, position: 'relative' },
  carouselContent: { paddingRight: 0 },
  carouselImageWrapper: { marginRight: 0, position: 'relative' },
  carouselImage: { height: 200, borderRadius: 8, backgroundColor: '#F0F0F0' },
  photoCounter: { 
    position: 'absolute', 
    top: 8, 
    right: 8, 
    backgroundColor: 'rgba(0,0,0,0.7)', 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 999, 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4 
  },
  photoCounterText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  paginationDots: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 6, 
    marginTop: 8 
  },
  dot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4 
  },
  dotActive: { 
    backgroundColor: '#0D6EFD', 
    width: 24 
  },
  dotInactive: { 
    backgroundColor: '#D1D5DB' 
  },
});
