import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, FlatList, TouchableOpacity, Platform, Linking, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONTENT_BY_CATEGORY } from '../../src/utils/categoryContent';

const HEADER_BG = { uri: 'https://customer-assets.emergentagent.com/job_smartcommunity-2/artifacts/x28hv0dw_loisirst_bg.png' };

// Communes d'Abidjan + villes clés CI
const ABJ_COMMUNES = [
  'Abobo','Adjamé','Anyama','Attécoubé','Bingerville','Cocody','Koumassi','Marcory','Plateau','Port-Bouët','Treichville','Songon','Yopougon',
  // Étendues CI
  'Grand-Bassam','Assinie','Yamoussoukro','Bouaké','San-Pedro','Korhogo','Daloa','Man','Gagnoa'
];

type Mode = 'nearby' | 'communes';

export default function LoisirsTourisme() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('communes');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locError, setLocError] = useState<string | null>(null);

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

  const [serviceQuery, setServiceQuery] = useState('');

  // Données Loisirs & Tourisme (lecture seule)
  const rawData = useMemo(() => {
    const raw = CONTENT_BY_CATEGORY?.loisirs_tourisme || [];
    return Array.isArray(raw) ? raw : [];
  }, []);

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
    let list = rawData;

    // Filtrage commune
    if (selectedCommune) {
      list = list.filter((it: any) => (it?.commune || '').toLowerCase() === selectedCommune.toLowerCase());
    }

    // Filtrage texte
    if (serviceQuery.trim()) {
      const q = serviceQuery.trim().toLowerCase();
      list = list.filter((it: any) => {
        const title = (it?.title || it?.name || '').toLowerCase();
        const summary = (it?.summary || it?.description || '').toLowerCase();
        const commune = (it?.commune || '').toLowerCase();
        const tag = (it?.tag || '').toLowerCase();
        return title.includes(q) || summary.includes(q) || commune.includes(q) || tag.includes(q);
      });
    }

    // Mode Autour de moi
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
  }, [rawData, selectedCommune, serviceQuery, mode, coords]);

  const openPhone = (phone?: string) => {
    const clean = (phone || '').replace(/\s+/g, '');
    if (!clean) return;
    Linking.openURL(`tel:${clean}`);
  };

  const openWebsite = (website?: string) => {
    if (!website) return; const url = website.startsWith('http') ? website : `https://${website}`; Linking.openURL(url);
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

  const renderItem = ({ item }: { item: any }) => {
    const title: string = item?.title || item?.name || '';
    const summary: string | undefined = item?.summary || item?.description;
    const commune: string | undefined = item?.commune;
    const source: string | undefined = item?.source || item?.website;
    const phone: string | undefined = item?.phone;
    const lat: number | undefined = item?.lat;
    const lng: number | undefined = item?.lng;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
        {summary ? <Text style={styles.cardSummary}>{summary}</Text> : null}
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
              <Text style={styles.badgeText}>Appeler</Text>
            </TouchableOpacity>
          ) : null}
          {(lat != null && lng != null) ? (
            <TouchableOpacity onPress={() => openMaps(lat, lng, title)} style={[styles.badgeBtn, styles.badgeBlue]}>
              <Ionicons name="navigate" size={16} color="#0D6EFD" />
              <Text style={styles.badgeTextBlue}>Itinéraire</Text>
            </TouchableOpacity>
          ) : null}
          {source ? (
            <TouchableOpacity onPress={() => openWebsite(source)} style={[styles.badgeBtn, styles.badgeAlt]}>
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
            <Text style={styles.headerTitle}>Loisirs & Tourisme</Text>
            <View style={styles.subtitleWrap}>
              <Text style={styles.headerSubtitle}>Hôtels, plages, sites, restaurants…</Text>
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
        ListHeaderComponent={
          <View style={styles.headerControls}>
            {/* Ligne Localité + capsules + valeur en face */}
            <View style={styles.localityCapsRow}>
              <Text style={styles.localityLabel}>Localité</Text>
              <ModeCapsule label="Autour de moi" icon="navigate" color="#0D6EFD" active={mode === 'nearby'} onPress={() => setMode('nearby')} />
              <ModeCapsule label="Communes" icon="home" color="#0A7C3A" active={mode === 'communes'} onPress={() => setMode('communes')} />
              <View style={{ flex: 1 }} />
              <Text style={styles.localityValue}>{selectedCommune || effectiveCity}</Text>
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

            {/* Recherche services */}
            <Text style={styles.searchLabel}>Recherche (hôtel, plage, site touristique, restaurant, Airbnb, aire de jeux…)</Text>
            <View style={styles.searchRow}>
              <Ionicons name="search" size={18} color="#888" />
              <TextInput
                style={styles.searchInput}
                value={serviceQuery}
                onChangeText={setServiceQuery}
                placeholder="Rechercher un lieu ou une activité"
                placeholderTextColor="#999"
                returnKeyType="search"
              />
              {serviceQuery ? (
                <TouchableOpacity onPress={() => setServiceQuery('')} accessibilityRole="button" accessibilityLabel="Effacer la recherche">
                  <Ionicons name="close-circle" size={18} color="#999" />
                </TouchableOpacity>
              ) : null}
            </View>
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
  headerTopRow: { paddingTop: Platform.select({ ios: 52, android: 24, default: 16 }), paddingHorizontal: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  headerTitleBox: { position: 'absolute', bottom: 16, left: 16, right: 16 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '800' },
  headerSubtitle: { color: '#fff' },
  subtitleWrap: { alignSelf: 'flex-start', backgroundColor: 'rgba(0,0,0,0.25)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginTop: 4 },

  headerShadow: { height: 10, width: '100%', backgroundColor: 'transparent' },

  listContent: { paddingTop: 16, paddingHorizontal: 16, paddingBottom: 24 },

  headerControls: { marginBottom: 10 },
  localityCapsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' },
  localityLabel: { color: '#222', fontSize: 14, fontWeight: '700' },
  modeCapsule: { borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  modeCapsuleText: { fontWeight: '800' },
  localityValue: { color: '#222', fontSize: 16, fontWeight: '600' },

  searchLabel: { color: '#222', fontSize: 14, fontWeight: '700', marginBottom: 6, marginTop: 8 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 6 },
  searchInput: { flex: 1, color: '#222', paddingVertical: 2 },
  suggestBox: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, marginTop: 4, marginBottom: 8, overflow: 'hidden' },
  suggestItem: { paddingVertical: 10, paddingHorizontal: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  suggestText: { color: '#222' },
  locErrorText: { color: '#D32F2F', fontSize: 12, marginBottom: 8 },

  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#222', flex: 1, paddingRight: 8 },
  cardSummary: { marginTop: 6, color: '#444', lineHeight: 20 },
  communeBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, marginBottom: 6 },
  communeBadgeText: { fontSize: 13, color: '#FF8A00', fontWeight: '600' },

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
