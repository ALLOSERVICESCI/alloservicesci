import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';

const API = process.env.EXPO_PUBLIC_BACKEND_URL + '/api';

export default function Profile() {
  const { user, logout } = useAuth();
  const [premium, setPremium] = useState<{ is_premium: boolean; expires_at?: string } | null>(null);

  const loadPremium = async () => {
    try {
      if (!user?.id) { setPremium(null); return; }
      const res = await fetch(`${API}/subscriptions/check?user_id=${user.id}`);
      const json = await res.json();
      setPremium(json);
    } catch (e) { setPremium(null); }
  };

  useEffect(() => { loadPremium(); }, [user?.id]);

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>Allô Services CI</Text>
      <Text style={styles.slogan}>Tous les services essentiels en un clic</Text>
      {!user ? (
        <View style={{ marginTop: 16 }}>
          <Text style={styles.text}>Créez un compte pour accéder au Premium.</Text>
          <Link href="/auth/register" asChild>
            <TouchableOpacity style={styles.btn}><Text style={styles.btnText}>Créer un compte</Text></TouchableOpacity>
          </Link>
        </View>
      ) : (
        <View style={{ marginTop: 16 }}>
          <Text style={styles.info}>Bonjour Mr {user.first_name} {user.last_name}</Text>
          <Text style={styles.info}>Téléphone: {user.phone}</Text>
          {premium && (
            <Text style={styles.info}>Premium: {premium.is_premium ? `Actif jusqu'au ${premium.expires_at ? new Date(premium.expires_at).toLocaleDateString() : ''}` : 'Inactif'}</Text>
          )}
          <TouchableOpacity style={[styles.btn, { backgroundColor: '#B00020' }]} onPress={logout}>
            <Text style={styles.btnText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  brand: { fontSize: 20, fontWeight: '800', color: '#0A7C3A' },
  slogan: { fontSize: 12, color: '#666', marginTop: 2 },
  text: { marginTop: 10, color: '#333' },
  btn: { backgroundColor: '#0F5132', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 16 },
  btnText: { color: '#fff', fontWeight: '700' },
  info: { marginTop: 8, color: '#333' },
});