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
      <View style={styles.brandBar}>
        <Text style={styles.brand}>{t('brand')}</Text>
        <Text style={styles.slogan}>{t('slogan')}</Text>
      </View>

      <View style={styles.contentWrap}>
        <View style={styles.hero}>
          <Image source={APP_ICON} style={styles.icon} />
          <Text style={styles.title}>{t('premiumTitle')}</Text>
        </View>

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
  brandBar: { paddingTop: 4, paddingBottom: 8 },
  brand: { fontSize: 20, fontWeight: '800', color: '#0A7C3A', textAlign: 'center' },
  slogan: { fontSize: 12, color: '#666', marginTop: 2, textAlign: 'center' },
  contentWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
  hero: { alignItems: 'center', marginTop: 8, marginBottom: 16 },
  icon: { width: 160, height: 160, borderRadius: 32, marginBottom: 14 },
  title: { fontSize: 22, fontWeight: '800', color: '#0A7C3A', textAlign: 'center' },
  text: { marginTop: 10, color: '#333', textAlign: 'center' },
  centerBlock: { alignItems: 'center', marginTop: 8 },
  btn: { backgroundColor: '#0F5132', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  btnAlt: { backgroundColor: '#0A7C3A', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  btnWide: { minWidth: 260, alignSelf: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
});