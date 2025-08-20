import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ActivityIndicator, Alert, AppState, AppStateStatus, ScrollView, Dimensions, Image } from 'react-native';
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
        Linking.openURL((json as any).payment_url);
      } else {
        Alert.alert('Paiement', ((json as any).detail || `Erreur HTTP ${res.status}`));
      }
    } catch (e: any) {
      Alert.alert(t('network'), e?.message || 'Erreur réseau');
    } finally {
      setPayLoading(false);
    }
  };

  const LangButton = ({ code, label }: { code: Lang; label: string }) => (
    <TouchableOpacity onPress={() => setLang(code)} style={[styles.langBtn, lang === code && styles.langBtnActive]}>
      <Text style={[styles.langText, lang === code && styles.langTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  const profileActions = [
    { key: 'edit', title: t('editProfile'), icon: '✏️', onPress: goEdit, color: '#0A7C3A' },
    { key: 'notifications', title: t('notifCenter'), icon: '🔔', onPress: goNotifCenter, color: '#0A7C3A' },
    { key: 'payments', title: t('paymentHistory'), icon: '💳', onPress: goPaymentHistory, color: '#0A7C3A' },
  ];

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
          <Image source={APP_ICON} style={styles.avatar} />
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
          <Text style={styles.cardDescription}>{t('needAccount')}</Text>
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
              {user.city && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailIcon}>📍</Text>
                  <Text style={styles.detailText}>{user.city}</Text>
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

          {/* Language Selection Card */}
          <View style={styles.languageCard}>
            <Text style={styles.sectionTitle}>{t('language')}</Text>
            <View style={styles.languageGrid}>
              <LangButton code="fr" label="Français" />
              <LangButton code="en" label="English" />
              <LangButton code="es" label="Español" />
              <LangButton code="it" label="Italiano" />
              <LangButton code="ar" label="العربية" />
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
              <Text style={styles.refreshButtonText}>{t('refreshStatus')}</Text>
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
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  brand: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0A7C3A',
    textAlign: 'center',
  },
  slogan: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: -30,
    marginBottom: 20,
  },
  logoContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  premiumBadge: {
    position: 'absolute',
    bottom: -5,
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
  },
  premiumBadgeText: {
    color: '#0A7C3A',
    fontWeight: '800',
    fontSize: 12,
  },
  userCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  cardDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  userDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  detailText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  languageCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  langBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E8F0E8',
    backgroundColor: '#f8f9fa',
    minWidth: 80,
    alignItems: 'center',
  },
  langBtnActive: {
    backgroundColor: '#0A7C3A',
    borderColor: '#0A7C3A',
  },
  langText: {
    color: '#0A7C3A',
    fontWeight: '600',
    fontSize: 14,
  },
  langTextActive: {
    color: '#fff',
  },
  actionsSection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 15,
  },
  actionCard: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    minWidth: (width - 80) / 3,
    maxWidth: (width - 80) / 3,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  premiumSection: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  premiumSectionActive: {
    backgroundColor: '#E8F5E8',
    borderWidth: 2,
    borderColor: '#0A7C3A',
  },
  premiumSectionInactive: {
    backgroundColor: '#FFF4E6',
    borderWidth: 2,
    borderColor: '#FF8C00',
  },
  premiumTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  premiumTitleActive: {
    color: '#0A7C3A',
  },
  premiumTitleInactive: {
    color: '#FF8C00',
  },
  premiumDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  expiryText: {
    fontSize: 14,
    color: '#0A7C3A',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },
  premiumButton: {
    backgroundColor: '#0A7C3A',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 12,
  },
  premiumButtonRenew: {
    backgroundColor: '#FF8C00',
  },
  premiumButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  refreshButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  refreshButtonText: {
    color: '#0A7C3A',
    fontWeight: '600',
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: '#0A7C3A',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  logoutSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});