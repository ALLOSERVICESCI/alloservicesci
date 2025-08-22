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
  const { t } = useI18n();
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

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ImageBackground source={bg} style={styles.header} imageStyle={s==='urgence' ? styles.urgencyImage : undefined} resizeMode="cover">
        {/* Éclaircissement global léger */}
        <View style={styles.lightOverlay} />
        {/* Dégradé bas pour lisibilité */}
        <LinearGradient colors={['rgba(0,0,0,0.0)','rgba(0,0,0,0.6)']} locations={[0,1]} style={styles.overlay} />
        <View style={[styles.headerContent, s==='urgence' && styles.urgencyContent]}>
          {s === 'urgence' ? (
            <Text style={styles.urgencyTitle}>Urgence</Text>
          ) : (
            <>
              <Text style={styles.brand}>{t('brand')}</Text>
              <Text style={styles.slogan}>{t('slogan')}</Text>
              {!!greeting && <Text style={styles.greeting}>{greeting}</Text>}
              <Text style={styles.headerTitle}>{catLabel}</Text>
            </>
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
  header: { height: 260, justifyContent: 'flex-end' },
  urgencyImage: { resizeMode: 'cover' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  lightOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.10)' },
  headerContent: { padding: 16 },
  urgencyContent: { alignItems: 'flex-start', justifyContent: 'center', height: '100%', paddingBottom: 0 },
  brand: { color: '#fff', fontSize: 16, fontWeight: '800' },
  slogan: { color: '#E8F0E8', fontSize: 12, marginTop: 2 },
  greeting: { color: '#D6F5E2', fontSize: 12, marginTop: 4, fontWeight: '700' },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 8 },
  urgencyTitle: { color: '#fff', fontSize: 32, fontWeight: '800', letterSpacing: 0, textTransform: 'uppercase', textAlign: 'left',
    textShadowColor: 'rgba(0,0,0,0.4)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
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