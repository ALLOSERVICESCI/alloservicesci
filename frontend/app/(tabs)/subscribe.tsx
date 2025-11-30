import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, ScrollView, Dimensions, Platform, Modal } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { apiFetch } from '../../src/utils/api';
import { useI18n } from '../../src/i18n/i18n';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const H_PADDING = 20;
const GAP = 16;
const COLS = 2;
const TILE_WIDTH = (width - (H_PADDING * 2) - (GAP * (COLS - 1))) / COLS;

export default function Subscribe() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showWebView, setShowWebView] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [pollingStatus, setPollingStatus] = useState(false);
  const router = useRouter();
  const { t } = useI18n();
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Nettoyer le polling à la sortie
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const startPayment = async () => {
    if (!user?.id) {
      Alert.alert(t('permission'), t('loginRequired'));
      router.push('/auth/register');
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch('/api/payments/cinetpay/initiate', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, amount_fcfa: 1200 })
      });
      const json: any = await res.json().catch(() => ({}));
      
      if (res.ok && json.payment_url && json.transaction_id) {
        setPaymentUrl(json.payment_url);
        setTransactionId(json.transaction_id);
        setShowWebView(true);
        // Démarrer le polling du statut
        startPolling(json.transaction_id);
      } else {
        Alert.alert(t('error'), json?.detail ? String(json.detail) : `Erreur HTTP ${res.status}`);
      }
    } catch (e: any) {
      Alert.alert(t('error'), e?.message || t('network'));
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (txId: string) => {
    // Vérifier le statut toutes les 3 secondes
    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await apiFetch(`/api/payments/status/${txId}`);
        const json: any = await res.json().catch(() => ({}));
        
        if (json.status === 'SUCCESS' && json.premium_activated) {
          // Paiement réussi !
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
          setShowWebView(false);
          await refreshUser();
          Alert.alert(
            t('success'),
            t('premiumActiveDescription'),
            [{ text: t('ok'), onPress: () => router.back() }]
          );
        } else if (json.status === 'FAILED') {
          // Paiement échoué
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
          setShowWebView(false);
          Alert.alert(t('error'), 'Le paiement a échoué. Veuillez réessayer.');
        }
      } catch (e) {
        console.error('Polling error:', e);
      }
    }, 3000);
  };

  const closeWebView = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    setShowWebView(false);
    setPaymentUrl('');
    setTransactionId('');
  };

  const handleWebViewNavigationStateChange = (navState: any) => {
    const { url } = navState;
    
    // Détecter si l'utilisateur revient après paiement
    if (url.includes('/api/payments/cinetpay/return')) {
      // Le webhook devrait avoir été appelé
      // On continue le polling qui détectera le changement de statut
      console.log('Return URL detected, continuing polling...');
    }
  };

  const goRegister = () => router.push('/auth/register');

  const premiumFeatures = [
    { key: 'sante', icon: '🏥', title: t('sante'), description: 'Établissements de santé', slug: 'sante' },
    { key: 'pharmacies', icon: '💊', title: t('tabPharm'), description: 'Pharmacies de garde', slug: 'pharmacies' },
    { key: 'exams', icon: '📚', title: t('examens'), description: t('premiumFeature_exams'), slug: 'examens_concours' },
    { key: 'education', icon: '🎓', title: t('education'), description: t('premiumFeature_education'), slug: 'education' },
    { key: 'jobs', icon: '💼', title: t('emplois'), description: t('premiumFeature_jobs'), slug: 'emplois' },
    { key: 'services', icon: '🏛️', title: t('services_publics'), description: t('premiumFeature_services'), slug: 'services_publics' },
    { key: 'utilities', icon: '⚡', title: t('services_utiles'), description: t('premiumFeature_utilities'), slug: 'services_utiles' },
    { key: 'agriculture', icon: '🌾', title: t('agriculture'), description: t('premiumFeature_agriculture'), slug: 'agriculture' },
    { key: 'leisure', icon: '🏖️', title: t('loisirs_tourisme'), description: t('premiumFeature_leisure'), slug: 'loisirs_tourisme' },
    { key: 'transport', icon: '🚌', title: t('transport'), description: t('premiumFeature_transport'), slug: 'transport' },
  ];

  const isPremium = (user as any)?.is_premium;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Header avec bouton retour */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.backButton}
            accessibilityRole="button"
          >
            <Ionicons name="chevron-back" size={24} color="#0A7C3A" />
            <Text style={styles.backButtonText}>{t('back')}</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <LinearGradient colors={['#0A7C3A', '#0D9447']} style={styles.heroSection}>
          <Text style={styles.heroTitle}>{t('becomePremium')}</Text>
          <Text style={styles.heroSubtitle}>{t('premiumCallToAction')}</Text>
          
          {isPremium ? (
            <View style={styles.premiumBadge}>
              <Ionicons name="checkmark-circle" size={24} color="#FFF" />
              <Text style={styles.premiumBadgeText}>{t('premiumActive')}</Text>
            </View>
          ) : (
            <View style={styles.priceBox}>
              <Text style={styles.priceAmount}>1200 FCFA</Text>
              <Text style={styles.pricePeriod}>/ {t('year', 'an')}</Text>
            </View>
          )}
        </LinearGradient>

        {/* Features Grid */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>{t('premiumFeatures')}</Text>
          <View style={styles.featuresGrid}>
            {premiumFeatures.map((feature) => (
              <View key={feature.key} style={styles.featureTile}>
                <Text style={styles.featureIcon}>{feature.icon}</Text>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                {feature.description ? (
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                ) : null}
              </View>
            ))}
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.paymentMethodsSection}>
          <Text style={styles.sectionTitle}>Méthodes de paiement</Text>
          <View style={styles.paymentMethods}>
            <View style={styles.paymentMethod}>
              <Text style={styles.paymentMethodText}>🟠 Orange Money</Text>
            </View>
            <View style={styles.paymentMethod}>
              <Text style={styles.paymentMethodText}>🟡 MTN Mobile Money</Text>
            </View>
            <View style={styles.paymentMethod}>
              <Text style={styles.paymentMethodText}>🔵 Moov Money</Text>
            </View>
            <View style={styles.paymentMethod}>
              <Text style={styles.paymentMethodText}>💳 Carte Bancaire</Text>
            </View>
            <View style={styles.paymentMethod}>
              <Text style={styles.paymentMethodText}>🌊 Wave</Text>
            </View>
          </View>
        </View>

        {/* CTA Button */}
        {!isPremium && user?.id && (
          <TouchableOpacity 
            style={[styles.subscribeButton, loading && styles.subscribeButtonDisabled]} 
            onPress={startPayment}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.subscribeButtonText}>{t('subscribePremium')}</Text>
            )}
          </TouchableOpacity>
        )}

        {!isPremium && !user?.id && (
          <TouchableOpacity style={styles.subscribeButton} onPress={goRegister}>
            <Text style={styles.subscribeButtonText}>{t('createAccount')}</Text>
          </TouchableOpacity>
        )}

        {/* Secure Payment Badge */}
        <View style={styles.secureBadge}>
          <Ionicons name="shield-checkmark" size={16} color="#0A7C3A" />
          <Text style={styles.secureBadgeText}>{t('securePaymentByCinetPay')}</Text>
        </View>
      </ScrollView>

      {/* WebView Modal pour CinetPay */}
      <Modal
        visible={showWebView}
        animationType="slide"
        onRequestClose={closeWebView}
      >
        <SafeAreaView style={styles.webViewContainer} edges={['top']}>
          <View style={styles.webViewHeader}>
            <TouchableOpacity onPress={closeWebView} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#0A7C3A" />
            </TouchableOpacity>
            <Text style={styles.webViewTitle}>Paiement Sécurisé</Text>
            <View style={{ width: 28 }} />
          </View>
          
          {paymentUrl ? (
            <WebView
              source={{ uri: paymentUrl }}
              style={styles.webView}
              onNavigationStateChange={handleWebViewNavigationStateChange}
              startInLoadingState
              renderLoading={() => (
                <View style={styles.webViewLoading}>
                  <ActivityIndicator size="large" color="#0A7C3A" />
                  <Text style={styles.webViewLoadingText}>{t('loading')}</Text>
                </View>
              )}
            />
          ) : (
            <View style={styles.webViewLoading}>
              <ActivityIndicator size="large" color="#0A7C3A" />
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },
  container: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  backButtonText: {
    fontSize: 16,
    color: '#0A7C3A',
    fontWeight: '600',
  },
  
  heroSection: {
    padding: 24,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 16,
    alignItems: 'center',
  },
  
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  
  heroSubtitle: {
    fontSize: 14,
    color: '#FFF',
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 20,
  },
  
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  
  premiumBadgeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  
  priceBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  
  priceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
  },
  
  pricePeriod: {
    fontSize: 16,
    color: '#FFF',
    opacity: 0.9,
    marginLeft: 4,
  },
  
  featuresSection: {
    padding: 16,
    marginTop: 16,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
  
  featureTile: {
    width: TILE_WIDTH,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  featureIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  
  featureDescription: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  
  paymentMethodsSection: {
    padding: 16,
    marginTop: 8,
  },
  
  paymentMethods: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  
  paymentMethod: {
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  
  paymentMethodText: {
    fontSize: 12,
    color: '#333',
  },
  
  subscribeButton: {
    backgroundColor: '#0A7C3A',
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  
  subscribeButtonDisabled: {
    opacity: 0.6,
  },
  
  subscribeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  
  secureBadgeText: {
    fontSize: 12,
    color: '#666',
  },
  
  // WebView Modal Styles
  webViewContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  
  webViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  
  closeButton: {
    padding: 4,
  },
  
  webViewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  
  webView: {
    flex: 1,
  },
  
  webViewLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  
  webViewLoadingText: {
    fontSize: 14,
    color: '#666',
  },
});
