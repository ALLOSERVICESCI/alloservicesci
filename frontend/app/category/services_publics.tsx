import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Platform, FlatList, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../src/context/AuthContext';

// PAGE ISOLÉE: Services publics
// - Cette page n'utilise PAS le layout dynamique [slug].tsx
// - Elle ne lit/modifie PAS les données partagées (categoryContent)
// - Tout le contenu nécessaire est défini localement pour éviter tout impact ailleurs

const HEADER_BG = { uri: 'https://customer-assets.emergentagent.com/job_allo-assistance/artifacts/7mhah4lt_services_publics_bg.png' };

// Données locales (copie indépendante)
const SERVICES_PUBLICS_CONTENT: {
  title: string;
  summary: string;
  tag?: string;
  source?: string;
  phones?: { label: string; tel: string }[];
}[] = [
  {
    title: 'CNPS (Caisse Nationale de Prévoyance Sociale)',
    summary: 'Protection sociale des travailleurs et prestations (allocations, pensions).',
    tag: 'CNPS',
    source: 'https://www.cnps.ci',
    phones: [{ label: 'Service client', tel: '2720251000' }],
  },
  {
    title: 'CNAM (Couverture Maladie Universelle)',
    summary: 'Information et prise en charge santé via la CMU (assurance maladie).',
    tag: 'CNAM',
    source: 'https://www.cnam.ci',
    phones: [{ label: 'Numéro vert', tel: '143' }],
  },
  {
    title: "Impôts Côte d’Ivoire (DGI)",
    summary: 'Déclarations et paiements en ligne, informations fiscales (particuliers et entreprises).',
    tag: 'Fiscalité',
    source: 'https://www.dgi.gouv.ci',
    phones: [{ label: 'Standard', tel: '2720252525' }],
  },
  {
    title: 'Douanes ivoiriennes',
    summary: 'Renseignements et formalités douanières (import/export).',
    tag: 'Douanes',
    source: 'https://www.douanes.ci',
    phones: [{ label: 'Ligne info', tel: '2720210800' }],
  },
];

// Filtres capsules disponibles
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

  // Filtre sélectionné
  const [filter, setFilter] = useState<FilterKey>('all');

  // Mapping simple mots-clés pour filtrer (actuellement set vide car contenu local ne contient pas encore ces entités)
  const listData = useMemo(() => {
    if (filter === 'all') return SERVICES_PUBLICS_CONTENT;
    const keywords: Record<Exclude<FilterKey, 'all'>, string[]> = {
      mairies: ['mairie'],
      commissariats: ['commissariat', 'police'],
      prefecture: ['préfecture de police', 'prefecture'],
      palais: ['palais de justice', 'tribunal', 'justice'],
      pompiers: ['pompiers', 'gspm'],
      cni: ['cni', 'identit'],
    } as any;
    const k = (keywords as any)[filter] as string[];
    return SERVICES_PUBLICS_CONTENT.filter(it => {
      const hay = (it.title + ' ' + (it.summary || '')).toLowerCase();
      return k?.some((kk) => hay.includes(kk));
    });
  }, [filter]);

  const openPhone = (phone: string) => {
    const clean = (phone || '').replace(/\s+/g, '');
    Linking.openURL(`tel:${clean}`);
  };
  const openSource = async (url?: string) => {
    if (!url) return;
    const safe = url.startsWith('http') ? url : `https://${url}`;
    try { await Linking.openURL(safe); } catch {}
  };

  const renderItem = useCallback(({ item }: { item: any }) => {
    const { title, summary, source, phones } = item || {};
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{title}</Text>
        {summary ? <Text style={styles.cardSummary}>{summary}</Text> : null}
        <View style={styles.actionsRow}>
          {(phones || []).map((p: any, idx: number) => (
            <TouchableOpacity key={`ph-${idx}`} onPress={() => p?.tel && openPhone(p.tel)} style={[styles.badgeBtn, styles.badgeGreen]}>
              <Ionicons name="call" size={16} color="#fff" />
              <Text style={styles.badgeText}>{`${p?.label || ''} • ${p?.tel || ''}`}</Text>
            </TouchableOpacity>
          ))}
          {source ? (
            <TouchableOpacity onPress={() => openSource(source)} style={[styles.badgeBtn, styles.badgeAlt]} accessibilityRole="button" accessibilityLabel="Site officiel">
              <Ionicons name="globe" size={16} color="#0A7C3A" />
              <Text style={[styles.badgeTextAlt]}>Site officiel</Text>
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

  emptyBox: { paddingVertical: 24, alignItems: 'center' },
  emptyText: { color: '#666' },
});