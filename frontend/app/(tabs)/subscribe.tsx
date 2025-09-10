import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Linking, Alert, Image, ScrollView, Dimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { apiFetch } from '../../src/utils/api';
import { useI18n } from '../../src/i18n/i18n';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const APP_ICON = require('../../assets/icons/icons/icon.png');
const { width } = Dimensions.get('window');

// Layout constants (8pt grid)
const H_PADDING = 20; // horizontal page padding
const GAP = 16;       // gap between grid cards
const CARD_WIDTH = (width - (H_PADDING * 2) - GAP) / 2; // two columns

export default function Subscribe() {
  const { user, refreshUserData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshingStatus, setRefreshingStatus] = useState(false);
  const router = useRouter();
  const { t } = useI18n();

  const startPayment = async () => {
    if (!user?.id) { router.push('/auth/register'); return; }
    setLoading(true);
    try {
      const res = await apiFetch('/api/payments/cinetpay/initiate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, amount_fcfa: 1200 })
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && (json as any).payment_url) {
        await Linking.openURL((json as any).payment_url);
        setTimeout(() => {
          Alert.alert(
            t('paymentComplete'),
            t('refreshStatusQuestion'),
            [
              { text: t('later'), style: 'cancel' },
              { text: t('refreshStatus'), onPress: refreshStatus }
            ]
          );
        }, 2000);
      } else {
        Alert.alert('Paiement', ((json as any).detail || `Erreur HTTP ${res.status}`));
      }
    } catch (e: any) {
      Alert.alert(t('network'), e?.message || 'Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  const refreshStatus = async () => {
    setRefreshingStatus(true);
    try {
      await refreshUserData?.();
    } finally {
      setRefreshingStatus(false);
    }
  };

  const goRegister = () => router.push('/auth/register');

  const premiumFeatures = [
    { key: 'exams', icon: '📚', title: t('cat_examens'), description: t('premiumFeature_exams') },
    { key: 'education', icon: '🎓', title: t('cat_education'), description: t('premiumFeature_education') },
    { key: 'jobs', icon: '💼', title: t('cat_emplois'), description: t('premiumFeature_jobs') },
    { key: 'services', icon: '🏛️', title: t('cat_services_publics'), description: t('premiumFeature_services') },
    { key: 'utilities', icon: '⚡', title: t('cat_services_utiles'), description: t('premiumFeature_utilities') },
    { key: 'agriculture', icon: '🌾', title: t('cat_agriculture'), description: t('premiumFeature_agriculture') },
    { key: 'leisure', icon: '🏖️', title: t('cat_loisirs'), description: t('premiumFeature_leisure') },
    { key: 'transport', icon: '🚌', title: t('cat_transport'), description: t('premiumFeature_transport') },
  ];

  const isPremium = user?.is_premium;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.brand}>{t('brand')}</Text>
          <Text style={styles.slogan}>{t('slogan')}</Text>
        </View>

        {/* Logo & Status */}
        <View style={styles.logoSection}>
          <View style={styles.logoWrapper}>
            <View style={styles.logoContainer}>
              <Image source={APP_ICON} style={styles.logo} />
            </View>
            {isPremium && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumBadgeText}>✨ {'Premium 1200 FCFA / an'}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Premium Status Card */}
        {isPremium ? (
          <LinearGradient
            colors={['#0A7C3A', '#0F5132']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={[styles.statusCard, styles.statusCardPremium]}
          >
            <Text style={[styles.statusTitle, styles.statusTitlePremium]}>
              {t('premiumActive')}
            </Text>
            <View style={styles.premiumInfo}>
              <Text style={styles.premiumDescription}>{t('premiumActiveDescription')}</Text>
              {user?.premium_expires_at && (
                <Text style={styles.expiryText}>
                  {t('expiresOn')} {new Date(user.premium_expires_at).toLocaleDateString('fr-FR')}
                </Text>
              )}
              <TouchableOpacity
                onPress={refreshStatus}
                style={styles.refreshButton}
                disabled={refreshingStatus}
                accessibilityRole="button"
              >
                {refreshingStatus ? (
                  <ActivityIndicator size="small" color="#0A7C3A" />
                ) : (
                  <Text style={styles.refreshButtonText}>{t('refreshStatus')}</Text>
                )}
              </TouchableOpacity>
              <View style={{ height: 8 }} />
              <TouchableOpacity onPress={startPayment} style={[styles.button, styles.buttonOutline]}>
                <Text style={styles.buttonOutlineText}>{t('renewPremium')}</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        ) : (
          <View style={[styles.statusCard, styles.statusCardFree]}>
            {/* Smaller title as requested */}
            <Text style={[styles.statusTitle, styles.statusTitleFree, { fontSize: 20 }]}>Premium 1200 FCFA / an</Text>
            <View style={styles.subscriptionInfo}>
              {/* Remove big price and perYear text per request */}
              <Text style={styles.description}>{t('premiumDescription')}</Text>
            </View>
          </View>
        )}

        {/* Features Grid */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>{t('premiumFeatures')}</Text>
          <View style={styles.featuresGrid}>
            {premiumFeatures.map((feature, index) => (
              <View key={feature.key} style={[styles.featureCard, (index % 2 === 1) && styles.featureCardRight]}>
                {/* Side-by-side icon and texts */}
                <Text style={styles.featureIcon}>{feature.icon}</Text>
                <View style={styles.featureTextWrap}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                  {isPremium && <Text style={styles.featureUnlocked}>✓ {t('unlocked')}</Text>}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Call to Action */}
        <View style={styles.ctaSection}>
          {!user?.id ? (
            <>
              <Text style={styles.ctaText}>{t('needAccountToProceed')}</Text>
              <TouchableOpacity onPress={goRegister} style={[styles.button, styles.buttonSecondary]} accessibilityRole="button">
                <Text style={styles.buttonSecondaryText}>{t('createAccount')}</Text>
              </TouchableOpacity>
            </>
          ) : isPremium ? (
            <>
              <Text style={styles.ctaText}>{t('premiumThankYou')}</Text>
            </>
          ) : (
            <>
              <Text style={styles.ctaText}>{t('premiumCallToAction')}</Text>
              <TouchableOpacity
                onPress={startPayment}
                style={styles.button}
                disabled={loading}
                accessibilityRole="button"
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>{t('subscribePremium')}</Text>
                )}
              </TouchableOpacity>
              <Text style={styles.paymentNote}>{t('securePaymentByCinetPay')}</Text>
            </>
          )}
        </View>

        {/* Bottom spacer for safe scroll */}
        <View style={{ height: Platform.select({ ios: 24, android: 16, default: 16 }) }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: H_PADDING,
    paddingBottom: 10,
  },
  brand: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0A7C3A',
    textAlign: 'center',
  },
  slogan: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  logoSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  logoWrapper: {
    position: 'relative',
  },
  logoContainer: {
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 4,
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
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 3,
    borderColor: '#ffffff',
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
  statusCard: {
    marginHorizontal: H_PADDING,
    marginTop: 8,
    marginBottom: 20,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  statusCardFree: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E8F0E8',
  },
  statusCardPremium: {
    overflow: 'hidden',
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  statusTitleFree: {
    color: '#0A7C3A',
  },
  statusTitlePremium: {
    color: '#fff',
  },
  subscriptionInfo: {
    alignItems: 'center',
  },
  price: {
    fontSize: 36,
    fontWeight: '800',
    color: '#0A7C3A',
  },
  period: {
    fontSize: 18,
    color: '#666',
    marginTop: -4,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  premiumInfo: {
    alignItems: 'center',
  },
  premiumDescription: {
    fontSize: 16,
    color: '#E8F0E8',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  expiryText: {
    fontSize: 14,
    color: '#B8D8C0',
    marginBottom: 16,
  },
  refreshButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    minHeight: 36,
    justifyContent: 'center',
  },
  refreshButtonText: {
    color: '#0A7C3A',
    fontWeight: '600',
    fontSize: 14,
  },
  featuresSection: {
    paddingHorizontal: H_PADDING,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F5132',
    textAlign: 'center',
    marginBottom: 20,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: GAP,
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  featureCardRight: {
    marginLeft: GAP,
  },
  featureIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  featureTextWrap: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F5132',
    textAlign: 'left',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'left',
    lineHeight: 16,
  },
  featureUnlocked: {
    fontSize: 12,
    color: '#0A7C3A',
    fontWeight: '600',
    marginTop: 4,
  },
  ctaSection: {
    paddingHorizontal: H_PADDING,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#0A7C3A',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    minWidth: 250,
    alignItems: 'center',
    shadowColor: '#0A7C3A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonSecondary: {
    backgroundColor: '#0F5132',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  buttonSecondaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonOutlineText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  paymentNote: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
});