import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Image, ImageBackground, FlatList, TouchableOpacity, Platform, Linking, TextInput, RefreshControl, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONTENT_BY_CATEGORY } from '../../src/utils/categoryContent';

const SCREEN_WIDTH = Dimensions.get('window').width;

type LoisirItem = { id?: string; __local?: boolean; title: string; summary?: string; description?: string; commune?: string; tag?: string; phone?: string; website?: string; source?: string; lat?: number; lng?: number; photos?: string[]; rating?: number };

const FALLBACK_LOISIRS: LoisirItem[] = [
  // Abidjan & environs
  { title: 'Sofitel Abidjan Hôtel Ivoire', summary: 'Hôtel 5★ avec piscine, restaurants et vue sur la lagune.', commune: 'Cocody', phone: '+225 27 22 44 10 10', source: 'https://all.accor.com', tag: 'Hôtel' },
  { title: "Zoo d'Abidjan", summary: 'Parc zoologique historique, idéal en famille.', commune: 'Cocody', tag: 'Aire de jeux' },
  { title: 'Parc National du Banco', summary: 'Forêt primaire à 30 min du Plateau pour randonnées.', commune: 'Yopougon', tag: 'Site touristique' },
  { title: "Musée des Civilisations de Côte d'Ivoire", summary: 'Collections ethnographiques et arts africains.', commune: 'Plateau', tag: 'Musée' },
  { title: 'Jardin Botanique de Bingerville', summary: 'Grand jardin historique, balade et pique-nique.', commune: 'Bingerville', tag: 'Site touristique' },
  { title: 'Cap Sud Restaurants (Zone 4)', summary: 'Ensemble de restaurants et lounges à Marcory.', commune: 'Marcory', tag: 'Restaurant' },
  { title: 'Parc d’attractions – Abidjan', summary: 'Manèges, jeux et activités pour enfants et familles.', commune: 'Marcory', tag: "Parc d'attractions" },
  { title: 'Circuit guidé – Plateau historique', summary: 'Parcours des monuments: Cathédrale, Musée, Lagune.', commune: 'Plateau', tag: 'Circuit guidé' },

  // Grand-Bassam & Assinie
  { title: 'Plage de Grand-Bassam', summary: 'Plage historique, maisons coloniales à proximité.', commune: 'Grand-Bassam', tag: 'Plage' },
  { title: 'Musée National du Costume', summary: 'Costumes traditionnels, patrimoine UNESCO.', commune: 'Grand-Bassam', tag: 'Musée' },
  { title: 'Assinie – Étoile du Sud', summary: 'Hôtel plage, sports nautiques, escapade détente.', commune: 'Assinie', tag: 'Hôtel' },
  { title: 'Assinie Mafia – Plage', summary: 'Lagune, plage, restaurants sur pilotis.', commune: 'Assinie', tag: 'Plage' },
  { title: 'Circuit UNESCO – Grand-Bassam', summary: 'Visite guidée du quartier colonial classé UNESCO.', commune: 'Grand-Bassam', tag: 'Circuit guidé' },

  // Nouvelles localités demandées
  { title: 'Plages de Jacqueville', summary: 'Sable fin, cocotiers et ambiance détente.', commune: 'Jacqueville', tag: 'Plage' },
  { title: 'Pont de Jacqueville', summary: 'Point de vue et accès aux plages.', commune: 'Jacqueville', tag: 'Site touristique' },
  { title: 'Embouchure de Grand-Lahou', summary: 'Rencontre lagune-océan, balades en pirogue.', commune: 'Grand-Lahou', tag: 'Site touristique' },
  { title: 'Musée de Grand-Lahou', summary: 'Mémoire des peuples lagunaires.', commune: 'Grand-Lahou', tag: 'Musée' },
  { title: 'Plages de Sassandra', summary: 'Superbes plages et falaises.', commune: 'Sassandra', tag: 'Plage' },
  { title: 'Phare de Sassandra', summary: 'Point de vue panoramique sur l’océan.', commune: 'Sassandra', tag: 'Site touristique' },

  // Intérieur du pays
  { title: 'Cascades de Man', summary: "Chutes d'eau pittoresques au pied des montagnes.", commune: 'Man', tag: 'Site touristique' },
  { title: 'Dent de Man', summary: 'Sommet emblématique pour randonnée.', commune: 'Man', tag: 'Site touristique' },
  { title: 'Quartier des Artisans – Sculptures Sénoufo', summary: 'Ateliers de sculpture et tissage Poro.', commune: 'Korhogo', tag: 'Artisanat' },
  { title: 'Circuit guidé – Artisanat Sénoufo', summary: 'Visite d’ateliers, démonstrations et achats.', commune: 'Korhogo', tag: 'Circuit guidé' },
  { title: 'La Paillote – Restaurant', summary: 'Cuisine locale populaire.', commune: 'Bouaké', tag: 'Restaurant' },
  { title: 'Basilique Notre‑Dame de la Paix', summary: 'Basilique monumentale ouverte aux visites.', commune: 'Yamoussoukro', tag: 'Site touristique' },
  { title: 'Fondation F. Houphouët‑Boigny', summary: 'Centre de culture et de paix.', commune: 'Yamoussoukro', tag: 'Site touristique' },
];

