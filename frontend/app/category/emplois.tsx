import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Pressable, Modal, Linking, Platform, FlatList, TextInput, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import * as WebBrowser from 'expo-web-browser';

// PAGE ISOLÉE: Emplois & Offres
// - Autonome (aucune dépendance aux données partagées)
import * as Sharing from 'expo-sharing';
// Modal import merged into main RN import

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
  email?: string;
  summary?: string;
  cvUrl?: string; // lien CV pour candidats
  cvBase64?: string;
  attachmentName?: string; // offre: nom fiche pdf
  attachmentBase64?: string; // offre: fiche pdf base64
};

type Candidate = {
  name: string;
  role: string;
  location: string;
  updatedAt: string;
  phone?: string;
  email?: string;
  summary?: string;
  cvUrl?: string;
  cvBase64?: string;
  cvName?: string;
};

const LOCAL_JOBS: Job[] = [
  { title: 'Assistant administratif', company: 'Société X', location: 'Cocody', type: 'emploi', postedAt: 'il y a 2 jours', applyUrl: 'https://example.com/apply/1', summary: 'Gestion des dossiers, accueil, suivi des courriers.' },
  { title: 'Développeur Mobile React Native (Stage)', company: 'Startup Y', location: 'Plateau', type: 'stage', postedAt: 'hier', applyUrl: 'mailto:jobs@startup-y.ci', summary: 'Participation à la conception d’une app mobile cross‑platform.' },
  { title: 'Designer UI/UX (Freelance)', company: 'Agence Z', location: 'Marcory', type: 'freelance', postedAt: 'il y a 3 jours', phone: '0707070707', summary: 'Missions courtes sur interfaces mobiles & web.' },
  { title: 'Chargé de communication', company: 'ONG Alpha', location: 'Yopougon', type: 'emploi', postedAt: 'aujourd’hui', applyUrl: 'https://example.com/apply/2', summary: 'Réseaux sociaux, rédaction contenus, événements.' },
];

const LOCAL_CANDIDATES: Candidate[] = [
  { name: 'Marie K.', role: 'Assistante admin', location: 'Cocody', updatedAt: 'aujourd’hui', phone: '0505050505', email: 'marie.k@example.ci', summary: '2 ans d’expérience en gestion d’accueil et secrétariat.', cvUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
  { name: 'Adama T.', role: 'Développeur mobile', location: 'Plateau', updatedAt: 'il y a 1 jour', email: 'adama.t@example.ci', summary: 'React Native, Expo, TypeScript. Projets freelance et stagiaire.' },
  { name: 'Nadine B.', role: 'Community manager', location: 'Marcory', updatedAt: 'il y a 3 jours', phone: '0708080808', summary: 'Création de contenu, analytics, live events.' },
];

const CANDIDATES_JOBS_BASE: Job[] = LOCAL_CANDIDATES.map((c) => ({
  title: `${c.name} — ${c.role}`,
  company: 'Candidat',
  location: c.location,
  type: 'candidats',
  postedAt: c.updatedAt,
  applyUrl: c.email ? `mailto:${c.email}` : undefined,
  phone: c.phone,
  summary: c.summary,
  cvUrl: c.cvUrl,
  cvBase64: c.cvBase64,

function normalizeId(s: string) {
  try { return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); } catch { return 'item'; }
}

}));

