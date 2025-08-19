import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import { useAuth } from '../../src/context/AuthContext';

const API = process.env.EXPO_PUBLIC_BACKEND_URL + '/api';

export default function Pharmacies() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const askPermissionAndFetch = async () => {
    setError(null);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') { setError('Permission localisation refusée'); return; }
    setLoading(true);
    try {
      const loc = await Location.getCurrentPositionAsync({});
      const lat = loc.coords.latitude; const lng = loc.coords.longitude;
      const res = await fetch(`${API}/pharmacies/nearby?lat=${lat}&lng=${lng}&max_km=20`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError('Erreur de récupération');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { askPermissionAndFetch(); }, []);

  return (
    <View style={styles.container}>
      <View style={styles.brandBar}>
        <Text style={styles.brand}>Allô Services CI</Text>
        <Text style={styles.slogan}>Tous les services essentiels en un clic</Text>
        {!!user?.first_name && <Text style={styles.greeting}>{`Bonjour M. ${user.first_name}`}</Text>}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
      {loading && <ActivityIndicator />}
      {data.map((p) => (
        <View key={p.id} style={styles.card}>
          <Text style={styles.title}>{p.name}</Text>
          <Text style={styles.meta}>{p.address} • {p.city}</Text>
          <Text style={styles.meta}>{p.phone}</Text>
        </View>
      ))}
      <TouchableOpacity onPress={askPermissionAndFetch} style={styles.btn}><Text style={styles.btnText}>Actualiser</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  brandBar: { paddingTop: 4, paddingBottom: 8 },
  brand: { fontSize: 20, fontWeight: '800', color: '#0A7C3A' },
  slogan: { fontSize: 12, color: '#666', marginTop: 2 },
  greeting: { fontSize: 12, color: '#0F5132', marginTop: 4, fontWeight: '700' },
  error: { color: '#B00020', marginBottom: 8 },
  card: { backgroundColor: '#F7FAF7', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E8F0E8' },
  title: { fontSize: 16, fontWeight: '700', color: '#0A7C3A' },
  meta: { fontSize: 13, color: '#555', marginTop: 4 },
  btn: { backgroundColor: '#0A7C3A', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '700' },
});