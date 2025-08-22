import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, FlatList, Alert, ImageBackground, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { apiFetch } from '../../src/utils/api';
import { useI18n } from '../../src/i18n/i18n';

export default function Alerts() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useI18n();

  // Robust header image handling (prefetch + fallback local)
  const REMOTE_ALERTS_BG = 'https://customer-assets.emergentagent.com/job_allo-services-1/artifacts/jym9kzrr_bg-alertes.png';
  const LOCAL_ALERTS_BG = require('../../assets/headers/headers/alertes_bg.png');
  const [headerSource, setHeaderSource] = useState<any>(LOCAL_ALERTS_BG);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const url = `${REMOTE_ALERTS_BG}?v=2`;
        const ok = await Image.prefetch(url);
        if (mounted && ok) setHeaderSource({ uri: url });
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/alerts');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      console.log(e);
      Alert.alert(t('error'), t('fetchError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAlerts(); }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator /></View>;

  return (
    <View style={styles.container}>
      <ImageBackground source={headerSource} defaultSource={LOCAL_ALERTS_BG as any} style={styles.header} resizeMode="cover">
        <LinearGradient colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.65)"]} style={styles.overlay} />
        <View style={styles.headerBar}>
          <Text style={styles.headerTitle}>{t('tabAlerts')}</Text>
          <Link href="/alerts/new" asChild>
            <TouchableOpacity style={styles.btn}><Text style={styles.btnText}>{t('newAlert')}</Text></TouchableOpacity>
          </Link>
        </View>
      </ImageBackground>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc}>{item.description}</Text>
            <Text style={styles.meta}>{item.type} • {item.city || t('notAvailable')}</Text>
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
  header: { height: 260, justifyContent: 'flex-end' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  headerBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 20, paddingTop: 40 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
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