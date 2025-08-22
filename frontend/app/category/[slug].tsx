import React, { useMemo, useState } from 'react';
import { View, Text, ImageBackground, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { useI18n } from '../../src/i18n/i18n';

const COMMON_HEADER = { uri: 'https://customer-assets.emergentagent.com/job_allo-services-1/artifacts/ce52q6f0_sante_bg.png' };
const HEADERS: Record<string, any> = {
  urgence: { uri: 'https://customer-assets.emergentagent.com/job_allo-services-1/artifacts/16jgx6x2_urgence_bg.png' },
  sante: COMMON_HEADER,
  education: { uri: 'https://customer-assets.emergentagent.com/job_allo-services-1/artifacts/kuyfb8wf_bg-education.png' },
  services_utiles: COMMON_HEADER,
  agriculture: COMMON_HEADER,
  loisirs_tourisme: COMMON_HEADER,
  services_publics: COMMON_HEADER,
  examens_concours: COMMON_HEADER,
  transport: COMMON_HEADER,
};

function TabIcon({ label, icon, onPress }: { label: string; icon: any; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ alignItems: 'center', flex: 1 }}>
      <Ionicons name={icon} size={20} color="#0A7C3A" />
      <Text style={{ color: '#0A7C3A', fontSize: 11, marginTop: 4 }}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function CategoryPage() {
  const { slug } = useLocalSearchParams();
  const s = Array.isArray(slug) ? slug[0] : slug || '';
  const bg = HEADERS[s] || HEADERS['urgence'];
  const router = useRouter();
  const { t, lang, isRTL } = useI18n();
  const { user } = useAuth();

  const catLabel = useMemo(() => {
    const map: Record<string, string> = {
      urgence: 'Urgence',
      sante: t('cat_sante'),
      education: t('cat_education'),
      services_utiles: t('cat_services_utiles'),
      agriculture: t('cat_agriculture'),
      loisirs_tourisme: t('cat_loisirs'),
      services_publics: t('cat_services_publics'),
      examens_concours: t('cat_examens'),
      transport: t('cat_transport'),
    };
    return map[s] || s;
  }, [s]);

  const greeting = user?.first_name ? `${t('hello')} ${user.first_name}` : '';
  // Titre avec retour manuel par langue pour certaines catégories à deux mots
  const lineBreaks: Record<string, Record<string, string>> = {
    fr: {
      services_publics: 'Services\npublics',
      services_utiles: 'Services\nutiles',
      loisirs_tourisme: 'Loisirs\ntourisme',
      examens_concours: 'Examens\nconcours',
    },
    en: {
      services_publics: 'Public\nServices',
      services_utiles: 'Useful\nServices',
      loisirs_tourisme: 'Leisure &\nTourism',
      examens_concours: 'Exams &\nContests',
    },
    es: {
      services_publics: 'Servicios\npúblicos',
      services_utiles: 'Servicios\nútiles',
      loisirs_tourisme: 'Ocio y\nTurismo',
      examens_concours: 'Exámenes y\nConcursos',
    },
    it: {
      services_publics: 'Servizi\npubblici',
      services_utiles: 'Servizi\nutili',
      loisirs_tourisme: 'Tempo libero e\nTurismo',
      examens_concours: 'Esami e\nConcorsi',
    },
    ar: {
      services_publics: 'الخدمات\nالعامة',
      services_utiles: 'الخدمات\nالمفيدة',
      loisirs_tourisme: 'الترفيه\nوالسياحة',
      examens_concours: 'الامتحانات\nوالمسابقات',
    },
  };
  const displayLabel = lineBreaks[lang]?.[s] ?? catLabel;

  // Dynamique: taille/espacement/alignement selon langue
  const titleFontSize = lang === 'en' ? 26 : 25;
  const titleLetterSpacing = lang === 'ar' ? 0.3 : 0.5;
  const textAlignValue: 'left' | 'right' = isRTL ? 'right' : 'left';

  // Gradient bas uniforme (supprime l'adaptatif)
  const gradientColors = ['rgba(0,0,0,0.0)', 'rgba(0,0,0,0.65)'];

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ImageBackground source={bg} style={styles.header} imageStyle={s==='urgence' ? styles.urgencyImage : undefined} resizeMode="cover">
        {/* Éclaircissement global léger */}
        <View style={styles.lightOverlay} />
        {/* Dégradé bas pour lisibilité */}
        <LinearGradient colors={gradientColors} locations={[0,1]} style={styles.overlay} />
        <View style={[styles.headerContent, styles.urgencyContent]}>
          {s === 'sante' ? null : (
            <View style={styles.urgencyTitleWrap}>
              <Text style={[styles.urgencyTitleStroke, { fontSize: titleFontSize, letterSpacing: titleLetterSpacing, textAlign: textAlignValue }]}>{displayLabel}</Text>
              <Text style={[styles.urgencyTitle, { fontSize: titleFontSize, letterSpacing: titleLetterSpacing, textAlign: textAlignValue }]}>{displayLabel}</Text>
            </View>
          )}
        </View>
      </ImageBackground>
      <View style={{ padding: 16, flex: 1 }}>
        <Text>{t('comingSoon')} {catLabel}</Text>
      </View>
      {/* Bottom Tab Quick Nav (icons) */}
      <View style={styles.bottomTabs}>
        <TabIcon label={t('tabHome')} icon="home" onPress={() => router.push('/(tabs)/home')} />
        <TabIcon label={t('tabAlerts')} icon="megaphone" onPress={() => router.push('/(tabs)/alerts')} />
        <TabIcon label={t('tabPharm')} icon="medkit" onPress={() => router.push('/(tabs)/pharmacies')} />
        <TabIcon label={t('tabPremium')} icon="card" onPress={() => router.push('/(tabs)/subscribe')} />
        <TabIcon label={t('tabProfile')} icon="person" onPress={() => router.push('/(tabs)/profile')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { height: 280, justifyContent: 'flex-end' },
  urgencyImage: { resizeMode: 'cover' },
  // Aligne visuellement le bas de l'image Santé au bas du header
  santeImage: { resizeMode: 'cover', transform: [{ translateY: 18 }] },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  lightOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.10)' },
  headerContent: { paddingTop: 16, paddingRight: 16, paddingBottom: 16, paddingLeft: 20 },
  urgencyContent: { alignItems: 'flex-start', justifyContent: 'center', height: '100%', paddingBottom: 0 },
  urgencyTitleWrap: { position: 'relative', marginTop: -2 },
  urgencyTitleStroke: { color: 'transparent', fontSize: 30, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase', textAlign: 'left',
    textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 1.5, position: 'absolute', left: 0, top: 0 },
  brand: { color: '#fff', fontSize: 16, fontWeight: '800' },
  slogan: { color: '#E8F0E8', fontSize: 12, marginTop: 2 },
  greeting: { color: '#D6F5E2', fontSize: 12, marginTop: 4, fontWeight: '700' },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 8 },
  urgencyTitle: { color: '#fff', fontSize: 30, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase', textAlign: 'left',
    textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6 },
  bottomTabs: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    backgroundColor: '#fff',
  },
});