import React, { useMemo } from 'react';
import { View, Text, ImageBackground, StyleSheet } from 'react-native';
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

export default function CategoryPage() {
  const { slug } = useLocalSearchParams();
  const s = Array.isArray(slug) ? slug[0] : slug || '';
  const bg = HEADERS[s] || HEADERS['urgence'];
  const { t, lang, isRTL } = useI18n();
  const { user } = useAuth();

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
  const catLabel = map[s] || s;

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
      <ImageBackground source={bg} style={[styles.header]} resizeMode="cover">
        <LinearGradient colors={gradientColors} locations={[0,1]} style={styles.overlay} />
        <View style={[styles.headerContent]}>
          {s === 'education' || s === 'sante' ? null : (
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
    </View>
  );
}

const styles = StyleSheet.create({
  header: { height: 280, justifyContent: 'flex-end' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  headerContent: { paddingTop: 16, paddingRight: 16, paddingBottom: 16, paddingLeft: 20 },
  urgencyTitleWrap: { position: 'relative', marginTop: -2 },
  urgencyTitleStroke: { color: 'transparent', fontSize: 30, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase', textAlign: 'left',
    textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 1.5, position: 'absolute', left: 0, top: 0 },
  urgencyTitle: { color: '#fff', fontSize: 30, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase', textAlign: 'left',
    textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6 },
});