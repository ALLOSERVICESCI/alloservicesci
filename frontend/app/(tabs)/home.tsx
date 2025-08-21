import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useI18n } from '../../src/i18n/i18n';

const APP_ICON = require('../../assets/icons/icons/icon.png');
const { width } = Dimensions.get('window');

export default function Home() {
  const { user } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const greeting = user?.first_name ? `${t('hello')} ${user.first_name}` : '';

  const categories = useMemo(() => [
    { slug: 'ai', label: t('ai_agent'), icon: '🐘', isPremium: false },
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
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.pageWrapper}>
        {/* Header with Logo */}
        <View style={styles.header}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Image source={APP_ICON} style={styles.logo} />
            </View>
          </View>
          
          {/* Brand Info */}
          <View style={styles.brandSection}>
            <Text style={styles.brand}>{t('brand')}</Text>
            <Text style={styles.slogan}>{t('slogan')}</Text>
            <Text style={styles.greeting}>{greeting}</Text>
          </View>
        </View>

        {/* Categories Carousel - AU MILIEU */}
        <View style={styles.categoriesSection}>
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
                onPress={() => category.slug === 'ai' ? router.push('/ai/chat') : router.push(`/category/${category.slug}`)}
              >
                {category.isPremium && (
                  <View style={styles.premiumBadge}>
                    <Text style={styles.premiumBadgeText}>🔒</Text>
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

        {/* Ivorian emblem below categories and motto */}
        <View style={styles.emblemSection}>
          <Image
            source={{ uri: 'https://customer-assets.emergentagent.com/job_allo-premium/artifacts/5tgdv5mj_512px-Coat_of_arms_of_Co%CC%82te_d%27Ivoire_%281997-2001_variant%29.svg.png' }}
            style={styles.emblemImage}
          />
          <Text style={styles.mottoText}>
            Union - Discipline - Travail
          </Text>
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAF9' 
  },
  pageWrapper: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  scrollContent: {
    paddingBottom: 30,
    flexGrow: 1,
  },
  header: { 
    paddingHorizontal: 20, 
    paddingTop: 30, 
    paddingBottom: 20,
    alignItems: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoContainer: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 4,
    borderColor: '#0A7C3A',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  logo: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  brandSection: {
    alignItems: 'center',
  },
  brand: { 
    fontSize: 32, 
    fontWeight: '800', 
    color: '#0A7C3A' 
  },
  slogan: { 
    fontSize: 18, 
    color: '#666', 
    marginTop: 4,
    textAlign: 'center',
  },
  greeting: { 
    fontSize: 20, 
    color: '#0F5132', 
    marginTop: 8, 
    fontWeight: '700',
    textAlign: 'center',
  },
  
  // Categories Section - CENTRÉE AU MILIEU
  categoriesSection: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 24,
    marginTop: -8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F5132',
    marginHorizontal: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  carouselContainer: {
    paddingLeft: 20,
  },
  carousel: { 
    paddingRight: 20,
    paddingVertical: 8,
  },
  
  // CARTES DE CATÉGORIES AGRANDIES
  categoryCard: {
    width: 160,
    height: 190,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8F0E8',
    position: 'relative',
  },
  categoryCardPremium: {
    borderColor: '#0A7C3A',
    borderWidth: 2,
    backgroundColor: '#fff',
  },
  premiumBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: '#0A7C3A',
  },
  premiumBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0A7C3A',
  },
  // ICÔNES AGRANDIES À 64PX
  categoryIcon: {
    fontSize: 64,
    marginBottom: 12,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F5132',
    textAlign: 'center',
    lineHeight: 20,
  },
  categoryLabelPremium: {
    color: '#0A7C3A',
    fontWeight: '700',
  },
  // STYLE PREMIUM AMÉLIORÉ
  premiumText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFD700',
    backgroundColor: '#8B7000',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 8,
    textTransform: 'uppercase',
  },
  
  // Emblem Section
  emblemSection: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  emblemImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  mottoText: {
    marginTop: 8,
    color: '#0F5132',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
});