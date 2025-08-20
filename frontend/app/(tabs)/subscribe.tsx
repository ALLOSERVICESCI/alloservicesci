import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Linking, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { apiFetch } from '../../src/utils/api';
import { useI18n } from '../../src/i18n/i18n';

const APP_ICON = require('../../assets/icons/icons/icon.png');

export default function Subscribe() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
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
        Linking.openURL((json as any).payment_url);
      } else {
        Alert.alert('Paiement', ((json as any).detail || `Erreur HTTP ${res.status}`));
      }
    } catch (e: any) {
      Alert.alert(t('network'), e?.message || 'Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  const goRegister = () => router.push('/auth/register');

  return (
    <View style={styles.container}>
      <View style={styles.contentWrap}>
        <View style={styles.hero}>
          <Text style={styles.brandBig}>{t('brand')}</Text>
          <View style={styles.logoWrap}>
            <Image source={APP_ICON} style={styles.icon} />
          </View>
          <Text style={styles.sloganBelow}>{t('slogan')}</Text>
        </View>

        <View style={styles.separator} />

        <Text style={styles.title}>{t('premiumTitle')}</Text>

        {!user?.id && (
          <View style={styles.centerBlock}>
            <Text style={styles.text}>{t('needAccount')}</Text>
            <TouchableOpacity onPress={goRegister} style={[styles.btnAlt, styles.btnWide]}>
              <Text style={styles.btnText}>{t('createAccount')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading ? (
          <ActivityIndicator />
        ) : (
          <TouchableOpacity onPress={startPayment} style={[styles.btn, styles.btnWide]}>
            <Text style={styles.btnText}>{t('payWithCinetPay')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  contentWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
  hero: { alignItems: 'center', marginBottom: 10 },
  brandBig: { fontSize: 24, fontWeight: '800', color: '#0A7C3A', textAlign: 'center' },
  logoWrap: { width: 200, height: 200, borderRadius: 100, backgroundColor: '#fff', borderWidth: 2, borderColor: '#0A7C3A', alignItems: 'center', justifyContent: 'center', marginVertical: 6, shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, elevation: 4 },
  icon: { width: 180, height: 180, borderRadius: 90 },
  sloganBelow: { fontSize: 18, lineHeight: 22, color: '#666', textAlign: 'center' },
  separator: { height: 1, backgroundColor: '#E8F0E8', width: '80%', marginTop: 12, marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '800', color: '#0A7C3A', textAlign: 'center', marginTop: 0 },
  text: { marginTop: 8, color: '#333', textAlign: 'center' },
  centerBlock: { alignItems: 'center', marginTop: 6 },
  btn: { backgroundColor: '#0F5132', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  btnAlt: { backgroundColor: '#0A7C3A', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  btnWide: { minWidth: 260, alignSelf: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
});