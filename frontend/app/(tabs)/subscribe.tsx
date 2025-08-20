import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { apiFetch } from '../../src/utils/api';
import { useI18n } from '../../src/i18n/i18n';

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
      <Text style={styles.title}>{t('premiumTitle')}</Text>
      {!user?.id && (
        <View style={{ marginTop: 8 }}>
          <Text style={styles.text}>{t('needAccount')}</Text>
          <TouchableOpacity onPress={goRegister} style={styles.btnAlt}><Text style={styles.btnText}>{t('createAccount')}</Text></TouchableOpacity>
        </View>
      )}
      {loading ? <ActivityIndicator /> : (
        <TouchableOpacity onPress={startPayment} style={styles.btn}><Text style={styles.btnText}>{t('payWithCinetPay')}</Text></TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  brandBar: { paddingTop: 4, paddingBottom: 8 },
  brand: { fontSize: 20, fontWeight: '800', color: '#0A7C3A' },
  slogan: { fontSize: 12, color: '#666', marginTop: 2 },
  title: { fontSize: 20, fontWeight: '800', color: '#0A7C3A' },
  text: { marginTop: 10, color: '#333' },
  btn: { backgroundColor: '#0F5132', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 16 },
  btnAlt: { backgroundColor: '#0A7C3A', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '700' },
});