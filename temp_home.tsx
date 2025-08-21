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
  carousel: { 
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  card: { 
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
  },
  icon: { 
    width: 60, 
    height: 60, 
    marginBottom: 8,
    resizeMode: 'contain',
  },
  cardLabel: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#0F5132', 
    textAlign: 'center' 
  },
});