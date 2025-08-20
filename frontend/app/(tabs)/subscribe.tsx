import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Linking, Alert, Image, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { apiFetch } from '../../src/utils/api';
import { useI18n } from '../../src/i18n/i18n';

const APP_ICON = require('../../assets/icons/icons/icon.png');
const { width } = Dimensions.get('window');

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
        // Proposer de rafraîchir le statut après paiement
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
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.brand}>{t('brand')}</Text>
        <Text style={styles.slogan}>{t('slogan')}</Text>
      </View>

      {/* Logo & Status */}
      <View style={styles.logoSection}>
        <View style={styles.logoWrapper}>
          <Image source={APP_ICON} style={styles.logo} />
          {isPremium && (
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumBadgeText}>✨ {t('premium')}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Premium Status Card */}
      <View style={[styles.statusCard, isPremium ? styles.statusCardPremium : styles.statusCardFree]}>
        <Text style={[styles.statusTitle, isPremium ? styles.statusTitlePremium : styles.statusTitleFree]}>
          {isPremium ? t('premiumActive') : t('premiumTitle')}
        </Text>
        
        {isPremium ? (
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
            >
              {refreshingStatus ? (
                <ActivityIndicator size="small" color="#0A7C3A" />
              ) : (
                <Text style={styles.refreshButtonText}>{t('refreshStatus')}</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.subscriptionInfo}>
            <Text style={styles.price}>1 200 FCFA</Text>
            <Text style={styles.period}>/ {t('year')}</Text>
            <Text style={styles.description}>{t('premiumDescription')}</Text>
          </View>
        )}
      </View>

      {/* Features Grid */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>{t('premiumFeatures')}</Text>
        <View style={styles.featuresGrid}>
          {premiumFeatures.map((feature, index) => (
            <View key={feature.key} style={[styles.featureCard, index % 2 === 1 && styles.featureCardRight]}>
              <Text style={styles.featureIcon}>{feature.icon}</Text>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
              {isPremium && <Text style={styles.featureUnlocked}>✓ {t('unlocked')}</Text>}
            </View>
          ))}
        </View>
      </View>

      {/* Call to Action */}
      <View style={styles.ctaSection}>
        {!user?.id ? (
          <>
            <Text style={styles.ctaText}>{t('needAccountToProceed')}</Text>
            <TouchableOpacity onPress={goRegister} style={[styles.button, styles.buttonSecondary]}>
              <Text style={styles.buttonSecondaryText}>{t('createAccount')}</Text>
            </TouchableOpacity>
          </>
        ) : isPremium ? (
          <>
            <Text style={styles.ctaText}>{t('premiumThankYou')}</Text>
            <TouchableOpacity onPress={startPayment} style={[styles.button, styles.buttonOutline]}>
              <Text style={styles.buttonOutlineText}>{t('renewPremium')}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.ctaText}>{t('premiumCallToAction')}</Text>
            <TouchableOpacity 
              onPress={startPayment} 
              style={styles.button}
              disabled={loading}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 20,
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
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#0A7C3A',
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
    margin: 20,
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
    backgroundColor: 'linear-gradient(135deg, #0A7C3A, #0F5132)',
    backgroundColor: '#0A7C3A',
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
    paddingHorizontal: 20,
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
    width: (width - 50) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  featureCardRight: {
    marginLeft: 10,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F5132',
    textAlign: 'center',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  featureUnlocked: {
    fontSize: 12,
    color: '#0A7C3A',
    fontWeight: '600',
    marginTop: 4,
  },
  ctaSection: {
    paddingHorizontal: 20,
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
    borderColor: '#0A7C3A',
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
    color: '#0A7C3A',
    fontSize: 16,
    fontWeight: '600',
  },
  paymentNote: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
});
