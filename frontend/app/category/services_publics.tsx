import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Platform, FlatList, Linking, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../src/context/AuthContext';
import * as Location from 'expo-location';

// PAGE ISOLÉE: Services publics
// Toutes les modifications ici n'affectent PAS les autres pages.

const HEADER_BG = { uri: 'https://customer-assets.emergentagent.com/job_allo-assistance/artifacts/7mhah4lt_services_publics_bg.png' };

type Phone = { label?: string; tel?: string };

type ListCard = {
  title: string;
  summary?: string;
  source?: string;
  phones?: Phone[];
  lat?: number | null;
  lng?: number | null;
  city?: string;
  commune?: string;
  query?: string; // fallback itinéraire
  distanceKm?: number | null; // calculée à la volée
};

// Contenu générique (onglet Tous)
const GENERIC_CONTENT: ListCard[] = [
  { title: 'CNPS (Caisse Nationale de Prévoyance Sociale)', summary: 'Protection sociale des travailleurs et prestations (allocations, pensions).', source: 'https://www.cnps.ci', phones: [{ label: 'Service client', tel: '2720251000' }] },
  { title: 'CNAM (Couverture Maladie Universelle)', summary: 'Information et prise en charge santé via la CMU (assurance maladie).', source: 'https://www.cnam.ci', phones: [{ label: 'Numéro vert', tel: '143' }] },
  { title: "Impôts Côte d’Ivoire (DGI)", summary: 'Déclarations et paiements en ligne, informations fiscales (particuliers et entreprises).', source: 'https://www.dgi.gouv.ci', phones: [{ label: 'Standard', tel: '2720252525' }] },
  { title: 'Douanes ivoiriennes', summary: 'Renseignements et formalités douanières (import/export).', source: 'https://www.douanes.ci', phones: [{ label: 'Ligne info', tel: '2720210800' }] },
];