const HEADER_BG = { uri: 'https://customer-assets.emergentagent.com/job_smartcommunity-2/artifacts/x28hv0dw_loisirst_bg.png' };
const CAT_FILTERS = ['Tous', 'Hôtel', 'Restaurant', 'Plage', 'Site touristique', 'Base de loisir', 'Lieux insolites', 'Airbnb'] as const;

// Communes d'Abidjan + villes clés CI
const ABJ_COMMUNES = [
  'Abobo','Adjamé','Anyama','Attécoubé','Bingerville','Cocody','Koumassi','Marcory','Plateau','Port-Bouët','Treichville','Songon','Yopougon',
  // Étendues CI
  'Grand-Bassam','Assinie','Yamoussoukro','Bouaké','San-Pedro','Korhogo','Daloa','Man','Gagnoa','Jacqueville','Grand-Lahou','Sassandra'
];

type Mode = 'nearby' | 'communes';

export default function LoisirsTourisme() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('communes');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locError, setLocError] = useState<string | null>(null);

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
    if (!q) return [] as string[];
    return ABJ_COMMUNES.filter(c => c.toLowerCase().includes(q)).slice(0, 8);
  }, [communeQuery]);

  // Données Loisirs & Tourisme (lecture seule)
  const rawData = useMemo(() => {
    const raw = CONTENT_BY_CATEGORY?.loisirs_tourisme as any[] | undefined;
    if (Array.isArray(raw) && raw.length > 0) return raw as any;
    return FALLBACK_LOISIRS as any;
  }, []);

  // Annonces utilisateur (stockées localement)
  const [userItems, setUserItems] = useState<LoisirItem[]>([]);

  const loadUserItems = useCallback(async () => {
    try {
      console.log('[Loisirs] Début chargement des annonces locales');
      const raw = await AsyncStorage.getItem('loisirs_user_items');
      console.log('[Loisirs] Raw data:', raw);
      const arr = raw ? JSON.parse(raw) : [];
      console.log('[Loisirs] Array parsed:', arr.length, 'items');
      const normalized = (Array.isArray(arr) ? arr : []).map((it: any) => ({ ...it, __local: true }));
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
  const toRad = (x: number) => (x * Math.PI) / 180;
  const distKm = (a: {lat: number, lng: number}, b: {lat: number, lng: number}) => {
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
    let list: any[] = [...userItems, ...rawData];

    if (categoryFilter) {
      list = list.filter((it: any) => {
        const t = it?.tag || '';
        if (categoryFilter === 'Lieux insolites') {
          return t === 'Lieux insolites' || t === 'Lieu insolite';
        }
        return t === categoryFilter;
      });
    }

    if (selectedCommune) {
      list = list.filter((it: any) => (it?.commune || '').toLowerCase() === selectedCommune.toLowerCase());
    }

    if (mode === 'nearby' && coords) {
      const withDist = list.map((it: any) => {
        const lat = Number(it?.lat);
        const lng = Number(it?.lng);
        const hasCoords = !isNaN(lat) && !isNaN(lng);
        const d = hasCoords ? distKm(coords, { lat, lng }) : 999999;
        return { ...it, _d: d };
      });
      return withDist.filter((x: any) => x._d <= 50).sort((a: any, b: any) => a._d - b._d);
    }

    return list;
  }, [rawData, userItems, selectedCommune, mode, coords, categoryFilter]);

  const openPhone = (phone?: string) => {
    const clean = (phone || '').replace(/\s+/g, '');
    if (!clean) return;
    Linking.openURL(`tel:${clean}`);
  };

  const openWebsite = (website?: string, source?: string) => {
    const w = website || source;
    if (!w) return; const url = w.startsWith('http') ? w : `https://${w}`; Linking.openURL(url);
  };

  const openMaps = (lat?: number, lng?: number, label?: string) => {
    if (lat == null || lng == null) return;
    const query = encodeURIComponent(label || 'Itinéraire');
    const url = Platform.select({
      ios: `http://maps.apple.com/?ll=${lat},${lng}&q=${query}`,
      android: `geo:${lat},${lng}?q=${lat},${lng}(${query})`,
      default: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
    }) as string;
    Linking.openURL(url);
  };

  const RatingRow = ({ value }: { value?: number }) => {
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
  const PhotoCarousel = ({ photos, onPhotoPress }: { photos: string[]; onPhotoPress: (index: number) => void }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollViewRef = useRef<ScrollView>(null);
    const CARD_WIDTH = SCREEN_WIDTH - 32; // Padding de la carte
    const IMAGE_WIDTH = CARD_WIDTH - 32; // Padding interne

    const handleScroll = (event: any) => {
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

  const renderItem = ({ item }: { item: any }) => {
    const title: string = item?.title || item?.name || '';
    const summary: string | undefined = item?.summary || item?.description;
    const commune: string | undefined = item?.commune;
    const website: string | undefined = item?.website;
    const source: string | undefined = item?.source || item?.site;
    const phone: string | undefined = item?.phone;
    const lat: number | undefined = item?.lat;
    const lng: number | undefined = item?.lng;
    const photos: string[] | undefined = item?.photos;
    const rating: number | undefined = item?.rating;
    const isLocal: boolean = !!item?.__local;

    return (
      <View style={styles.card}>
        {isLocal ? (
          <View style={styles.localActionsRow}>
            <TouchableOpacity onPress={() => router.push(`/annonceur_edit/${encodeURIComponent(item?.id || '')}`)}>
              <Text style={styles.localActionText}>Modifier</Text>
            </TouchableOpacity>
            <Text style={{ color: '#999' }}>•</Text>
            <TouchableOpacity onPress={async () => {
              try {
                const raw = await AsyncStorage.getItem('loisirs_user_items');
                const arr = raw ? JSON.parse(raw) : [];
                const next = arr.filter((x: any) => x.id !== item?.id);
                await AsyncStorage.setItem('loisirs_user_items', JSON.stringify(next));
                setUserItems(next.map((x: any) => ({ ...x, __local: true })));
              } catch {}
            }}>
              <Text style={[styles.localActionText, { color: '#D32F2F' }]}>Supprimer</Text>
            </TouchableOpacity>
          </View>
        ) : null}
        {photos && photos.length > 0 ? (
          <TouchableOpacity onPress={() => openPhotos(photos)} activeOpacity={0.8}>
            <Image source={{ uri: photos[0] }} style={styles.cardThumb} resizeMode="cover" />
          </TouchableOpacity>
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
        {photos && photos.length > 1 ? (
          <TouchableOpacity onPress={() => openPhotos(photos)}>
            <Text style={styles.photosLink}>Voir toutes les photos ({photos.length})</Text>
          </TouchableOpacity>
        ) : null}
        <View style={styles.actionsRow}>
          {phone ? (
            <TouchableOpacity onPress={() => openPhone(phone)} style={[styles.badgeBtn, styles.badgeGreen]}>
              <Ionicons name="call" size={16} color="#fff" />
              <Text style={styles.badgeText}>Appeler</Text>
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
              <Text style={styles.localityLabelSmall}>Localité </Text>
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

function ModeCapsule({ label, active, onPress, color, icon }: { label: string; active?: boolean; onPress: () => void; color: string; icon: any }) {
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
  capsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' },
  localityLine: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  localityLabelSmall: { color: '#444', fontSize: 13 },
  localityValue: { color: '#222', fontSize: 16, fontWeight: '400' },
  modeCapsule: { borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  modeCapsuleText: { fontWeight: '800' },

  successBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, backgroundColor: '#E8F5E9', borderWidth: 1, borderColor: '#C8E6C9', marginBottom: 8 },
  successText: { color: '#0A7C3A', fontWeight: '700' },

  catWrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  catChip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0' },
  catChipActive: { backgroundColor: '#0D6EFD', borderColor: '#0D6EFD' },
  catChipText: { color: '#111', fontWeight: '700' },
  catChipTextActive: { color: '#fff', fontWeight: '800' },

  searchLabel: { color: '#222', fontSize: 14, fontWeight: '700', marginBottom: 6, marginTop: 8 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 6 },
  searchInput: { flex: 1, color: '#222', paddingVertical: 2 },
  suggestBox: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, marginTop: 4, marginBottom: 8, overflow: 'hidden' },
  suggestItem: { paddingVertical: 10, paddingHorizontal: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  suggestText: { color: '#222' },
  locErrorText: { color: '#D32F2F', fontSize: 12, marginBottom: 8 },

  localActionsRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 10, marginBottom: 6 },
  localActionText: { color: '#0D6EFD', fontWeight: '700' },

  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2 },
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
});
