import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Linking, Platform, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CONTENT_BY_CATEGORY } from '../../src/utils/categoryContent';

// Page isolée pour "Examens & Concours"
// - Autonome (styles + logique locale)
// - N'impacte AUCUNE autre page (notamment Santé)

const HEADER_BG = { uri: 'https://customer-assets.emergentagent.com/job_saved-app-loader/artifacts/9k8osel9_Exam.png' };

// Types locaux
type MainTab = 'examens' | 'concours' | 'resultats';
type ExamSub = 'scolaires' | 'bts';
type ResultSwitch = 'examens' | 'concours';

export default function ExamensConcoursPage() {
  const router = useRouter();

  // Données source (contenu statique centralisé)
  const main = CONTENT_BY_CATEGORY['examens_concours'] || [];
  const more = CONTENT_BY_CATEGORY['examens_concours_more'] || [];
  const all = [...main, ...more];

  // États d'UI
  const [tab, setTab] = useState<MainTab>('examens');
  const [examSub, setExamSub] = useState<ExamSub>('scolaires');
  const [resultSwitch, setResultSwitch] = useState<ResultSwitch>('examens');

  // Actions utilitaires
  const openSource = async (url?: string) => {
    if (!url) return;
    const safe = url.startsWith('http') || url.startsWith('mailto:') ? url : `https://${url}`;
    try { await Linking.openURL(safe); } catch {}
  };

  const matchAny = (s: string, keys: string[]) => {
    const t = (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    return keys.some(k => t.includes(k));
  };

  // Filtres de données
  const examensScolaires = useMemo(() => {
    return all.filter(it => matchAny(it.title + ' ' + (it.summary || ''), [
      'deco', 'bepc', 'bac', 'examen', 'examens', 'scolair', 'cep'
    ]));
  }, [all]);

  const examensBts = useMemo(() => {
    return all.filter(it => matchAny(it.title + ' ' + (it.summary || ''), ['bts']));
  }, [all]);

  const concoursNationaux = useMemo(() => {
    return all.filter(it => matchAny(it.title + ' ' + (it.summary || ''), [
      'concours', 'fonction publique', 'ena', 'infas'
    ]));
  }, [all]);

  const resultatsExamens = useMemo(() => {
    // Résultats scolaires (DECO, BEPC, BAC). On privilégie les cartes contenant "résultat"
    return all.filter(it => matchAny(it.title + ' ' + (it.summary || ''), [
      'resultat', 'résultat', 'deco', 'bepc', 'bac'
    ]));
  }, [all]);

  const resultatsConcours = useMemo(() => {
    // Si pas d'item explicite "résultats" dans le contenu, on renvoie les sources officielles concours
    const withKeyword = all.filter(it => matchAny(it.title + ' ' + (it.summary || ''), ['resultat', 'résultat', 'concours']));
    return withKeyword.length > 0 ? withKeyword : concoursNationaux;
  }, [all, concoursNationaux]);

  // Dataset courant pour la FlatList
  const listData = useMemo(() => {
    if (tab === 'examens') {
      return examSub === 'scolaires' ? examensScolaires : examensBts;
    }
    if (tab === 'concours') return concoursNationaux;
    // tab === 'resultats'
    return resultSwitch === 'examens' ? resultatsExamens : resultatsConcours;
  }, [tab, examSub, resultSwitch, examensScolaires, examensBts, concoursNationaux, resultatsExamens, resultatsConcours]);

  const renderCard = useCallback(({ item, index }: { item: any; index: number }) => {
    const title: string = item?.title || '';
    const summary: string = item?.summary || '';
    const date: string | undefined = item?.date;
    const source: string | undefined = item?.source;
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{title}</Text>
        {summary ? <Text style={styles.cardSummary}>{summary}</Text> : null}
        {date ? <Text style={styles.cardMeta}>{date}</Text> : null}
        <View style={styles.actionsRow}>
          {source ? (
            <TouchableOpacity onPress={() => openSource(source)} style={styles.actionBtn} accessibilityRole="button" accessibilityLabel={`Ouvrir: ${title}`}>
              <Ionicons name="globe" size={16} color="#0A7C3A" />
              <Text style={styles.actionText}>Site officiel</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  }, []);

  const keyExtractor = useCallback((item: any, index: number) => `${item?.title || 'item'}-${index}`, []);

  // Header de la liste: capsules & libellés
  const ListHeader = () => (
    <View style={styles.listHeaderBox}>
      {/* Capsules principales */}
      <View style={styles.capsulesRow}>
        <PressableCapsule label="Examens" active={tab === 'examens'} onPress={() => setTab('examens')} color="#0D6EFD" />
        <PressableCapsule label="Concours" active={tab === 'concours'} onPress={() => setTab('concours')} color="#0A7C3A" />
        <PressableCapsule label="Résultats" active={tab === 'resultats'} onPress={() => setTab('resultats')} color="#6C63FF" />
      </View>

      {/* Sous-filtres dynamiques */}
      {tab === 'examens' ? (
        <View style={styles.subRow}>
          <PressableCapsule label="Scolaires (CEP, BEPC, BAC)" small active={examSub === 'scolaires'} onPress={() => setExamSub('scolaires')} color="#0D6EFD" />
          <PressableCapsule label="Grande École (BTS)" small active={examSub === 'bts'} onPress={() => setExamSub('bts')} color="#0D6EFD" />
        </View>
      ) : null}

      {tab === 'resultats' ? (
        <View style={styles.segmentRow}>
          <SegmentBtn label="Examens" active={resultSwitch === 'examens'} onPress={() => setResultSwitch('examens')} />
          <SegmentBtn label="Concours" active={resultSwitch === 'concours'} onPress={() => setResultSwitch('concours')} />
        </View>
      ) : null}

      {/* Titre de section */}
      <Text style={styles.sectionTitle}>
        {tab === 'examens' && examSub === 'scolaires' ? 'Examens scolaires' : undefined}
        {tab === 'examens' && examSub === 'bts' ? 'BTS (grande école)' : undefined}
        {tab === 'concours' ? 'Concours nationaux' : undefined}
        {tab === 'resultats' && resultSwitch === 'examens' ? 'Résultats — Examens scolaires' : undefined}
        {tab === 'resultats' && resultSwitch === 'concours' ? 'Résultats — Concours nationaux' : undefined}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* En-tête fixe */}
      <View style={styles.headerWrapper}>
        <ImageBackground source={HEADER_BG} style={styles.header} resizeMode="cover">
          <LinearGradient colors={["rgba(0,0,0,0.45)", "rgba(0,0,0,0.2)", "rgba(0,0,0,0)"]} style={StyleSheet.absoluteFillObject as any} />
          <View style={styles.headerTopRow}>
            <TouchableOpacity onPress={() => router.replace('/(tabs)/home')} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Retour">
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle}>Examens &amp; Concours</Text>
            <Text style={styles.headerSubtitle}>Calendriers • Inscriptions • Résultats</Text>
          </View>
        </ImageBackground>
      </View>

      {/* Ombre sous le header */}
      <View style={[styles.headerShadow, Platform.select({
        web: { boxShadow: '0 16px 28px rgba(0,0,0,0.22)' } as any,
        ios: { shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 12 } },
        android: { elevation: 12 },
        default: {},
      })]} pointerEvents="none" />

      {/* Liste principale */}
      <FlatList
        contentContainerStyle={styles.listContent}
        data={listData}
        renderItem={renderCard}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Aucun contenu disponible pour cette sélection.</Text>
          </View>
        }
      />
    </View>
  );
}

