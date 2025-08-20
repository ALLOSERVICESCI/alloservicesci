import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useI18n } from '../../src/i18n/i18n';

const APP_ICON = require('../../assets/icons/icons/icon.png');
const { width } = Dimensions.get('window');

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

export default function Home() {
  const { user } = useAuth();
  const { t } = useI18n();
  const greeting = user?.first_name ? `${t('hello')} ${user.first_name}` : t('welcome');

  const categories = useMemo(() => [
    { slug: 'urgence', label: t('cat_urgence'), emoji: '🚨', isPremium: false },
    { slug: 'sante', label: t('cat_sante'), emoji: '🏥', isPremium: false },
    { slug: 'education', label: t('cat_education'), emoji: '🎓', isPremium: true },
    { slug: 'examens_concours', label: t('cat_examens'), emoji: '📚', isPremium: true },
    { slug: 'services_publics', label: t('cat_services_publics'), emoji: '🏛️', isPremium: true },
    { slug: 'emplois', label: t('cat_emplois'), emoji: '💼', isPremium: true },
    { slug: 'alertes', label: t('cat_alertes'), emoji: '📢', isPremium: false },
    { slug: 'services_utiles', label: t('cat_services_utiles'), emoji: '⚡', isPremium: true },
    { slug: 'agriculture', label: t('cat_agriculture'), emoji: '🌾', isPremium: true },
    { slug: 'loisirs_tourisme', label: t('cat_loisirs'), emoji: '🏖️', isPremium: true },
    { slug: 'transport', label: t('cat_transport'), emoji: '🚌', isPremium: true },
  ], [t]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Image source={APP_ICON} style={styles.logo} />
          </View>
        </View>
        
        <View style={styles.brandSection}>
          <Text style={styles.brand}>{t('brand')}</Text>
          <Text style={styles.slogan}>{t('slogan')}</Text>
          <Text style={styles.greeting}>{greeting}</Text>
        </View>
      </View>

      {/* Welcome Card */}
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeTitle}>{t('welcome')}</Text>
        <Text style={styles.welcomeDescription}>
          {t('premiumDescription')}
        </Text>
      </View>

      {/* Categories Section */}
      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>{t('categories')}</Text>
        <Text style={styles.sectionSubtitle}>
          {t('selectCategory')}
        </Text>
        
        {/* Horizontal Carousel */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.carousel}
          style={styles.carouselContainer}
        >
          {categories.map((category) => (
            <Link 
              key={category.slug} 
              href={{ pathname: '/category/[slug]', params: { slug: category.slug } }} 
              asChild
            >
              <TouchableOpacity style={[
                styles.categoryCard,
                category.isPremium && styles.categoryCardPremium
              ]}>
                {category.isPremium && (
                  <View style={styles.premiumBadge}>
                    <Text style={styles.premiumBadgeText}>✨</Text>
                  </View>
                )}
                
                <View style={styles.categoryIconContainer}>
                  <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                  <Image 
                    source={ICONS[category.slug as keyof typeof ICONS]} 
                    style={styles.categoryIcon} 
                  />
                </View>
                
                <Text style={[
                  styles.categoryLabel,
                  category.isPremium && styles.categoryLabelPremium
                ]}>
                  {category.label}
                </Text>
                
                {category.isPremium && (
                  <View style={styles.premiumIndicator}>
                    <Text style={styles.premiumIndicatorText}>Premium</Text>
                  </View>
                )}
              </TouchableOpacity>
            </Link>
          ))}
        </ScrollView>
      </View>

      {/* Quick Actions Grid */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>{t('quickAccess')}</Text>
        <View style={styles.quickActionsGrid}>
          <Link href="/alerts" asChild>
            <TouchableOpacity style={styles.quickActionCard}>
              <Text style={styles.quickActionEmoji}>📢</Text>
              <Text style={styles.quickActionLabel}>{t('cat_alertes')}</Text>
            </TouchableOpacity>
          </Link>
          
          <Link href="/pharmacies" asChild>
            <TouchableOpacity style={styles.quickActionCard}>
              <Text style={styles.quickActionEmoji}>🏥</Text>
              <Text style={styles.quickActionLabel}>{t('cat_sante')}</Text>
            </TouchableOpacity>
          </Link>
          
          <Link href="/subscribe" asChild>
            <TouchableOpacity style={styles.quickActionCard}>
              <Text style={styles.quickActionEmoji}>⭐</Text>
              <Text style={styles.quickActionLabel}>Premium</Text>
            </TouchableOpacity>
          </Link>
          
          <Link href="/profile" asChild>
            <TouchableOpacity style={styles.quickActionCard}>
              <Text style={styles.quickActionEmoji}>👤</Text>
              <Text style={styles.quickActionLabel}>{t('tabProfile')}</Text>
            </TouchableOpacity>
          </Link>
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
  scrollContent: {
    paddingBottom: 30,
  },
  header: { 
    paddingHorizontal: 20, 
    paddingTop: 30, 
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoSection: {
    marginRight: 16,
  },
  logoContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#0A7C3A',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  brandSection: {
    flex: 1,
  },
  brand: { 
    fontSize: 26, 
    fontWeight: '800', 
    color: '#0A7C3A' 
  },
  slogan: { 
    fontSize: 15, 
    color: '#666', 
    marginTop: 4,
    lineHeight: 20,
  },
  greeting: { 
    fontSize: 16, 
    color: '#0F5132', 
    marginTop: 8, 
    fontWeight: '700' 
  },
  
  // Welcome Card
  welcomeCard: {
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E8F0E8',
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F5132',
    marginBottom: 8,
  },
  welcomeDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },

  // Categories Section
  categoriesSection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F5132',
    marginHorizontal: 20,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#666',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  carouselContainer: {
    paddingLeft: 20,
  },
  carousel: { 
    paddingRight: 20,
    paddingVertical: 8,
  },
  
  // Category Cards
  categoryCard: { 
    width: 160,
    height: 180,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E8F0E8',
    position: 'relative',
  },
  categoryCardPremium: {
    borderColor: '#FFD700',
    borderWidth: 2,
  },
  premiumBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFD700',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  premiumBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8B7000',
  },
  categoryIconContainer: {
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  categoryEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryIcon: { 
    width: 60, 
    height: 60, 
    resizeMode: 'contain',
  },
  categoryLabel: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#0F5132', 
    textAlign: 'center',
    lineHeight: 18,
  },
  categoryLabelPremium: {
    color: '#8B7000',
  },
  premiumIndicator: {
    position: 'absolute',
    bottom: 8,
    backgroundColor: '#FFD700',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  premiumIndicatorText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8B7000',
  },

  // Quick Actions Section
  quickActionsSection: {
    marginTop: 30,
    marginHorizontal: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (width - 60) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E8F0E8',
  },
  quickActionEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F5132',
    textAlign: 'center',
  },
});