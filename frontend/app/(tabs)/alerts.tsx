import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import { Link } from 'expo-router';

const API = process.env.EXPO_PUBLIC_BACKEND_URL + '/api';

export default function Alerts() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/alerts`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAlerts(); }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.brandBar}><Text style={styles.brand}>Allô Services CI</Text></View>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 16, paddingBottom: 8 }}>
        <Link href="/alerts/new" asChild>
          <TouchableOpacity style={styles.btn}><Text style={styles.btnText}>Nouvelle alerte</Text></TouchableOpacity>
        </Link>
      </View>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc}>{item.description}</Text>
            <Text style={styles.meta}>{item.type} • {item.city || 'N/A'}</Text>
          </View>
        )}
        onRefresh={fetchAlerts}
        refreshing={loading}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  brandBar: { paddingTop: 20, paddingHorizontal: 16, paddingBottom: 8 },
  brand: { fontSize: 20, fontWeight: '800', color: '#0A7C3A' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#F7FAF7', borderRadius: 12, padding: 12, marginTop: 12, borderWidth: 1, borderColor: '#E8F0E8' },
  title: { fontSize: 16, fontWeight: '700', color: '#0A7C3A' },
  desc: { fontSize: 14, color: '#333', marginTop: 6 },
  meta: { fontSize: 12, color: '#666', marginTop: 8 },
  btn: { backgroundColor: '#0F5132', padding: 10, borderRadius: 10 },
  btnText: { color: '#fff', fontWeight: '700' },
});