export default function EmploisOffresIsolated() {
  const router = useRouter();
  const dims = useWindowDimensions();

  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [menuItem, setMenuItem] = useState<Job | null>(null);

  const [tab, setTab] = useState<JobType>('emploi');
  const [query, setQuery] = useState('');
  const [extraJobs, setExtraJobs] = useState<Job[]>([]);
  const [extraCandidates, setExtraCandidates] = useState<Candidate[]>([]);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      (async () => {
        try {
          const rawJobs = await AsyncStorage.getItem('jobs_offers');
          const listJobs = rawJobs ? JSON.parse(rawJobs) : [];
          const jobsOK: Job[] = Array.isArray(listJobs) ? listJobs : [];
          const rawCands = await AsyncStorage.getItem('jobs_candidates');
          const listCands = rawCands ? JSON.parse(rawCands) : [];
          const candsOK: Candidate[] = Array.isArray(listCands) ? listCands : [];
          if (mounted) {
            setExtraJobs(jobsOK);
            setExtraCandidates(candsOK);
          }
        } catch {}
      })();
      return () => { mounted = false; };
    }, [])
  );

  const extraCandidatesToJobs: Job[] = useMemo(() => (extraCandidates || []).map((c) => ({
    title: `${c.name} — ${c.role}`,
    company: 'Candidat',
    location: c.location,
    type: 'candidats' as const,
    postedAt: c.updatedAt,
    applyUrl: c.email ? `mailto:${c.email}` : undefined,
    phone: c.phone,
    summary: c.summary,
    cvUrl: c.cvUrl,
    cvBase64: c.cvBase64,
  })), [extraCandidates]);

  const dataset = useMemo(() => {
    const baseCandidates = [...CANDIDATES_JOBS_BASE, ...extraCandidatesToJobs];
    if (tab === 'candidats') {
      const q = query.trim().toLowerCase();
      if (!q) return baseCandidates;
      return baseCandidates.filter(j => (j.title + ' ' + (j.summary || '') + ' ' + j.location).toLowerCase().includes(q));
    }
    const baseOffers = [...LOCAL_JOBS, ...extraJobs.filter(j => j.type === 'emploi' || j.type === 'stage' || j.type === 'freelance')];
    const filteredByType = baseOffers.filter(j => j.type === tab);
    const q = query.trim().toLowerCase();
    if (!q) return filteredByType;
    return filteredByType.filter(j => (j.title + ' ' + j.company + ' ' + j.location).toLowerCase().includes(q));
  }, [tab, query, extraJobs, extraCandidatesToJobs]);

  const openApply = async (applyUrl?: string) => { if (!applyUrl) return; try { await Linking.openURL(applyUrl); } catch {} };
  const callPhone = async (phone?: string) => { if (!phone) return; try { await Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`); } catch {} };

  // PDF helpers
  const base64ToBlobWeb = (b64: string, mime = 'application/pdf') => {
    try {
      const byteCharacters = atob(b64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      return new Blob([byteArray], { type: mime });
    } catch {
      return null;
    }
  };

  const viewPdf = async (filename: string, url?: string, base64?: string) => {
    try {
      if (Platform.OS === 'web') {
        if (url) {
          window.open(url, '_blank');
          return;
        }
        if (base64) {
          const blob = base64ToBlobWeb(base64);
          if (!blob) return;
          const blobUrl = URL.createObjectURL(blob);
          const win = window.open(blobUrl, '_blank');
          if (!win) {
            // fallback download
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename || 'document.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
          return;
        }
        return;
      }
      // Native
      if (url) {
        await Linking.openURL(url);
        return;
      }
      if (base64) {
        const path = `${FileSystem.cacheDirectory}${filename || 'document'}.pdf`;
        await FileSystem.writeAsStringAsync(path, base64, { encoding: FileSystem.EncodingType.Base64 });
        if (Platform.OS === 'android') {
          const contentUri = await FileSystem.getContentUriAsync(path);
          await Linking.openURL(contentUri);
        } else {
          // iOS: ouvrir dans un viewer
          try { await WebBrowser.openBrowserAsync(path.startsWith('file://') ? path : `file://${path}`); } catch { await Linking.openURL(`file://${path}`); }
        }
      }
    } catch {}
  };

  const downloadPdfWeb = (filename: string, url?: string, base64?: string) => {
    if (Platform.OS !== 'web') return;
    try {
      if (url) {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || 'document.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }
      if (base64) {
        const blob = base64ToBlobWeb(base64);
        if (!blob) return;
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename || 'document.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      }
    } catch {}
  };

  const sharePdfNative = async (filename: string, url?: string, base64?: string) => {
    if (Platform.OS === 'web') return;
    try {
      let path: string | null = null;
      if (url) {
        // Télécharge le pdf vers le cache local pour partage
        const dl = await FileSystem.downloadAsync(url, `${FileSystem.cacheDirectory}${filename || 'doc'}.pdf`);
        path = dl?.uri || null;
      } else if (base64) {
        const p = `${FileSystem.cacheDirectory}${filename || 'doc'}.pdf`;
        await FileSystem.writeAsStringAsync(p, base64, { encoding: FileSystem.EncodingType.Base64 });
        path = p;
      }
    } catch {}
  };

  const handleOpenView = useCallback(() => {
    if (!menuItem) return;
    const isCandidate = menuItem.type === 'candidats';
    if (isCandidate) {
      viewPdf('cv.pdf', (menuItem as any).cvUrl, (menuItem as any).cvBase64);
    } else {
      viewPdf((menuItem as any).attachmentName || 'fiche.pdf', undefined, (menuItem as any).attachmentBase64);
    }
    setMenuVisible(false);
  }, [menuItem]);

  const handleDownloadWeb = useCallback(() => {
    if (Platform.OS !== 'web' || !menuItem) return;
    const isCandidate = menuItem.type === 'candidats';
    if (isCandidate) {
      downloadPdfWeb('cv.pdf', (menuItem as any).cvUrl, (menuItem as any).cvBase64);
    } else {
      downloadPdfWeb((menuItem as any).attachmentName || 'fiche.pdf', undefined, (menuItem as any).attachmentBase64);
    }
    setMenuVisible(false);
  }, [menuItem]);

  const handleShareNative = useCallback(() => {
    if (Platform.OS === 'web' || !menuItem) return;
    const isCandidate = menuItem.type === 'candidats';
    if (isCandidate) {
      sharePdfNative('cv.pdf', (menuItem as any).cvUrl, (menuItem as any).cvBase64);
    } else {
      sharePdfNative((menuItem as any).attachmentName || 'fiche.pdf', undefined, (menuItem as any).attachmentBase64);
    }
    setMenuVisible(false);
  }, [menuItem]);

      if (path && (await Sharing.isAvailableAsync())) {
        await Sharing.shareAsync(path, { mimeType: 'application/pdf', dialogTitle: 'Partager le document' });
      }
    } catch {}
  };

  const renderItem = useCallback(({ item }: { item: Job }) => {
    const isCandidate = item.type === 'candidats';
    const hasOfferAttachment = !isCandidate && !!item.attachmentBase64;
    const hasDoc = isCandidate ? (!!item.cvUrl || !!item.cvBase64) : hasOfferAttachment;
    const docIconColor = isCandidate ? '#6C63FF' : '#8B5CF6';
    return (
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={{ flex: 1 }}>
            <View style={styles.titleRow}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              {hasDoc ? <Ionicons name="attach" size={16} color={docIconColor} style={{ marginLeft: 6 }} /> : null}
            </View>
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
              <Text style={styles.badgeText}>Appeler</Text>
            </TouchableOpacity>
          ) : null}

          {/* Actions document regroupées dans menu '…' */}
          {hasDoc ? (
            <Pressable
              onPress={(e) => {
                const { pageX, pageY } = (e as any).nativeEvent || { pageX: 0, pageY: 0 };
                setMenuAnchor({ x: pageX, y: pageY });
                setMenuItem(item);
                setMenuVisible(true);
              }}
              style={[styles.moreBtn, { width: 44, height: 44 }]}
              accessibilityLabel="Plus d'actions"
              accessibilityHint="Ouvrir les actions du document"
              testID={`more-actions-${normalizeId(item.title)}`}
              dataSet={{ testid: `more-actions-${normalizeId(item.title)}` }}
            >
              <Ionicons name="ellipsis-horizontal" size={18} color="#222" />
            </Pressable>
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
            <View style={styles.headerTitleRow}>
              <Text style={styles.headerTitle}>Emplois &amp; Offres</Text>
              <TouchableOpacity onPress={() => router.push('/category/emplois/publier')} style={styles.publishBtn} accessibilityRole="button" accessibilityLabel="Publier">
                <Ionicons name="create-outline" size={16} color="#fff" />
                <Text style={styles.publishText}>Publier</Text>
              </TouchableOpacity>
            </View>
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
      {/* Menu contextuel '…' */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.menuBackdrop} onPress={() => setMenuVisible(false)} testID="menu-backdrop" dataSet={{ testid: 'menu-backdrop' }}>
          <View
            style={[
              styles.menuContainer,
              {
                left: Math.min(Math.max(menuAnchor.x - 160, 12), (dims.width - 12 - 180)),
                top: Math.max(menuAnchor.y - 56, 100),
              },
            ]}
            testID="menu-container"
            dataSet={{ testid: 'menu-container' }}
          >
            <View style={styles.menuRow}>
              <Pressable style={styles.menuIconBtn} onPress={handleOpenView} accessibilityLabel="Voir" testID="action-view" dataSet={{ testid: 'action-view' }}>
                <Ionicons name="document-text-outline" size={18} color="#222" />
              </Pressable>
              {Platform.OS === 'web' ? (
                <Pressable style={styles.menuIconBtn} onPress={handleDownloadWeb} accessibilityLabel="Télécharger" testID="action-download" dataSet={{ testid: 'action-download' }}>
                  <Ionicons name="download-outline" size={18} color="#222" />
                </Pressable>
              ) : null}
              {Platform.OS !== 'web' ? (
                <Pressable style={styles.menuIconBtn} onPress={handleShareNative} accessibilityLabel="Partager" testID="action-share" dataSet={{ testid: 'action-share' }}>
                  <Ionicons name="share-social-outline" size={18} color="#222" />
                </Pressable>
              ) : null}
            </View>
          </View>
        </Pressable>
      </Modal>
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
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '800' },
  headerSubtitle: { color: '#fff' },
  subtitleWrap: { alignSelf: 'flex-start', backgroundColor: 'rgba(0,0,0,0.25)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginTop: 4 },

  publishBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FF8A00', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, opacity: 0.95 },
  publishText: { color: '#fff', fontWeight: '800' },

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
  titleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
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
  badgeCV: { backgroundColor: '#EFEAFF' },
  badgeCVText: { marginLeft: 6, color: '#6C63FF', fontWeight: '700' },
  badgeDoc: { backgroundColor: '#F3E8FF' },
  badgeDocText: { marginLeft: 6, color: '#8B5CF6', fontWeight: '700' },
  badgeDownload: { backgroundColor: '#FFF4E5' },
  badgeDownloadText: { marginLeft: 6, color: '#FF8A00', fontWeight: '700' },

  moreBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F2F4F7' },

  menuBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.08)' },
  menuContainer: { position: 'absolute', width: 180, backgroundColor: '#fff', borderRadius: 12, padding: 8, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
  menuRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  menuIconBtn: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F7F7F7' },

  emptyBox: { paddingVertical: 24, alignItems: 'center' },
  emptyText: { color: '#666' },
});