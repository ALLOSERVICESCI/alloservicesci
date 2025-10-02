import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Linking, Platform, FlatList, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// PAGE ISOLÉE: Emplois & Offres
// - Autonome (aucune dépendance aux données partagées)
// - Les modifications ici n'impactent PAS les autres pages

const HEADER_BG = { uri: 'https://customer-assets.emergentagent.com/job_saved-app-loader/artifacts/hcqt6cju_Emplois.png' };

// Données locales (exemples mock pour la démo)

type JobType = 'emploi' | 'stage' | 'freelance' | 'candidats';

type Job = {
  title: string;
  company: string;
  location: string; // commune ou ville
  type: JobType;
  postedAt: string;
  applyUrl?: string; // lien de candidature ou mailto pour candidats
  phone?: string;
  summary?: string;
};

type Candidate = {
  name: string;
  role: string;
  location: string;
  updatedAt: string;
  phone?: string;
  email?: string;
  summary?: string;
};

const LOCAL_JOBS: Job[] = [
  { title: 'Assistant administratif', company: 'Société X', location: 'Cocody', type: 'emploi', postedAt: 'il y a 2 jours', applyUrl: 'https://example.com/apply/1', summary: 'Gestion des dossiers, accueil, suivi des courriers.' },
  { title: 'Développeur Mobile React Native (Stage)', company: 'Startup Y', location: 'Plateau', type: 'stage', postedAt: 'hier', applyUrl: 'mailto:jobs@startup-y.ci', summary: 'Participation à la conception d’une app mobile cross‑platform.' },
  { title: 'Designer UI/UX (Freelance)', company: 'Agence Z', location: 'Marcory', type: 'freelance', postedAt: 'il y a 3 jours', phone: '0707070707', summary: 'Missions courtes sur interfaces mobiles & web.' },
  { title: 'Chargé de communication', company: 'ONG Alpha', location: 'Yopougon', type: 'emploi', postedAt: 'aujourd’hui', applyUrl: 'https://example.com/apply/2', summary: 'Réseaux sociaux, rédaction contenus, événements.' },
];

const LOCAL_CANDIDATES: Candidate[] = [
  { name: 'Marie K.', role: 'Assistante admin', location: 'Cocody', updatedAt: 'aujourd’hui', phone: '0505050505', email: 'marie.k@example.ci', summary: '2 ans d’expérience en gestion d’accueil et secrétariat.' },
  { name: 'Adama T.', role: 'Développeur mobile', location: 'Plateau', updatedAt: 'il y a 1 jour', email: 'adama.t@example.ci', summary: 'React Native, Expo, TypeScript. Projets freelance et stagiaire.' },
  { name: 'Nadine B.', role: 'Community manager', location: 'Marcory', updatedAt: 'il y a 3 jours', phone: '0708080808', summary: 'Création de contenu, analytics, live events.' },
];

const CANDIDATES_JOBS: Job[] = LOCAL_CANDIDATES.map((c) => ({
  title: `${c.name} — ${c.role}`,
  company: 'Candidat',
  location: c.location,
  type: 'candidats',
  postedAt: c.updatedAt,
  applyUrl: c.email ? `mailto:${c.email}` : undefined,
  phone: c.phone,
  summary: c.summary,
}));

