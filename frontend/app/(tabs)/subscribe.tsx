import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Linking, Alert, Image, ScrollView, Dimensions, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useNotificationsCenter } from '../../src/context/NotificationsContext';
import { apiFetch } from '../../src/utils/api';
import { useI18n } from '../../src/i18n/i18n';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const APP_ICON = require('../../assets/icons/icons/icon.png');
const { width } = Dimensions.get('window');

const H_PADDING = 20;
const GAP = 16;
const COLS = 2;
const TILE_WIDTH = (width - (H_PADDING * 2) - (GAP * (COLS - 1))) / COLS;

export default function Subscribe() {
  const { user } = useAuth();
  const { items: notifItems } = useNotificationsCenter();
  const [loading, setLoading] = useState(false);
  const [refreshingStatus, setRefreshingStatus] = useState(false);
  const router = useRouter();
  const { t } = useI18n();

  const openExternal = async (url: string) => {
    try {
      if (Platform.OS === 'web') {
        await WebBrowser.openBrowserAsync(url);
      } else {
        const supported = await Linking.canOpenURL(url);
        if (supported) await Linking.openURL(url);
        else Alert.alert('Paiement', t('notAvailable'));
      }
    } catch (e: any) {
      Alert.alert('Paiement', e?.message || 'Impossible d\'ouvrir la page de paiement');
    }
  };

  const startPayment = async () => {
    if (!user?.id) {
      Alert.alert('Paiement', t('loginRequired'));
      router.push('/auth/register');
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch('/api/payments/cinetpay/initiate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, amount_fcfa: 1200 })
      });
      const json: any = await res.json().catch(() => ({}));
      if (res.ok && json.payment_url) {
        await openExternal(json.payment_url);
      } else {
        Alert.alert('Paiement', json?.detail ? String(json.detail) : `Erreur HTTP ${res.status}`);
      }
    } catch (e: any) {
      Alert.alert('Paiement', e?.message || 'Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  const goRegister = () => router.push('/auth/register');

  const premiumFeatures = [
    { key: 'pharmacies', icon: '💊', title: t('tabPharm'), description: '', slug: 'pharmacies' },
    { key: 'alerts', icon: '🔔', title: t('alertes'), description: '', slug: 'alertes' },
    { key: 'exams', icon: '📚', title: t('cat_examens'), description: t('premiumFeature_exams'), slug: 'examens_concours' },
    { key: 'education', icon: '🎓', title: t('cat_education'), description: t('premiumFeature_education'), slug: 'education' },
    { key: 'jobs', icon: '💼', title: t('cat_emplois'), description: t('premiumFeature_jobs'), slug: 'emplois' },
    { key: 'services', icon: '🏛️', title: t('cat_services_publics'), description: t('premiumFeature_services'), slug: 'services_publics' },
    { key: 'utilities', icon: '⚡', title: t('cat_services_utiles'), description: t('premiumFeature_utilities'), slug: 'services_utiles' },
    { key: 'agriculture', icon: '🌾', title: t('cat_agriculture'), description: t('premiumFeature_agriculture'), slug: 'agriculture' },
    { key: 'leisure', icon: '🏖️', title: t('cat_loisirs'), description: t('premiumFeature_leisure'), slug: 'loisirs_tourisme' },
    { key: 'transport', icon: '🚌', title: t('cat_transport'), description: t('premiumFeature_transport'), slug: 'transport' },
  ];

  const isPremium = (user as any)?.is_premium;
  const openCategory = (slug: string) => {
    if (slug === 'pharmacies') return router.push('/(tabs)/pharmacies');
    if (slug === 'alertes') return router.push('/(tabs)/alerts');
    return router.push(`/category/${slug}`);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.brand}>{t('brand')}</Text>
          <Text style={styles.slogan}>{t('slogan')}</Text>
        </View>

        <View style={styles.logoSection}>
          <View style={styles.logoWrapper}>
            <View style={styles.logoContainer}>
              <Image source={APP_ICON} style={styles.logo} />
            </View>
            {isPremium && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumBadgeText}>✨ {t('premiumAnnualTitle')}</Text>
              </View>
            )}
          </View>
        </View>

        {isPremium ? (
          <LinearGradient colors={['#0A7C3A', '#0F5132']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.statusCard, styles.statusCardPremium, { marginBottom: 28 }]}> 
            <Text style={[styles.statusTitle, styles.statusTitlePremium]}>
              {t('premiumActive')}
            </Text>
            <View style={styles.premiumInfo}>
              <Text style={styles.premiumDescription}>{t('premiumActiveDescription')}</Text>
              {(user as any)?.premium_expires_at && (
                <Text style={styles.expiryText}>
                  {t('expiresOn')} {new Date((user as any).premium_expires_at).toLocaleDateString('fr-FR')}
                </Text>
              )}
              <View style={{ height: 8 }} />
              <TouchableOpacity onPress={startPayment} style={[styles.button, styles.buttonOutline]} accessibilityRole="button">
                <Text style={styles.buttonOutlineText}>{t('renewPremium')}</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        ) : (
          <View style={[styles.statusCard, styles.statusCardFree]}>
            <Text style={[styles.statusTitle, styles.statusTitleFree, { fontSize: 20 }]}>{t('premiumAnnualTitle')}</Text>
          </View>
        )}

        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>{t('premiumFeatures')}</Text>
          <View style={styles.tilesGrid}>
            {premiumFeatures.map((feature) => (
              <TouchableOpacity key={feature.key} style={styles.tile} onPress={() => openCategory(feature.slug)} accessibilityRole="button">
                {feature.key === 'alerts' && !!notifItems?.length && (
                  <View style={styles.badgeNotifs}><Text style={styles.badgeText}>{notifItems.length > 99 ? '99+' : String(notifItems.length)}</Text></View>
                )}
                <Text style={styles.tileIcon}>{feature.icon}</Text>
                <Text style={styles.tileTitle} numberOfLines={2}>{feature.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.ctaSection}>
          {!user?.id ? (
            <>
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
              <TouchableOpacity onPress={startPayment} style={styles.button} disabled={loading} accessibilityRole="button">
                {loading ? (<ActivityIndicator color="#fff" />) : (
                  <Text style={styles.buttonText}>{t('subscribePremium')}</Text>
                )}
              </TouchableOpacity>
              <Text style={styles.paymentNote}>{t('securePaymentByCinetPay')}</Text>
            </>
          )}
        </View>

        <View style={{ height: Platform.select({ ios: 24, android: 16, default: 16 }) }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAF9' },
  container: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  header: { alignItems: 'center', paddingTop: 20, paddingHorizontal: H_PADDING, paddingBottom: 10 },
  brand: { fontSize: 28, fontWeight: '800', color: '#0A7C3A', textAlign: 'center' },
  slogan: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 4 },
  logoSection: { alignItems: 'center', paddingVertical: 20 },
  logoWrapper: { position: 'relative' },
  logoContainer: { width: 190, height: 190, borderRadius: 95, borderWidth: 4, borderColor: '#0A7C3A', backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 6 },
  logo: { width: 170, height: 170, borderRadius: 85, borderWidth: 3, borderColor: '#ffffff' },
  premiumBadge: { position: 'absolute', top: -8, right: -8, backgroundColor: '#FFD700', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 2, borderColor: '#fff' },
  premiumBadgeText: { fontSize: 12, fontWeight: '700', color: '#8B7000' },
  statusCard: { marginHorizontal: H_PADDING, marginTop: 8, marginBottom: 20, borderRadius: 16, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 8 },
  statusCardFree: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#E8F0E8' },
  statusCardPremium: { overflow: 'hidden' },
  statusTitle: { fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
  statusTitleFree: { color: '#0A7C3A' },
  statusTitlePremium: { color: '#fff' },
  subscriptionInfo: { alignItems: 'center' },
  premiumInfo: { alignItems: 'center' },
  premiumDescription: { fontSize: 16, color: '#E8F0E8', textAlign: 'center', lineHeight: 22, marginBottom: 8 },
  expiryText: { fontSize: 14, color: '#B8D8C0', marginBottom: 16 },
  refreshButton: { backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, minHeight: 36, justifyContent: 'center' },
  refreshButtonText: { color: '#0A7C3A', fontWeight: '600', fontSize: 14 },
  featuresSection: { paddingHorizontal: H_PADDING, marginBottom: 30 },
  sectionTitle: { fontSize: 22, fontWeight: '700', color: '#0F5132', textAlign: 'center', marginBottom: 20 },
  tilesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  tile: { width: TILE_WIDTH, height: TILE_WIDTH, borderRadius: 16, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: GAP, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3, paddingHorizontal: 6, position: 'relative' },
  badgeNotifs: { position: 'absolute', top: -6, right: -6, backgroundColor: '#FF4444', borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700', textAlign: 'center' },
  tileIcon: { fontSize: 36, marginBottom: 8 },
  tileTitle: { fontSize: 12, fontWeight: '600', color: '#0F5132', textAlign: 'center' },
  ctaSection: { paddingHorizontal: H_PADDING, alignItems: 'center' },
  ctaText: { fontSize: 16, color: '#333', textAlign: 'center', marginBottom: 20, lineHeight: 22 },
  button: { backgroundColor: '#0A7C3A', paddingVertical: 16, paddingHorizontal: 40, borderRadius: 12, minWidth: 250, alignItems: 'center', shadowColor: '#0A7C3A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  buttonSecondary: { backgroundColor: '#0F5132' },
  buttonOutline: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#ffffff', shadowColor: 'transparent', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0, elevation: 0 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  buttonSecondaryText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  buttonOutlineText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  paymentNote: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 12, fontStyle: 'italic' },
});