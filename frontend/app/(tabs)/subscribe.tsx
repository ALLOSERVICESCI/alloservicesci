import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
const API = process.env.EXPO_PUBLIC_BACKEND_URL + '/api';

export default function Subscribe() {
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const userId = null; // brancher après auth

  const startPayment = async () => {
    if (!userId) { alert('Connectez-vous d\'abord'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/payments/cinetpay/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, amount_fcfa: 1200 })
      });
      const json = await res.json();
      if (res.ok) {
        setTransactionId(json.transaction_id);
        setUrl(json.payment_url);
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
      <Text style={styles.title}>Premium 1200 FCFA / an</Text>
      <Text style={styles.text}>Accédez aux services Santé, Éducation, Examens & Concours, Services publics, Emplois, Agriculture, Loisirs & Tourisme, Transport.</Text>
      {loading && <ActivityIndicator />}
      {!url ? (
        <TouchableOpacity onPress={startPayment} style={styles.btn}><Text style={styles.btnText}>Payer avec CinetPay</Text></TouchableOpacity>
      ) : (
        <Text style={styles.text}>Lien de paiement prêt. Intégration WebView à venir.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 20, fontWeight: '800', color: '#0A7C3A' },
  text: { marginTop: 10, color: '#333' },
  btn: { backgroundColor: '#0F5132', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 16 },
  btnText: { color: '#fff', fontWeight: '700' },
});