// Données locales par capsule (exemples enrichis – coordonnées approximatives)
const LOCAL_ENTRIES: (ListCard & { key: FilterKey })[] = [
  // Mairies
  { key: 'mairies', title: 'Mairie de Cocody', summary: 'Accueil, état civil, démarches locales', city: 'Abidjan', commune: 'Cocody', lat: 5.355, lng: -3.985, query: 'Mairie de Cocody, Abidjan' },
  { key: 'mairies', title: 'Mairie du Plateau', summary: 'Services municipaux du Plateau', city: 'Abidjan', commune: 'Plateau', lat: 5.325, lng: -4.019, query: 'Mairie du Plateau, Abidjan' },
  { key: 'mairies', title: 'Mairie de Marcory', summary: 'Services municipaux de Marcory', city: 'Abidjan', commune: 'Marcory', lat: 5.310, lng: -3.985, query: 'Mairie de Marcory, Abidjan' },
  { key: 'mairies', title: 'Mairie de Yopougon', summary: 'Services municipaux de Yopougon', city: 'Abidjan', commune: 'Yopougon', lat: 5.360, lng: -4.080, query: 'Mairie de Yopougon, Abidjan' },
  { key: 'mairies', title: 'Mairie de Treichville', summary: 'Services municipaux de Treichville', city: 'Abidjan', commune: 'Treichville', lat: 5.300, lng: -4.010, query: 'Mairie de Treichville, Abidjan' },

  // Commissariats
  { key: 'commissariats', title: 'Commissariat de Police – Cocody 8e', summary: 'Police nationale (Cocody)', city: 'Abidjan', commune: 'Cocody', lat: 5.360, lng: -3.990, query: 'Commissariat Cocody 8e, Abidjan', phones: [{ label: 'Police Secours', tel: '100' }] },
  { key: 'commissariats', title: 'Commissariat de Police – Plateau', summary: 'Police nationale (Plateau)', city: 'Abidjan', commune: 'Plateau', lat: 5.326, lng: -4.018, query: 'Commissariat Plateau, Abidjan', phones: [{ label: 'Police Secours', tel: '100' }] },
  { key: 'commissariats', title: 'Commissariat de Police – Marcory', summary: 'Police nationale (Marcory)', city: 'Abidjan', commune: 'Marcory', lat: 5.309, lng: -3.989, query: 'Commissariat Marcory, Abidjan', phones: [{ label: 'Police Secours', tel: '100' }] },
  { key: 'commissariats', title: 'Commissariat de Police – Yopougon', summary: 'Police nationale (Yopougon)', city: 'Abidjan', commune: 'Yopougon', lat: 5.365, lng: -4.086, query: 'Commissariat Yopougon, Abidjan', phones: [{ label: 'Police Secours', tel: '100' }] },
  { key: 'commissariats', title: 'Commissariat de Police – Treichville', summary: 'Police nationale (Treichville)', city: 'Abidjan', commune: 'Treichville', lat: 5.300, lng: -4.005, query: 'Commissariat Treichville, Abidjan', phones: [{ label: 'Police Secours', tel: '100' }] },

  // Préfecture de police (référence principale)
  { key: 'prefecture', title: 'Préfecture de Police d’Abidjan', summary: 'Direction Police (Abidjan)', city: 'Abidjan', commune: 'Plateau', lat: 5.330, lng: -4.020, query: 'Préfecture de Police Abidjan', phones: [{ label: 'Police Secours', tel: '100' }] },

  // Palais de justice
  { key: 'palais', title: 'Palais de Justice du Plateau', summary: 'Tribunaux & services judiciaires', city: 'Abidjan', commune: 'Plateau', lat: 5.324, lng: -4.017, query: 'Palais de Justice Plateau Abidjan' },

  // Pompiers (GSPM / CPC)
  { key: 'pompiers', title: 'GSPM – Groupement Sapeurs-Pompiers Militaires', summary: 'Urgences & secours 24/7', city: 'Abidjan', commune: 'Plateau', lat: null, lng: null, query: 'GSPM Abidjan', phones: [{ label: 'Numéro court', tel: '180' }] },
  { key: 'pompiers', title: 'Caserne de pompiers – Marcory', summary: 'Centre de Protection Civile (indicatif)', city: 'Abidjan', commune: 'Marcory', lat: 5.311, lng: -3.990, query: 'Caserne pompiers Marcory Abidjan', phones: [{ label: 'Numéro court', tel: '180' }] },

  // CNI (ONECI)
  { key: 'cni', title: 'Centre CNI – Cocody (ONECI)', summary: 'Carte Nationale d’Identité', city: 'Abidjan', commune: 'Cocody', lat: null, lng: null, query: 'ONECI Cocody Abidjan', source: 'https://oneci.ci' },
  { key: 'cni', title: 'Centre CNI – Plateau (ONECI)', summary: 'Carte Nationale d’Identité', city: 'Abidjan', commune: 'Plateau', lat: null, lng: null, query: 'ONECI Plateau Abidjan', source: 'https://oneci.ci' },
  { key: 'cni', title: 'Centre CNI – Yopougon (ONECI)', summary: 'Carte Nationale d’Identité', city: 'Abidjan', commune: 'Yopougon', lat: null, lng: null, query: 'ONECI Yopougon Abidjan', source: 'https://oneci.ci' },
  { key: 'cni', title: 'Centre CNI – Treichville (ONECI)', summary: 'Carte Nationale d’Identité', city: 'Abidjan', commune: 'Treichville', lat: null, lng: null, query: 'ONECI Treichville Abidjan', source: 'https://oneci.ci' },
];

// Capsules
const CAPS: { key: FilterKey; label: string; color: string }[] = [
  { key: 'mairies', label: 'Mairies', color: '#0D6EFD' },
  { key: 'commissariats', label: 'Commissariats', color: '#0A7C3A' },
  { key: 'prefecture', label: 'Préfecture de police', color: '#FF8A00' },
  { key: 'palais', label: 'Palais de justice', color: '#6C63FF' },
  { key: 'pompiers', label: 'Caserne de pompiers', color: '#E53935' },
  { key: 'cni', label: 'CNI', color: '#009688' },
];

type FilterKey = 'all' | 'mairies' | 'commissariats' | 'prefecture' | 'palais' | 'pompiers' | 'cni';

