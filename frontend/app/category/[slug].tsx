import React, { useMemo, useState } from 'react';
import { View, Text, ImageBackground, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { useI18n } from '../../src/i18n/i18n';

const HEADERS: Record<string, any> = {
  urgence: { uri: 'https://customer-assets.emergentagent.com/job_allo-services-1/artifacts/wb49s8ag_bg-rgences.png' },
  sante: require('../../assets/headers/headers/sante_bg.png'),
  education: require('../../assets/headers/headers/education_bg.png'),
  services_utiles: require('../../assets/headers/headers/services_utiles_bg.png'),
  agriculture: require('../../assets/headers/headers/agriculture_bg.png'),
  loisirs_tourisme: require('../../assets/headers/headers/loisirs_tourisme_bg.png'),
  services_publics: require('../../assets/headers/headers/services_publics_bg.png'),
  examens_concours: require('../../assets/headers/headers/examens_concours_bg.png'),
  transport: require('../../assets/headers/headers/transport_bg.png'),
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

  // Ajuste l'opacité du dégradé selon la luminosité supposée des images
  const BRIGHT = new Set(['urgence','sante','education','agriculture','loisirs_tourisme','services_utiles','examens_concours']);
  const DARK = new Set(['services_publics','transport']);
  const baseAlpha = 0.65;
  const gradientAlpha = BRIGHT.has(s) ? baseAlpha + 0.05 : DARK.has(s) ? baseAlpha - 0.05 : baseAlpha;
  const gradientColors = ['rgba(0,0,0,0.0)', `rgba(0,0,0,${gradientAlpha})`];

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ImageBackground source={bg} style={styles.header} imageStyle={s==='urgence' ? styles.urgencyImage : undefined} resizeMode="cover">
        {/* Éclaircissement global léger */}
        <View style={styles.lightOverlay} />
        {/* Dégradé bas pour lisibilité */}
        <LinearGradient colors={gradientColors} locations={[0,1]} style={styles.overlay} />
        <View style={[styles.headerContent, styles.urgencyContent]}>
          <View style={styles.urgencyTitleWrap}>
            <Text style={styles.urgencyTitleStroke}>{displayLabel}</Text>
            <Text style={styles.urgencyTitle}>{displayLabel}</Text>
          </View>
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
  header: { height: 260, justifyContent: 'flex-end' },
  urgencyImage: { resizeMode: 'cover' },
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