// Capsules pressables
function PressableCapsule({ label, active, onPress, color, small }: { label: string; active?: boolean; onPress: () => void; color: string; small?: boolean }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.capsule, { backgroundColor: active ? color : '#F0F3F6', paddingVertical: small ? 6 : 8 }]} accessibilityRole="button" accessibilityLabel={label}>
      <Text style={[styles.capsuleText, { color: active ? '#fff' : '#222' }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function SegmentBtn({ label, active, onPress }: { label: string; active?: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.segmentBtn, active ? styles.segmentActive : styles.segmentInactive]} accessibilityRole="button" accessibilityLabel={label}>
      <Text style={[styles.segmentText, { color: active ? '#fff' : '#222' }]}>{label}</Text>
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

  listContent: { paddingTop: 16, paddingHorizontal: 16, paddingBottom: 24 },
  listHeaderBox: { marginBottom: 8 },

  capsulesRow: { flexDirection: 'row', gap: 10, marginBottom: 8, flexWrap: 'wrap' },
  capsule: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  capsuleText: { fontWeight: '700' },

  subRow: { flexDirection: 'row', gap: 8, marginBottom: 8, flexWrap: 'wrap' },

  segmentRow: { flexDirection: 'row', backgroundColor: '#EDEFF3', borderRadius: 10, padding: 4, width: '100%', justifyContent: 'space-between', marginBottom: 8 },
  segmentBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 8 },
  segmentActive: { backgroundColor: '#6C63FF' },
  segmentInactive: { backgroundColor: 'transparent' },
  segmentText: { fontWeight: '700' },

  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#222', marginTop: 4, marginBottom: 6 },

  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#222' },
  cardSummary: { marginTop: 6, color: '#444', lineHeight: 20 },
  cardMeta: { marginTop: 6, color: '#666' },
  actionsRow: { flexDirection: 'row', gap: 12, marginTop: 10, alignItems: 'center' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E6F4EA', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
  actionText: { marginLeft: 6, color: '#0A7C3A', fontWeight: '700' },

  emptyBox: { paddingVertical: 24, alignItems: 'center' },
  emptyText: { color: '#666' },
});