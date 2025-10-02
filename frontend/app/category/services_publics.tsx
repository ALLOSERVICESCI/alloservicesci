import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Platform, FlatList, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../src/context/AuthContext';

// PAGE ISOLÉE: Services publics
// - Autonome (pas de dépendance à [slug].tsx)
// - Données locales propres à la page
// - Toutes les modifs ici n'impactent PAS les autres pages

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
};

// Contenu générique (inchangé)
const GENERIC_CONTENT: ListCard[] = [
  {
    title: 'CNPS (Caisse Nationale de Prévoyance Sociale)',
    summary: 'Protection sociale des travailleurs et prestations (allocations, pensions).',
    source: 'https://www.cnps.ci',
    phones: [{ label: 'Service client', tel: '2720251000' }],
  },
  {
    title: 'CNAM (Couverture Maladie Universelle)',
    summary: 'Information et prise en charge santé via la CMU (assurance maladie).',
    source: 'https://www.cnam.ci',
    phones: [{ label: 'Numéro vert', tel: '143' }],
  },
  {
    title: "Impôts Côte d’Ivoire (DGI)",
    summary: 'Déclarations et paiements en ligne, informations fiscales (particuliers et entreprises).',
    source: 'https://www.dgi.gouv.ci',
    phones: [{ label: 'Standard', tel: '2720252525' }],
  },
  {
    title: 'Douanes ivoiriennes',
    summary: 'Renseignements et formalités douanières (import/export).',
    source: 'https://www.douanes.ci',
    phones: [{ label: 'Ligne info', tel: '2720210800' }],
  },
];

// Données locales « terrain » par capsule (exemples guidés)
// NB: Coordonnées approximatives uniquement à titre d’orientation — l’itinéraire peut aussi s’ouvrir via requête texte
const LOCAL_ENTRIES: ListCard & { key: FilterKey }[] = [
  // Mairies
  { key: 'mairies', title: 'Mairie de Cocody', summary: 'Accueil, état civil, démarches locales', city: 'Abidjan', commune: 'Cocody', lat: 5.355, lng: -3.985, query: 'Mairie de Cocody, Abidjan', phones: [] },
  { key: 'mairies', title: 'Mairie du Plateau', summary: 'Services municipaux du Plateau', city: 'Abidjan', commune: 'Plateau', lat: 5.325, lng: -4.019, query: 'Mairie du Plateau, Abidjan', phones: [] },

  // Commissariats
  { key: 'commissariats', title: 'Commissariat de Police – Cocody 8e', summary: 'Police nationale (Cocody)', city: 'Abidjan', commune: 'Cocody', lat: 5.36, lng: -3.99, query: 'Commissariat Cocody 8e, Abidjan', phones: [{ label: 'Police Secours', tel: '100' }] },
  { key: 'commissariats', title: 'Commissariat de Police – Plateau', summary: 'Police nationale (Plateau)', city: 'Abidjan', commune: 'Plateau', lat: 5.326, lng: -4.018, query: 'Commissariat Plateau, Abidjan', phones: [{ label: 'Police Secours', tel: '100' }] },

  // Préfecture de police
  { key: 'prefecture', title: 'Préfecture de Police d’Abidjan', summary: 'Direction Police (Abidjan)', city: 'Abidjan', commune: 'Plateau', lat: 5.330, lng: -4.020, query: 'Préfecture de Police Abidjan', phones: [{ label: 'Police Secours', tel: '100' }] },

  // Palais de justice
  { key: 'palais', title: 'Palais de Justice du Plateau', summary: 'Tribunaux & services judiciaires', city: 'Abidjan', commune: 'Plateau', lat: 5.324, lng: -4.017, query: 'Palais de Justice Plateau Abidjan', phones: [] },

  // Pompiers (GSPM)
  { key: 'pompiers', title: 'GSPM – Groupement Sapeurs-Pompiers Militaires', summary: 'Urgences & secours 24/7', city: 'Abidjan', commune: 'Plateau', lat: null, lng: null, query: 'GSPM Abidjan', phones: [{ label: 'Numéro court', tel: '180' }] },

  // CNI (ONECI)
  { key: 'cni', title: 'Centre CNI – Cocody (ONECI)', summary: 'Carte Nationale d’Identité', city: 'Abidjan', commune: 'Cocody', lat: null, lng: null, query: 'ONECI Cocody Abidjan', phones: [], source: 'https://oneci.ci' },
  { key: 'cni', title: 'Centre CNI – Plateau (ONECI)', summary: 'Carte Nationale d’Identité', city: 'Abidjan', commune: 'Plateau', lat: null, lng: null, query: 'ONECI Plateau Abidjan', phones: [], source: 'https://oneci.ci' },
];

// Capsules de filtre
const CAPS: { key: FilterKey; label: string; color: string }[] = [
  { key: 'mairies', label: 'Mairies', color: '#0D6EFD' },
  { key: 'commissariats', label: 'Commissariats', color: '#0A7C3A' },
  { key: 'prefecture', label: 'Préfecture de police', color: '#FF8A00' },
  { key: 'palais', label: 'Palais de justice', color: '#6C63FF' },
  { key: 'pompiers', label: 'Caserne de pompiers', color: '#E53935' },
  { key: 'cni', label: 'CNI', color: '#009688' },
];

