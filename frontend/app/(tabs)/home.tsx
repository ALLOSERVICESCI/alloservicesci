import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Link } from 'expo-router';
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
    backgroundColor: '#FFFFFF' 
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: { 
    paddingHorizontal: 16, 
    paddingTop: 24, 
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoSection: {
    marginRight: 16,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0A7C3A',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  brandSection: {
    flex: 1,
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
  
  // Welcome Card
  welcomeCard: {
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#0A7C3A',
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0A7C3A',
    marginBottom: 8,
  },
  welcomeDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  
  // Categories Section
  categoriesSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0A7C3A',
    marginHorizontal: 16,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  carouselContainer: {
    marginBottom: 8,
  },
  carousel: { 
    paddingHorizontal: 12, 
    paddingVertical: 8 
  },
  
  // Category Cards
  categoryCard: { 
    width: 160, 
    height: 180, 
    backgroundColor: '#F6F8F6', 
    borderRadius: 20, 
    marginRight: 12, 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 16,
    position: 'relative',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  categoryCardPremium: {
    backgroundColor: '#FFF8E1',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  premiumBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFD700',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumBadgeText: {
    fontSize: 12,
  },
  categoryIconContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryIcon: { 
    width: 48, 
    height: 48, 
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
    color: '#B8860B',
  },
  premiumIndicator: {
    position: 'absolute',
    bottom: 8,
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  premiumIndicatorText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#B8860B',
  },
  
  // Quick Actions
  quickActionsSection: {
    marginTop: 24,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: '#F6F8F6',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
  },
  quickActionEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F5132',
    textAlign: 'center',
  },
});