export default function EmploisOffresIsolated() {
  const router = useRouter();

  const [tab, setTab] = useState<JobType>('emploi');
  const [query, setQuery] = useState('');

  const dataset = useMemo(() => {
    const source = tab === 'candidats' ? CANDIDATES_JOBS : LOCAL_JOBS.filter(j => j.type === tab);
    const q = query.trim().toLowerCase();
    if (!q) return source;
    return source.filter(j => (j.title + ' ' + j.company + ' ' + j.location).toLowerCase().includes(q));
  }, [tab, query]);

  const openApply = async (applyUrl?: string) => {
    if (!applyUrl) return;
    try { await Linking.openURL(applyUrl); } catch {}
  };
  const callPhone = async (phone?: string) => {
    if (!phone) return;
    try { await Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`); } catch {}
  };

  const renderItem = useCallback(({ item }: { item: Job }) => {
    const isCandidate = item.type === 'candidats';
    return (
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSub}>{item.company} • {item.location}</Text>
          </View>
          <View style={[styles.badgeChip, styles.badgeType]}>
            <Text style={styles.badgeChipText}>
              {item.type === 'emploi' ? 'Emploi' : item.type === 'stage' ? 'Stage' : item.type === 'freelance' ? 'Freelance' : 'Candidats'}
            </Text>
          </View>
        </View>
        {item.summary ? <Text style={styles.cardSummary}>{item.summary}</Text> : null}
        <Text style={styles.cardMeta}>{isCandidate ? 'Mis à jour' : 'Publié'}: {item.postedAt}</Text>
        <View style={styles.actionsRow}>
          {item.applyUrl ? (
            <TouchableOpacity onPress={() => openApply(item.applyUrl)} style={[styles.badgeBtn, styles.badgePrimary]}>
              <Ionicons name={isCandidate ? 'mail' : 'open-outline'} size={16} color="#0D6EFD" />
              <Text style={styles.badgePrimaryText}>{isCandidate ? 'Contacter' : 'Postuler'}</Text>
            </TouchableOpacity>
          ) : null}
          {item.phone ? (
            <TouchableOpacity onPress={() => callPhone(item.phone)} style={[styles.badgeBtn, styles.badgeGreen]}>
              <Ionicons name="call" size={16} color="#fff" />
              <Text style={styles.badgeText}>{isCandidate ? 'Appeler' : 'Appeler'}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerWrapper}>
        <ImageBackground source={HEADER_BG} style={styles.header} resizeMode="cover">
          <LinearGradient colors={["rgba(0,0,0,0.45)", "rgba(0,0,0,0.2)", "rgba(0,0,0,0)"]} style={StyleSheet.absoluteFillObject as any} />
          <View style={styles.headerTopRow}>
            <TouchableOpacity onPress={() => router.replace('/(tabs)/home')} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Retour">
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle}>Emplois &amp; Offres</Text>
            <View style={styles.subtitleWrap}>
              <Text style={styles.headerSubtitle}>Postes • Stages • Missions</Text>
            </View>
          </View>
        </ImageBackground>
      </View>

      {/* Ombre sous header (renforcée) */}
      <View style={[styles.headerShadow, Platform.select({
        web: { boxShadow: '0 18px 32px rgba(0,0,0,0.28)' } as any,
        ios: { shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 14, shadowOffset: { width: 0, height: 14 } },
        android: { elevation: 14 },
      })]} pointerEvents="none" />

      {/* Contrôles */}
      <View style={styles.controls}>
        <View style={styles.capsulesRow}>
          <Capsule label="Emplois" active={tab === 'emploi'} onPress={() => setTab('emploi')} color="#0D6EFD" />
          <Capsule label="Stages" active={tab === 'stage'} onPress={() => setTab('stage')} color="#6C63FF" />
          <Capsule label="Freelance" active={tab === 'freelance'} onPress={() => setTab('freelance')} color="#0A7C3A" />
          <Capsule label="Candidats" active={tab === 'candidats'} onPress={() => setTab('candidats')} color="#FF8A00" />
        </View>
        <View style={styles.searchRow}>
          <Ionicons name="search" size={18} color="#888" />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder={tab === 'candidats' ? 'Rechercher (nom, rôle, commune)' : 'Rechercher (poste, entreprise, ville)'}
            placeholderTextColor="#999"
            returnKeyType="search"
          />
        </View>
      </View>

      {/* Liste */}
      <FlatList
        contentContainerStyle={styles.listContent}
        data={dataset}
        renderItem={renderItem}
        keyExtractor={(it, idx) => `${it.title}-${idx}`}
        ListEmptyComponent={<View style={styles.emptyBox}><Text style={styles.emptyText}>Aucun résultat pour cette sélection.</Text></View>}
      />
    </View>
  );
}

function Capsule({ label, active, onPress, color }: { label: string; active?: boolean; onPress: () => void; color: string }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.capsule, { backgroundColor: active ? color : '#F0F3F6', borderColor: active ? color : '#DDE3EA' }]} accessibilityRole="button" accessibilityLabel={label}>
      <Text style={[styles.capsuleText, { color: active ? '#fff' : '#222' }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const HEADER_HEIGHT = 240;

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

  controls: { paddingHorizontal: 16, paddingTop: 12 },
  capsulesRow: { flexDirection: 'row', gap: 8, marginBottom: 10, flexWrap: 'wrap' },
  capsule: { borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1 },
  capsuleText: { fontWeight: '800' },

  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 6 },
  searchInput: { flex: 1, color: '#222', paddingVertical: 2 },

  listContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 },

  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2 },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#222' },
  cardSub: { marginTop: 2, color: '#555' },
  cardSummary: { marginTop: 8, color: '#444', lineHeight: 20 },
  cardMeta: { marginTop: 8, color: '#666' },

  badgeChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, marginLeft: 12 },
  badgeType: { backgroundColor: '#EDEFF3' },
  badgeChipText: { fontWeight: '800', color: '#222' },

  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10, alignItems: 'center' },
  badgeBtn: { flexDirection: 'row', alignItems: 'center', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 10 },
  badgeGreen: { backgroundColor: '#0A7C3A' },
  badgeText: { marginLeft: 6, color: '#fff', fontWeight: '700' },
  badgePrimary: { backgroundColor: '#E3F2FD' },
  badgePrimaryText: { marginLeft: 6, color: '#0D6EFD', fontWeight: '700' },

  emptyBox: { paddingVertical: 24, alignItems: 'center' },
  emptyText: { color: '#666' },
});