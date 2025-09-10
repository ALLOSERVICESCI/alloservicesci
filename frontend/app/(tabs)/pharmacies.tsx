import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import * as Location from 'expo-location';
import { apiFetch } from '../../src/utils/api';
import { useI18n } from '../../src/i18n/i18n';
import NavMenu from '../../src/components/NavMenu';

export default function Pharmacies() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useI18n();

  const askPermissionAndFetch = async () => {
    setError(null);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') { setError(t('locationDenied')); return; }
    setLoading(true);
    try {
      const loc = await Location.getCurrentPositionAsync({});
      const lat = loc.coords.latitude; const lng = loc.coords.longitude;
      const res = await apiFetch(`/api/pharmacies/nearby?lat=${lat}&lng=${lng}&max_km=5`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setError(t('fetchError'));
      Alert.alert(t('error'), t('fetchError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { askPermissionAndFetch(); }, []);

  return (
    <View style={styles.container}>
      <View style={styles.brandBar}><Text style={styles.brand}>{t('brand')}</Text></View>
      {error && <Text style={styles.error}>{error}</Text>}
      {loading && <ActivityIndicator />}
      {data.map((p) => (
        <View key={p.id} style={styles.card}>
          <Text style={styles.title}>{p.name}</Text>
          <Text style={styles.meta}>{p.address} • {p.city}</Text>
          <Text style={styles.meta}>{p.phone}</Text>
        </View>
      ))}
      <TouchableOpacity onPress={askPermissionAndFetch} style={styles.btn}><Text style={styles.btnText}>{t('refresh')}</Text></TouchableOpacity>
      <NavMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  brandBar: { paddingTop: 4, paddingBottom: 8 },
  brand: { fontSize: 20, fontWeight: '800', color: '#0A7C3A' },
  error: { color: '#B00020', marginBottom: 8 },
  card: { backgroundColor: '#F7FAF7', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E8F0E8' },
  title: { fontSize: 16, fontWeight: '700', color: '#0A7C3A' },
  meta: { fontSize: 13, color: '#555', marginTop: 4 },
  btn: { backgroundColor: '#0A7C3A', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '700' },
});