type Mode = 'nearby' | 'communes';

// Communes (autocomplétion)
const ABJ_COMMUNES = ['Abobo','Adjamé','Anyama','Attécoubé','Bingerville','Cocody','Koumassi','Marcory','Plateau','Port-Bouët','Treichville','Songon','Yopougon'];

export default function ServicesPublicsIsolated() {
  const router = useRouter();
  const { user } = useAuth();

  const [mode, setMode] = useState<Mode>('communes');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locError, setLocError] = useState<string | null>(null);

  // Localité affichée
  const [effectiveCity, setEffectiveCity] = useState<string>(user?.city || (user as any)?.commune || 'Abidjan');
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (user?.city || (user as any)?.commune) {
          if (mounted) setEffectiveCity(user.city || (user as any)?.commune);
        } else {
          const raw = await AsyncStorage.getItem('auth_user');
          if (raw) {
            const u = JSON.parse(raw);
            const loc = u?.city || u?.commune || 'Abidjan';
            if (mounted) setEffectiveCity(loc);
          }
        }
      } catch {}
    })();
    return () => { mounted = false; };
  }, [user?.city]);

  // Demande de localisation lorsque le mode Autour de moi est activé
  useEffect(() => {
    (async () => {
      if (mode !== 'nearby' || coords) return;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocError("Autorisation localisation refusée");
          return;
        }
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      } catch (e) {
        setLocError('Localisation indisponible');
      }
    })();
  }, [mode, coords]);

  const [filter, setFilter] = useState<FilterKey>('all');

  // Recherche par commune
  const [communeQuery, setCommuneQuery] = useState('');
  const [selectedCommune, setSelectedCommune] = useState<string | null>(null);
  const suggestions = useMemo(() => {
    const q = communeQuery.trim().toLowerCase();
    if (!q) return [] as string[];
    return ABJ_COMMUNES.filter(c => c.toLowerCase().includes(q)).slice(0, 8);
  }, [communeQuery]);

  const norm = (s?: string) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
  const locality = selectedCommune || effectiveCity;
  const isAbidjan = norm(locality) === norm('Abidjan');

  const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const computeLocalEntries = useCallback((key: Exclude<FilterKey, 'all'>): ListCard[] => {
    let base = LOCAL_ENTRIES.filter((e) => e.key === key);
    if (mode === 'communes') {
      base = base.filter((e) => {
        if (isAbidjan) return norm(e.city) === norm('Abidjan');
        return norm(e.commune) === norm(locality) || norm(e.city) === norm(locality);
      });
      return base;
    }
    // Autour de moi
    if (!coords) return base; // affichage brut si pas de localisation
    const withDistances = base.map((e) => {
      if (typeof e.lat === 'number' && typeof e.lng === 'number') {
        return { ...e, distanceKm: haversine(coords.lat, coords.lng, e.lat!, e.lng!) } as ListCard & { key: FilterKey };
      }
      return { ...e, distanceKm: null } as ListCard & { key: FilterKey };
    });
    // Tri par distance, puis présence de distance
    return withDistances.sort((a, b) => {
      const da = a.distanceKm ?? 9999;
      const db = b.distanceKm ?? 9999;
      return da - db;
    });
  }, [mode, coords, locality, isAbidjan]);

  const listData: ListCard[] = useMemo(() => {
    if (filter === 'all') return GENERIC_CONTENT;
    return computeLocalEntries(filter as Exclude<FilterKey, 'all'>);
  }, [filter, computeLocalEntries]);

  // Actions
  const openPhone = (phone: string) => { const clean = (phone || '').replace(/\s+/g, ''); Linking.openURL(`tel:${clean}`); };
  const openSource = async (url?: string) => { if (!url) return; const safe = url.startsWith('http') ? url : `https://${url}`; try { await Linking.openURL(safe); } catch {} };
  const openDirections = async (label?: string, lat?: number | null, lng?: number | null, query?: string) => {
    const q = encodeURIComponent(query || label || 'Itinéraire');
    let url: string;
    if (lat != null && lng != null) {
      url = Platform.select({ ios: `http://maps.apple.com/?ll=${lat},${lng}&q=${q}`, android: `geo:${lat},${lng}?q=${lat},${lng}(${q})`, default: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` }) as string;
    } else {
      url = Platform.select({ ios: `http://maps.apple.com/?q=${q}`, android: `geo:0,0?q=${q}`, default: `https://www.google.com/maps/search/?api=1&query=${q}` }) as string;
    }
    try { await Linking.openURL(url); } catch {}
  };

  // Rendu item
  const renderItem = useCallback(({ item }: { item: ListCard }) => {
    const { title, summary, source, phones, lat, lng, query, commune, distanceKm } = item || ({} as ListCard);
    return (
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>{title}</Text>
          {(commune || typeof distanceKm === 'number') ? (
            <View style={styles.miniBadgesRow}>
              {commune ? (
                <View style={[styles.smallBadge, styles.smallBadgeCommune]}><Text style={styles.smallBadgeText}>{commune}</Text></View>
              ) : null}
              {typeof distanceKm === 'number' && mode === 'nearby' ? (
                <View style={[styles.smallBadge, styles.smallBadgeDistance]}><Text style={[styles.smallBadgeText, { color: '#0D6EFD' }]}>{distanceKm.toFixed(1)} km</Text></View>
              ) : null}
            </View>
          ) : null}
        </View>
        {summary ? <Text style={styles.cardSummary}>{summary}</Text> : null}
        <View style={styles.actionsRow}>
          {(phones || []).map((p, idx) => (
            <TouchableOpacity key={`ph-${idx}`} onPress={() => p?.tel && openPhone(p.tel!)} style={[styles.badgeBtn, styles.badgeGreen]}>
              <Ionicons name="call" size={16} color="#fff" />
              <Text style={styles.badgeText}>{p?.label ? `${p.label} • ${p.tel}` : p?.tel}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={() => openDirections(title, lat, lng, query)} style={[styles.badgeBtn, styles.badgeBlue]} accessibilityRole="button" accessibilityLabel="Itinéraire">
            <Ionicons name="navigate" size={16} color="#0D6EFD" />
            <Text style={styles.badgeTextBlue}>Itinéraire</Text>
          </TouchableOpacity>
          {source ? (
            <TouchableOpacity onPress={() => openSource(source)} style={[styles.badgeBtn, styles.badgeAlt]} accessibilityRole="button" accessibilityLabel="Site officiel">
              <Ionicons name="globe" size={16} color="#0A7C3A" />
              <Text style={styles.badgeTextAlt}>Site officiel</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  }, [mode]);

  // Header de la liste: Pastilles mode (style capsules Éducation) + Localité + Recherche + Capsules
  const ListHeader = () => (
    <View style={styles.headerControls}>
      {/* Pastilles mode – style capsules (Éducation-like) */}
      <View style={styles.modeRow}>
        <ModeCapsule label="Autour de moi" icon="navigate" color="#0D6EFD" active={mode === 'nearby'} onPress={() => setMode('nearby')} />
        <ModeCapsule label="Communes" icon="home" color="#0A7C3A" active={mode === 'communes'} onPress={() => setMode('communes')} />
      </View>

      <View style={styles.localityRow}>
        <Ionicons name="location" size={26} color="#FF8A00" />
        <Text style={styles.localityValue}>{selectedCommune || effectiveCity}</Text>
      </View>

      {/* Barre de recherche par commune (visible en mode Communes) */}
      {mode === 'communes' ? (
        <>
          <View style={styles.searchRow}>
            <Ionicons name="search" size={18} color="#888" />
            <TextInput
              style={styles.searchInput}
              value={communeQuery}
              onChangeText={setCommuneQuery}
              placeholder="Rechercher une commune"
              placeholderTextColor="#999"
              returnKeyType="search"
              onSubmitEditing={() => {
                if (suggestions.length > 0) { setSelectedCommune(suggestions[0]); setCommuneQuery(''); }
              }}
            />
            {selectedCommune ? (
              <TouchableOpacity onPress={() => setSelectedCommune(null)} accessibilityRole="button" accessibilityLabel="Effacer la sélection">
                <Ionicons name="close-circle" size={18} color="#999" />
              </TouchableOpacity>
            ) : null}
          </View>
          {communeQuery && suggestions.length > 0 ? (
            <View style={styles.suggestBox}>
              {suggestions.map((s) => (
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

      <View style={styles.capsRow}>
        {CAPS.map((c) => (
          <PressableCapsule key={c.key} label={c.label} color={c.color} active={filter === c.key} onPress={() => setFilter(c.key)} />
        ))}
        <PressableCapsule key="all" label="Tous" color="#607D8B" active={filter === 'all'} onPress={() => setFilter('all')} />
      </View>

      <Text style={styles.sectionTitle}>
        {filter === 'all' ? 'Administrations & Portails' : CAPS.find(x => x.key === filter)?.label}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header image */}
      <View style={styles.headerWrapper}>
        <ImageBackground source={HEADER_BG} style={styles.header} resizeMode="cover">
          <LinearGradient colors={["rgba(0,0,0,0.45)", "rgba(0,0,0,0.2)", "rgba(0,0,0,0)"]} style={StyleSheet.absoluteFillObject as any} />
          <View style={styles.headerTopRow}>
            <TouchableOpacity onPress={() => router.replace('/(tabs)/home')} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Retour">
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle}>Services publics</Text>
            <View style={styles.subtitleWrap}>
              <Text style={styles.headerSubtitle}>Démarches • Numéros utiles • Sites officiels</Text>
            </View>
          </View>
        </ImageBackground>
      </View>

      {/* Ombre sous header */}
      <View style={[styles.headerShadow, Platform.select({
        web: { boxShadow: '0 18px 32px rgba(0,0,0,0.28)' } as any,
        ios: { shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 14, shadowOffset: { width: 0, height: 14 } },
        android: { elevation: 14 },
      })]} pointerEvents="none" />

      <FlatList
        contentContainerStyle={styles.listContent}
        data={listData}
        renderItem={renderItem}
        keyExtractor={(it, idx) => `${it.title}-${idx}`}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={<View style={styles.emptyBox}><Text style={styles.emptyText}>Aucun contenu disponible pour cette sélection.</Text></View>}
      />
    </View>
  );
}

function PressableCapsule({ label, active, onPress, color }: { label: string; active?: boolean; onPress: () => void; color: string; }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.capsule, { backgroundColor: active ? color : '#F0F3F6', borderColor: active ? color : '#DDE3EA' }]} accessibilityRole="button" accessibilityLabel={label}>
      <Text style={[styles.capsuleText, { color: active ? '#fff' : '#222' }]}>{label}</Text>
    </TouchableOpacity>
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
  modeRow: { flexDirection: 'row', gap: 12, marginBottom: 10, flexWrap: 'wrap' },
  localityRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  localityValue: { color: '#222', fontSize: 18 },

  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 6 },
  searchInput: { flex: 1, color: '#222', paddingVertical: 2 },
  suggestBox: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, marginTop: 4, overflow: 'hidden' },
  suggestItem: { paddingVertical: 10, paddingHorizontal: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  suggestText: { color: '#222' },

  capsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8, marginBottom: 8 },
  capsule: { borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1 },
  capsuleText: { fontWeight: '400' },

  // Mode capsules (style Éducation-like)
  modeCapsule: { borderRadius: 999, paddingVertical: 10, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 8 },
  modeCapsuleText: { fontWeight: '400' },

  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#222', marginTop: 4, marginBottom: 6 },

  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#222', flex: 1, paddingRight: 8 },
  cardSummary: { marginTop: 6, color: '#444', lineHeight: 20 },

  miniBadgesRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  smallBadge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#F0F3F6' },
  smallBadgeCommune: { backgroundColor: '#F1F5F9' },
  smallBadgeDistance: { backgroundColor: '#E3F2FD' },
  smallBadgeText: { fontSize: 12, color: '#222', fontWeight: '700' },

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