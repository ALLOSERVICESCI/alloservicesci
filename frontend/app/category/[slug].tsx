import React, { useMemo } from 'react';
import { View, Text, ImageBackground, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
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
  agriculture: { uri: 'https://customer-assets.emergentagent.com/job_allo-services-1/artifacts/r7xlibx4_agriculture_bg.png' },
  loisirs_tourisme: COMMON_HEADER,
  services_publics: { uri: 'https://customer-assets.emergentagent.com/job_allo-services-1/artifacts/7w0pi6lv_services_publics_bg.png' },
  examens_concours: { uri: 'https://customer-assets.emergentagent.com/job_allo-services-1/artifacts/sfdp17jj_examens_concours_bg.png' },
  transport: { uri: 'https://customer-assets.emergentagent.com/job_allo-services-1/artifacts/1yzx1q1o_transport_bg.png' },
};

function RingingBellIcon({ size = 20, color = '#F59E0B' }: { size?: number; color?: string }) {
  const rotate = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(rotate, { toValue: 1, duration: 280, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(rotate, { toValue: -1, duration: 560, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(rotate, { toValue: 0, duration: 280, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.delay(700),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [rotate]);
  const deg = rotate.interpolate({ inputRange: [-1, 0, 1], outputRange: ['-15deg', '0deg', '15deg'] });
  return (
    <Animated.View style={{ transform: [{ rotate: deg }] }}>
      <Ionicons name="notifications" size={size} color={color} />
    </Animated.View>
  );
}

function TabIcon({ label, icon, onPress }: { label: string; icon: any; onPress: () => void }) {
  const isAlert = icon === 'megaphone' || icon === 'notifications';
  return (
    <TouchableOpacity onPress={onPress} style={{ alignItems: 'center', flex: 1 }}>
      {isAlert ? (
        <RingingBellIcon size={20} color="#F59E0B" />
      ) : (
        <Ionicons name={icon} size={20} color="#0A7C3A" />
      )}
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
  const titleFontSize = lang === 'en' ? 26 : 25;
  const titleLetterSpacing = lang === 'ar' ? 0.3 : 0.5;
  const textAlignValue: 'left' | 'right' = (isRTL ? 'right' : 'left');
  const gradientColors = ['rgba(0,0,0,0.0)', 'rgba(0,0,0,0.65)'];

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ImageBackground source={bg} style={[styles.header, s==='education' && styles.eduHeader]} imageStyle={s==='urgence' ? styles.urgencyImage : undefined} resizeMode="cover">
        <View style={styles.lightOverlay} />
        <LinearGradient colors={gradientColors} locations={[0,1]} style={styles.overlay} />
        <View style={[styles.headerContent, styles.urgencyContent]}>
          {s === 'education' || s === 'sante' ? null : (
            <View style={styles.urgencyTitleWrap}>
              <Text style={[styles.urgencyTitleStroke, { fontSize: titleFontSize, letterSpacing: titleLetterSpacing, textAlign: textAlignValue }]}>{displayLabel}</Text>
              <Text style={[styles.urgencyTitle, { fontSize: titleFontSize, letterSpacing: titleLetterSpacing, textAlign: textAlignValue }]}>{displayLabel}</Text>
            </View>
          )}
        </View>
      </ImageBackground>
      <View style={{ padding: 16, flex: 1 }}>
        <Text>Contenu à venir {catLabel}</Text>
      </View>
      <View style={styles.bottomTabs}>
        <TabIcon label={t('tabHome')} icon="home" onPress={() => router.push('/(tabs)/home')} />
        <TabIcon label={t('tabAlerts')} icon="notifications" onPress={() => router.push('/(tabs)/alerts')} />
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