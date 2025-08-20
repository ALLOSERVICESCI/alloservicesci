import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ActivityIndicator, Alert, AppState, AppStateStatus } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { apiFetch } from '../../src/utils/api';
import { useI18n, Lang } from '../../src/i18n/i18n';

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

  const PremiumAction = () => (
    <>
      {!premium?.is_premium && (
        <View style={styles.expiredBanner}>
          <Text style={styles.expiredText}>{t('inactive')}</Text>
          <TouchableOpacity onPress={startPayment} style={styles.expiredCta}><Text style={styles.expiredCtaText}>{t('renewPremium')}</Text></TouchableOpacity>
        </View>
      )}
      <TouchableOpacity style={[styles.btn, styles.btnWide, { marginTop: 12 }]} onPress={startPayment} disabled={payLoading}>
        {payLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>{premium?.is_premium ? t('renewPremium') : t('becomePremium')}</Text>
        )}
      </TouchableOpacity>
      {premium?.is_premium && premium?.expires_at ? (
        <Text style={[styles.expireText, styles.centerText]}>{`${t('activeUntil')} ${new Date(premium.expires_at).toLocaleDateString()}`}</Text>
      ) : null}
      <TouchableOpacity onPress={loadPremium} style={styles.linkBtn}>
        <Text style={styles.linkBtnText}>{t('refreshStatus')}</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerCenter}>
        <Text style={styles.brand}>{t('brand')}</Text>
        <Text style={styles.slogan}>{t('slogan')}</Text>
        {premium?.is_premium ? (
          <View style={styles.badge}><Text style={styles.badgeText}>{t('premiumActiveBadge')}</Text></View>
        ) : null}
      </View>

      <View style={styles.langRow}>
        <LangButton code="fr" label="FR" />
        <LangButton code="en" label="EN" />
        <LangButton code="es" label="ES" />
        <LangButton code="it" label="IT" />
        <LangButton code="ar" label="AR" />
      </View>

      {!user ? (
        <View style={styles.centerBlock}>
          <Text style={[styles.text, styles.centerText]}>{t('needAccount')}</Text>
          <TouchableOpacity style={[styles.btn, styles.btnWide, { marginTop: 12 }]} onPress={goRegister}><Text style={styles.btnText}>{t('createAccount')}</Text></TouchableOpacity>
        </View>
      ) : (
        <View style={styles.centerBlock}>
          <Text style={[styles.info, styles.centerText]}>{t('hello')} {user.first_name} {user.last_name}</Text>
          <Text style={[styles.info, styles.centerText]}>{t('phone')}: {user.phone}</Text>
          {!!user.city && <Text style={[styles.info, styles.centerText]}>{t('city')}: {user.city}</Text>}
          {premium && (
            <Text style={[styles.info, styles.centerText]}>{t('premium')}: {premium.is_premium ? `${t('activeUntil')} ${premium.expires_at ? new Date(premium.expires_at).toLocaleDateString() : ''}` : t('inactive')}</Text>
          )}

          <TouchableOpacity style={[styles.btn, styles.btnWide, { marginTop: 12 }]} onPress={goEdit}>
            <Text style={styles.btnText}>{t('editProfile')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btnAlt, styles.btnWide, { marginTop: 10 }]} onPress={goNotifCenter}>
            <Text style={styles.btnText}>{t('notifCenter')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btnAlt, styles.btnWide, { marginTop: 10 }]} onPress={goPaymentHistory}>
            <Text style={styles.btnText}>{t('paymentHistory')}</Text>
          </TouchableOpacity>
          <PremiumAction />
          <TouchableOpacity style={[styles.btn, styles.btnWide, { backgroundColor: '#B00020', marginTop: 12 }]} onPress={logout}>
            <Text style={styles.btnText}>{t('logout')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16, alignItems: 'center' },
  headerCenter: { alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  brand: { fontSize: 20, fontWeight: '800', color: '#0A7C3A', textAlign: 'center' },
  slogan: { fontSize: 12, color: '#666', marginTop: 2, textAlign: 'center' },
  text: { marginTop: 10, color: '#333' },
  btn: { backgroundColor: '#0F5132', padding: 12, borderRadius: 10, alignItems: 'center' },
  btnAlt: { backgroundColor: '#0A7C3A', padding: 12, borderRadius: 10, alignItems: 'center' },
  btnWide: { minWidth: 260, alignSelf: 'center' },
  linkBtn: { paddingVertical: 8, alignItems: 'center' },
  linkBtnText: { color: '#0A7C3A', fontWeight: '700' },
  btnText: { color: '#fff', fontWeight: '700' },
  info: { marginTop: 8, color: '#333' },
  expireText: { marginTop: 6, color: '#0F5132', fontWeight: '600' },
  centerBlock: { alignItems: 'center', marginTop: 12, width: '100%' },
  centerText: { textAlign: 'center' },
  langRow: { flexDirection: 'row', marginTop: 12, justifyContent: 'center' },
  langBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E8F0E8', marginRight: 8 },
  langBtnActive: { backgroundColor: '#0A7C3A', borderColor: '#0A7C3A' },
  langText: { color: '#0A7C3A', fontWeight: '700' },
  langTextActive: { color: '#fff' },
  badge: { backgroundColor: '#0A7C3A', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, marginTop: 8 },
  badgeText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  expiredBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFF4CC', borderColor: '#9A6700', borderWidth: 1, padding: 10, borderRadius: 10, marginTop: 10, width: '90%' },
  expiredText: { color: '#9A6700', fontWeight: '700' },
  expiredCta: { backgroundColor: '#9A6700', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  expiredCtaText: { color: '#fff', fontWeight: '700' },
});