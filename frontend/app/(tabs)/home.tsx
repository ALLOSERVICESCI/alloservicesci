import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useI18n } from '../../src/i18n/i18n';

const { width } = Dimensions.get('window');

export default function Home() {
  const { user } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const greeting = user?.first_name ? `${t('hello')} ${user.first_name}` : t('welcome');

  const categories = useMemo(() => [
    { slug: 'urgence', label: t('cat_urgence'), icon: '🚨', isPremium: false },
    { slug: 'sante', label: t('cat_sante'), icon: '🏥', isPremium: false },
    { slug: 'alertes', label: t('cat_alertes'), icon: '📢', isPremium: false },
    { slug: 'education', label: t('cat_education'), icon: '🎓', isPremium: true },
    { slug: 'examens_concours', label: t('cat_examens'), icon: '📚', isPremium: true },
    { slug: 'services_publics', label: t('cat_services_publics'), icon: '🏛️', isPremium: true },
    { slug: 'emplois', label: t('cat_emplois'), icon: '💼', isPremium: true },
    { slug: 'services_utiles', label: t('cat_services_utiles'), icon: '⚡', isPremium: true },
    { slug: 'agriculture', label: t('cat_agriculture'), icon: '🌾', isPremium: true },
    { slug: 'loisirs_tourisme', label: t('cat_loisirs'), icon: '🏖️', isPremium: true },
    { slug: 'transport', label: t('cat_transport'), icon: '🚌', isPremium: true },
  ], [t]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.brand}>{t('brand')}</Text>
        <Text style={styles.slogan}>{t('slogan')}</Text>
        <Text style={styles.greeting}>{greeting}</Text>
      </View>

      {/* Welcome Card */}
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeTitle}>{t('welcome')}</Text>
        <Text style={styles.welcomeDescription}>
          {t('premiumDescription')}
        </Text>
      </View>

      {/* Categories Carousel */}
      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>{t('categories')}</Text>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.carousel}
          style={styles.carouselContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity 
              key={category.slug} 
              style={[
                styles.categoryCard,
                category.isPremium && styles.categoryCardPremium
              ]}
              onPress={() => router.push(`/category/${category.slug}`)}
            >
              {category.isPremium && (
                <View style={styles.premiumBadge}>
                  <Text style={styles.premiumBadgeText}>✨</Text>
                </View>
              )}
              
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              
              <Text style={[
                styles.categoryLabel,
                category.isPremium && styles.categoryLabelPremium
              ]}>
                {category.label}
              </Text>
              
              {category.isPremium && (
                <Text style={styles.premiumText}>Premium</Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF' 
  },
  header: { 
    paddingHorizontal: 16, 
    paddingTop: 24, 
    paddingBottom: 12,
    alignItems: 'center',
  },
  brand: { 
    fontSize: 24, 
    fontWeight: '800', 
    color: '#0A7C3A' 
  },
  slogan: { 
    fontSize: 14, 
    color: '#666', 
    marginTop: 2 
  },
  greeting: { 
    fontSize: 14, 
    color: '#0F5132', 
    marginTop: 6, 
    fontWeight: '700' 
  },
  welcomeCard: {
    marginHorizontal: 16,
    marginVertical: 16,
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0A7C3A',
    marginBottom: 8,
  },
  welcomeDescription: {
    fontSize: 14,
    color: '#6C757D',
    lineHeight: 20,
  },
  categoriesSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F5132',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  carouselContainer: {
    flexGrow: 0,
  },
  carousel: { 
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryCard: { 
    width: 140,
    height: 160,
    backgroundColor: '#F6F8F6',
    borderRadius: 12,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8F0E8',
    position: 'relative',
  },
  categoryCardPremium: {
    backgroundColor: '#FFF8E1',
    borderColor: '#FFD54F',
    borderWidth: 2,
  },
  premiumBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFD54F',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumBadgeText: {
    fontSize: 12,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryLabel: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#0F5132', 
    textAlign: 'center',
    marginBottom: 4,
  },
  categoryLabelPremium: {
    color: '#F57C00',
  },
  premiumText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#F57C00',
    textTransform: 'uppercase',
  },
});