import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useI18n } from '../../src/i18n/i18n';

const ICONS = {
  urgence: require('../../assets/icons/icons/urgence.png'),
  sante: require('../../assets/icons/icons/sante.png'),
  education: require('../../assets/icons/icons/education.png'),
  examens_concours: require('../../assets/icons/icons/examens_concours.png'),
  services_publics: require('../../assets/icons/icons/services_publics.png'),
  emplois: require('../../assets/icons/icons/emplois.png'),
  alertes: require('../../assets/icons/icons/alertes.png'),
  services_utiles: require('../../assets/icons/icons/services_utiles.png'),
  agriculture: require('../../assets/icons/icons/agriculture.png'),
  loisirs_tourisme: require('../../assets/icons/icons/loisirs_tourisme.png'),
  transport: require('../../assets/icons/icons/transport.png'),
};

const CARD_BG = '#F6F8F6';

export default function Home() {
  const { user } = useAuth();
  const { t } = useI18n();
  const greeting = user?.first_name ? `${t('hello')} ${user.first_name}` : t('welcome');

  const categories = useMemo(() => [
    { slug: 'urgence', label: t('cat_urgence') },
    { slug: 'sante', label: t('cat_sante') },
    { slug: 'education', label: t('cat_education') },
    { slug: 'examens_concours', label: t('cat_examens') },
    { slug: 'services_publics', label: t('cat_services_publics') },
    { slug: 'emplois', label: t('cat_emplois') },
    { slug: 'alertes', label: t('cat_alertes') },
    { slug: 'services_utiles', label: t('cat_services_utiles') },
    { slug: 'agriculture', label: t('cat_agriculture') },
    { slug: 'loisirs_tourisme', label: t('cat_loisirs') },
    { slug: 'transport', label: t('cat_transport') },
  ], [t]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brand}>{t('brand')}</Text>
        <Text style={styles.slogan}>{t('slogan')}</Text>
        <Text style={styles.greeting}>{greeting}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
        {categories.map((c) => (
          <Link key={c.slug} href={{ pathname: '/category/[slug]', params: { slug: c.slug } }} asChild>
            <TouchableOpacity style={styles.card}>
              <Image source={ICONS[c.slug as keyof typeof ICONS]} style={styles.icon} />
              <Text style={styles.cardLabel}>{c.label}</Text>
            </TouchableOpacity>
          </Link>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 12 },
  brand: { fontSize: 24, fontWeight: '800', color: '#0A7C3A' },
  slogan: { fontSize: 14, color: '#666', marginTop: 2 },
  greeting: { fontSize: 14, color: '#0F5132', marginTop: 6, fontWeight: '700' },
  carousel: { paddingHorizontal: 12, paddingVertical: 8 },
  card: { width: 140, height: 160, backgroundColor: CARD_BG, borderRadius: 16, marginRight: 12, alignItems: 'center', justifyContent: 'center', padding: 12 },
  icon: { width: 64, height: 64, resizeMode: 'contain', marginBottom: 10 },
  cardLabel: { fontSize: 14, fontWeight: '600', color: '#0F5132', textAlign: 'center' },
});