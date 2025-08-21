import React, { useMemo } from 'react';
import { View, Text, ImageBackground, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { useI18n } from '../../src/i18n/i18n';

const HEADERS: any = {
  urgence: require('../../assets/headers/headers/urgence_bg.png'),
  sante: require('../../assets/headers/headers/sante_bg.png'),
  education: require('../../assets/headers/headers/education_bg.png'),
  examens_concours: require('../../assets/headers/headers/examens_concours_bg.png'),
  services_publics: require('../../assets/headers/headers/services_publics_bg.png'),
  // Keep emplois using existing icon to avoid missing asset in web bundler
  emplois: require('../../assets/icons/icons/emplois.png'),
  alertes: require('../../assets/headers/headers/alertes_bg.png'),
  services_utiles: require('../../assets/headers/headers/services_utiles_bg.png'),
  agriculture: require('../../assets/headers/headers/agriculture_bg.png'),
  loisirs_tourisme: require('../../assets/headers/headers/loisirs_tourisme_bg.png'),
  transport: require('../../assets/headers/headers/transport_bg.png'),
};

const slugToKey = (slug: string): string => {
  switch (slug) {
    case 'examens_concours': return 'cat_examens';
    case 'services_publics': return 'cat_services_publics';
    case 'loisirs_tourisme': return 'cat_loisirs';
    case 'services_utiles': return 'cat_services_utiles';
    default: return `cat_${slug}`;
  }
};

function TabIcon({ label, icon, onPress }: { label: string; icon: any; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.tabItem}>
      <Ionicons name={icon} size={22} color="#0A7C3A" />
      <Text style={styles.tabLabel} numberOfLines={1}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function CategoryPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { user } = useAuth();
  const { t } = useI18n();
  const s = (slug as string) || 'urgence';
  const bg = HEADERS[s] || HEADERS.urgence;

  const catLabel = useMemo(() => t(slugToKey(s)), [s, t]);
  const greeting = user?.first_name ? `${t('hello')} ${user.first_name}` : '';

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ImageBackground source={bg} style={styles.header} resizeMode="cover">
        <View style={styles.overlay} />
        <View style={styles.headerContent}>
          <Text style={styles.brand}>{t('brand')}</Text>
          <Text style={styles.slogan}>{t('slogan')}</Text>
          {!!greeting && <Text style={styles.greeting}>{greeting}</Text>}
          <Text style={styles.headerTitle}>{catLabel}</Text>
        </View>

      {/* Bottom Tab Quick Nav (icons) */}
      <View style={styles.bottomTabs}>
        <TabIcon label={t('tabHome')} icon="home" onPress={() => router.push('/(tabs)/home')} />

function TabIcon({ label, icon, onPress }: { label: string; icon: any; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.tabItem}>
      <Ionicons name={icon} size={22} color="#0A7C3A" />
      <Text style={styles.tabLabel} numberOfLines={1}>{label}</Text>
    </TouchableOpacity>
  );
}

        <TabIcon label={t('tabAlerts')} icon="megaphone" onPress={() => router.push('/(tabs)/alerts')} />
        <TabIcon label={t('tabPharm')} icon="medkit" onPress={() => router.push('/(tabs)/pharmacies')} />
        <TabIcon label={t('tabPremium')} icon="card" onPress={() => router.push('/(tabs)/subscribe')} />
        <TabIcon label={t('tabProfile')} icon="person" onPress={() => router.push('/(tabs)/profile')} />
      </View>

      </ImageBackground>
      <View style={{ padding: 16 }}>
        <Text>{t('comingSoon')} {catLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { height: 200, justifyContent: 'flex-end' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  headerContent: { padding: 16 },
  brand: { color: '#fff', fontSize: 16, fontWeight: '800' },
  slogan: { color: '#E8F0E8', fontSize: 12, marginTop: 2 },
  greeting: { color: '#D6F5E2', fontSize: 12, marginTop: 4, fontWeight: '700' },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 8 },
});