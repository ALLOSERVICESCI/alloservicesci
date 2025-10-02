import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Platform, FlatList, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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

export default function ServicesPublicsIsolated() {
  const router = useRouter();

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
        data={SERVICES_PUBLICS_CONTENT}
        renderItem={renderItem}
        keyExtractor={(it, idx) => `${it.title}-${idx}`}
      />
    </View>
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

  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#222' },
  cardSummary: { marginTop: 6, color: '#444', lineHeight: 20 },

  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10, alignItems: 'center' },
  badgeBtn: { flexDirection: 'row', alignItems: 'center', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 10 },
  badgeGreen: { backgroundColor: '#0A7C3A' },
  badgeText: { marginLeft: 6, color: '#fff', fontWeight: '700' },

  badgeAlt: { backgroundColor: '#E6F4EA' },
  badgeTextAlt: { marginLeft: 6, color: '#0A7C3A', fontWeight: '700' },
});