type FilterKey = 'all' | 'mairies' | 'commissariats' | 'prefecture' | 'palais' | 'pompiers' | 'cni';

export default function ServicesPublicsIsolated() {
  const router = useRouter();
  const { user } = useAuth();

  // Localité affichée
  const [effectiveCity, setEffectiveCity] = useState<string>(user?.city || (user as any)?.commune || 'Abidjan');
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (user?.city || (user as any)?.commune) {
          if (mounted) setEffectiveCity(user.city || (user as any)?.commune);
          return;
        }
        const raw = await AsyncStorage.getItem('auth_user');
        if (!raw) return;
        const u = JSON.parse(raw);
        const loc = u?.city || u?.commune || 'Abidjan';
        if (mounted) setEffectiveCity(loc);
      } catch {}
    })();
    return () => { mounted = false; };
  }, [user?.city]);

  const [filter, setFilter] = useState<FilterKey>('all');

  const norm = (s?: string) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
  const isAbidjan = norm(effectiveCity) === norm('Abidjan');

  const computeLocalEntries = useCallback((key: Exclude<FilterKey, 'all'>): ListCard[] => {
    // Filtre par clé, puis par localité: si Abidjan, on garde city==='Abidjan'; si commune (ex: Cocody), on privilégie commune
    return LOCAL_ENTRIES.filter((e) => e.key === key).filter((e) => {
      if (isAbidjan) return norm(e.city) === norm('Abidjan');
      // Commune spécifique
      return norm(e.commune) === norm(effectiveCity) || norm(e.city) === norm(effectiveCity);
    });
  }, [effectiveCity, isAbidjan]);

  const listData: ListCard[] = useMemo(() => {
    if (filter === 'all') return GENERIC_CONTENT;
    return computeLocalEntries(filter as Exclude<FilterKey, 'all'>);
  }, [filter, computeLocalEntries]);

  // Actions
  const openPhone = (phone: string) => {
    const clean = (phone || '').replace(/\s+/g, '');
    Linking.openURL(`tel:${clean}`);
  };
  const openSource = async (url?: string) => {
    if (!url) return;
    const safe = url.startsWith('http') ? url : `https://${url}`;
    try { await Linking.openURL(safe); } catch {}
  };
  const openDirections = async (label?: string, lat?: number | null, lng?: number | null, query?: string) => {
    const q = encodeURIComponent(query || label || 'Itinéraire');
    let url: string;
    if (lat != null && lng != null) {
      url = Platform.select({
        ios: `http://maps.apple.com/?ll=${lat},${lng}&q=${q}`,
        android: `geo:${lat},${lng}?q=${lat},${lng}(${q})`,
        default: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
      }) as string;
    } else {
      url = Platform.select({
        ios: `http://maps.apple.com/?q=${q}`,
        android: `geo:0,0?q=${q}`,
        default: `https://www.google.com/maps/search/?api=1&query=${q}`,
      }) as string;
    }
    try { await Linking.openURL(url); } catch {}
  };

  // Rendu item (ajout Itinéraire)
  const renderItem = useCallback(({ item }: { item: ListCard }) => {
    const { title, summary, source, phones, lat, lng, query } = item || {} as ListCard;
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{title}</Text>
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
  }, []);

  // Header de la liste: Localité + Capsules
  const ListHeader = () => (
    <View style={styles.headerControls}>
      <Text style={styles.localityText}>Localité : <Text style={styles.localityStrong}>{effectiveCity}</Text></Text>
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
            <Text style={styles.headerSubtitle}>Démarches • Numéros utiles • Sites officiels</Text>
          </View>
        </ImageBackground>
      </View>

      {/* Ombre sous header */}
      <View style={[styles.headerShadow, Platform.select({
        web: { boxShadow: '0 16px 28px rgba(0,0,0,0.18)' } as any,
        ios: { shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 10 } },
        android: { elevation: 10 },
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

const HEADER_HEIGHT = 250;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  headerWrapper: { height: HEADER_HEIGHT, width: '100%' },
  header: { flex: 1, width: '100%', height: '100%' },
  headerTopRow: { paddingTop: Platform.select({ ios: 52, android: 24, default: 16 }), paddingHorizontal: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  headerTitleBox: { position: 'absolute', bottom: 16, left: 16, right: 16 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '800' },
  headerSubtitle: { color: '#fff', opacity: 0.9, marginTop: 4 },

  headerShadow: { height: 10, width: '100%', backgroundColor: 'transparent' },

  listContent: { paddingTop: 16, paddingHorizontal: 16, paddingBottom: 24 },

  headerControls: { marginBottom: 10 },
  localityText: { color: '#222', fontSize: 14, marginBottom: 8 },
  localityStrong: { fontWeight: '800' },

  capsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  capsule: { borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1 },
  capsuleText: { fontWeight: '700' },

  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#222', marginTop: 4, marginBottom: 6 },

  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#222' },
  cardSummary: { marginTop: 6, color: '#444', lineHeight: 20 },

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