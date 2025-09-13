import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ActivityIndicator, Alert, AppState, AppStateStatus, ScrollView, Dimensions, Image, Platform } from 'react-native';
import { Animated } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { apiFetch } from '../../src/utils/api';
import { useI18n, Lang } from '../../src/i18n/i18n';

const APP_ICON = require('../../assets/icons/icons/icon.png');
const { width } = Dimensions.get('window');

export default function Profile() {
  const { user, logout } = useAuth();
  const [premium, setPremium] = useState<{ is_premium: boolean; expires_at?: string } | null>(null);
  const [payLoading, setPayLoading] = useState(false);
  const [payInProgress, setPayInProgress] = useState(false);
  const router = useRouter();
  const { t, lang, setLang } = useI18n();
  const appState = useRef<AppStateStatus>(AppState.currentState);

  const loadPremium = async () => {
    try {
      if (!user?.id) { setPremium(null); return; }
      const res = await apiFetch(`/api/subscriptions/check?user_id=${user.id}`);
      const json = await res.json();
      setPremium(json);
    } catch (e) { setPremium(null); }
  };

  useEffect(() => { loadPremium(); }, [user?.id]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (appState.current.match(/inactive|background/) && next === 'active' && payInProgress) {
        setPayInProgress(false);
        Alert.alert('Paiement', t('paymentReturnPrompt'), [
          { text: t('refreshStatus'), onPress: loadPremium },
          { text: 'OK' }
        ]);
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, [payInProgress, t]);

  const goRegister = () => router.push('/auth/register');
  const goEdit = () => router.push('/profile/edit');
  const goNotifCenter = () => router.push('/notifications');
  const goPaymentHistory = () => router.push('/payments/history');

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
    if (!user?.id) { router.push('/auth/register'); return; }
    setPayLoading(true);
    try {
      const res = await apiFetch('/api/payments/cinetpay/initiate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, amount_fcfa: 1200 })
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && (json as any).payment_url) {
        setPayInProgress(true);
        await openExternal((json as any).payment_url);
      } else {
        Alert.alert('Paiement', ((json as any).detail || `Erreur HTTP ${res.status}`));
      }
    } catch (e: any) {
      Alert.alert(t('network'), e?.message || 'Erreur réseau');
    } finally {
      setPayLoading(false);
    }
  };


  const profileActions = [
    { key: 'edit', title: t('editProfile'), icon: '✏️', onPress: goEdit, color: '#0A7C3A' },
    { key: 'notifications', title: t('notifCenter'), icon: '🔔', onPress: goNotifCenter, color: '#0A7C3A' },
    { key: 'payments', title: t('paymentHistory'), icon: '💳', onPress: goPaymentHistory, color: '#0A7C3A' },
  ] as any[];

  const avatarSource = (user as any)?.avatar ? { uri: `data:image/jpeg;base64,${(user as any).avatar}` } : APP_ICON;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.brand}>{t('brand')}</Text>
        <Text style={styles.slogan}>{t('slogan')}</Text>
      </View>

      {/* User Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.logoContainer}>
          <Image source={avatarSource} style={styles.avatar} />
          {premium?.is_premium && (
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumBadgeText}>✨ {t('premium')}</Text>
            </View>
          )}
        </View>
      </View>

      {!user ? (
        /* No User Card */
        <View style={styles.userCard}>
          <Text style={styles.cardTitle}>{t('welcome')}</Text>
          <TouchableOpacity onPress={goRegister} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>{t('createAccount')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* User Info Card */}
          <View style={styles.userCard}>
            <Text style={styles.cardTitle}>
              {t('hello')} {user.first_name} {user.last_name}
            </Text>
            <View style={styles.userDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailIcon}>📱</Text>
                <Text style={styles.detailText}>{user.phone}</Text>
              </View>
              {(user as any).email && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailIcon}>✉️</Text>
                  <Text style={styles.detailText}>{(user as any).email}</Text>
                </View>
              )}
              {(user as any).city && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailIcon}>📍</Text>
                  <Text style={styles.detailText}>{(user as any).city}</Text>
                </View>
              )}
              <View style={styles.detailRow}>
                <Text style={styles.detailIcon}>{premium?.is_premium ? '👑' : '⭐'}</Text>
                <Text style={styles.detailText}>
                  {premium?.is_premium 
                    ? `${t('premium')} - ${t('activeUntil')} ${premium.expires_at ? new Date(premium.expires_at).toLocaleDateString('fr-FR') : ''}`
                    : t('inactive')
                  }
                </Text>
              </View>
            </View>
          </View>

          {/* Actions Grid */}
          <View style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>{t('actions')}</Text>
            <View style={styles.actionsGrid}>
              {profileActions.map((action) => (
                <TouchableOpacity 
                  key={action.key} 
                  style={styles.actionCard}
                  onPress={action.onPress}
                >
                  <Text style={styles.actionIcon}>{action.icon}</Text>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Premium Section */}
          <View style={[styles.premiumSection, premium?.is_premium ? styles.premiumSectionActive : styles.premiumSectionInactive]}>
            <Text style={[styles.premiumTitle, premium?.is_premium ? styles.premiumTitleActive : styles.premiumTitleInactive]}>
              {premium?.is_premium ? t('premiumActive') : t('becomePremium')}
            </Text>
            
            {!premium?.is_premium && (
              <Text style={styles.premiumDescription}>
                {t('premiumCallToAction')}
              </Text>
            )}

            {premium?.expires_at && (
              <Text style={styles.expiryText}>
                {t('expiresOn')} {new Date(premium.expires_at).toLocaleDateString('fr-FR')}
              </Text>
            )}

            <TouchableOpacity 
              onPress={startPayment} 
              style={[styles.premiumButton, premium?.is_premium && styles.premiumButtonRenew]}
              disabled={payLoading}
            >
              {payLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.premiumButtonText}>
                  {premium?.is_premium ? t('renewPremium') : t('subscribePremium')}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={loadPremium} style={styles.refreshButton}>
              <Text style={styles.premiumDescription}>
                {t('refreshStatus')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Logout Section */}
          <View style={styles.logoutSection}>
            <TouchableOpacity onPress={logout} style={styles.logoutButton}>
              <Text style={styles.logoutButtonText}>{t('logout')}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

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
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  brand: {
    fontSize: 32,
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
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 20,
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
    position: 'relative',
  },
  avatar: {
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
  userCard: {
    margin: 20,
    borderRadius: 16,
    padding: 24,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E8F0E8',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F5132',
    textAlign: 'center',
    marginBottom: 16,
  },
  cardDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  userDetails: {
    marginTop: 8,
    alignItems: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 24,
  },
  detailText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F5132',
    marginBottom: 16,
    textAlign: 'center',
  },
  actionsSection: {
    margin: 20,
    marginTop: 10,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: (width - 60) / 3,
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
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    color: '#0F5132',
  },
  premiumSection: {
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 12,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  premiumSectionActive: {
    backgroundColor: '#0A7C3A',
  },
  premiumSectionInactive: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E8F0E8',
  },
  premiumTitle: {
    fontSize: 20,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 12,
  },
  premiumTitleActive: {
    color: '#fff',
  },
  premiumTitleInactive: {
    color: '#0A7C3A',
  },
  premiumDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  expiryText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  premiumButton: {
    backgroundColor: '#0F5132',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  premiumButtonRenew: {
    backgroundColor: '#fff',
  },
  premiumButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  refreshButton: {
    alignItems: 'center',
    paddingVertical: 8,
    marginVertical: 16,
  },
  refreshButtonText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  refreshTextOnGreen: {
    color: '#666',
  },
  refreshTextOnLight: {
    color: '#0A7C3A',
  },
  logoutSection: {
    margin: 20,
    marginTop: 10,
  },
  logoutButton: {
    backgroundColor: '#DC3545',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: '#0A7C3A',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});