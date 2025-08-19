import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';

const API = process.env.EXPO_PUBLIC_BACKEND_URL + '/api';

export default function Subscribe() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const startPayment = async () => {
    if (!user?.id) { alert('Connectez-vous d\'abord'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/payments/cinetpay/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, amount_fcfa: 1200 })
      });
      const json = await res.json();
      if (res.ok && json.payment_url) {
        Linking.openURL(json.payment_url);
      } else {
        alert(json.detail || 'Erreur paiement');
      }
    } catch (e) {
      alert('Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.brandBar}><Text style={styles.brand}>Allô Services CI</Text></View>
      <Text style={styles.title}>Premium 1200 FCFA / an</Text>
      {!user?.id && <Text style={styles.text}>Veuillez créer un compte (Profil) pour activer le paiement.</Text>}
      {loading ? <ActivityIndicator /> : (
        <TouchableOpacity onPress={startPayment} style={styles.btn}><Text style={styles.btnText}>Payer avec CinetPay</Text></TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  brandBar: { paddingTop: 4, paddingBottom: 8 },
  brand: { fontSize: 20, fontWeight: '800', color: '#0A7C3A' },
  title: { fontSize: 20, fontWeight: '800', color: '#0A7C3A' },
  text: { marginTop: 10, color: '#333' },
  btn: { backgroundColor: '#0F5132', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 16 },
  btnText: { color: '#fff', fontWeight: '700' },
});