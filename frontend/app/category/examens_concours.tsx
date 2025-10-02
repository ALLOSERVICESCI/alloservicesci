import React from 'react';
import { View, Text, StyleSheet, ImageBackground, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CONTENT_BY_CATEGORY } from '../../src/utils/categoryContent';

// Page isolée pour "Examens & Concours"
// NOTE: Cette page est totalement autonome (styles + composants locaux)
// et ne réutilise pas le layout dynamique [slug].tsx afin d'éviter
// tout impact sur les autres catégories (en particulier Santé).

const HEADER_BG = { uri: 'https://customer-assets.emergentagent.com/job_allo-assistance/artifacts/if6ljosz_examens_concours_bg.png' };

export default function ExamensConcoursPage() {
  const router = useRouter();
  const main = CONTENT_BY_CATEGORY['examens_concours'] || [];
  const more = CONTENT_BY_CATEGORY['examens_concours_more'] || [];

  const openSource = async (url?: string) => {
    if (!url) return;
    const safe = url.startsWith('http') || url.startsWith('mailto:') ? url : `https://${url}`;
    try { await Linking.openURL(safe); } catch (e) {}
  };

  const renderCard = (item: any, idx: number) => {
    const title: string = item?.title || '';
    const summary: string = item?.summary || '';
    const date: string | undefined = item?.date;
    const source: string | undefined = item?.source;

    return (
      <View key={`card-${idx}`} style={styles.card}>
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
  };

  return (
    <View style={styles.container}>
      {/* En-tête fixe avec image + dégradé */}
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

      {/* Contenu */}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>À la une</Text>
        {main.map(renderCard)}

        {more.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ressources utiles</Text>
            {more.map(renderCard)}
          </View>
        ) : null}

        <View style={{ height: 24 }} />
      </ScrollView>
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

  content: { paddingTop: 16, paddingHorizontal: 16 },
  section: { marginTop: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#222', marginBottom: 8 },

  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#222' },
  cardSummary: { marginTop: 6, color: '#444', lineHeight: 20 },
  cardMeta: { marginTop: 6, color: '#666' },
  actionsRow: { flexDirection: 'row', gap: 12, marginTop: 10, alignItems: 'center' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E6F4EA', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
  actionText: { marginLeft: 6, color: '#0A7C3A', fontWeight: '700' },
});